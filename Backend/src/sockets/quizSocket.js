import { randomBytes } from "node:crypto";
import User from "../models/User.js";
import { generateGroupQuestions } from "../services/groupgemini.js";

const quizRooms = new Map();
const playerQuizProgress = new Map();

const QUESTION_TIME_MS = 45_000;  // per-player time for each question
const START_DELAY_MS = 3_000;     // shared countdown before everyone's question 1
const READY_TIMEOUT_MS = 10_000;  // max wait for players to load the quiz page

console.log("QUIZ ROOM MAP INITIALIZED");

export default function setupQuizSockets(io) {
  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);

    socket.on("create-room", async (quizConfig) => {
      console.log("Room creation request received");

      try {
        const roomCode = generateRoomCode();

        const questions = await generateGroupQuestions({
          subject: quizConfig.subject,
          topic: quizConfig.topic,
          difficulty: quizConfig.difficulty,
          count: quizConfig.count,
        });

        const roomInfo = {
          hostId: socket.user._id,
          quizConfig,
          status: "waiting", // waiting -> starting -> running
          players: [userId],
          questions,
          ready: new Set(),
          startsAt: null,
          readyTimer: null,
          resultsFinal: false, // (was misspelled "esultsFinal")
          leaderboard: null,
        };

        quizRooms.set(roomCode, roomInfo);
        socket.join(roomCode);
        socket.emit("room-created", roomCode);
      } catch (error) {
        console.error("Group question generation failed:", error);
        socket.emit("room-creation-error", "Failed to generate quiz questions. Please try again.");
      }
    });

    socket.on("get-room-info", async (roomCode) => {
      const roomInfo = quizRooms.get(roomCode);
      if (!roomInfo) {
        return socket.emit("room-info-error", "Room not found");
      }

      const players = await User.find({
        _id: { $in: roomInfo.players },
      }).select("_id name");

      socket.emit("room-info", {
        roomCode,
        hostId: roomInfo.hostId.toString(),
        status: roomInfo.status,
        players: players.map((player) => ({
          id: player._id.toString(),
          name: player.name,
        })),
        quizConfig: roomInfo.quizConfig,
      });
    });

    socket.on("join-room", async (roomCode) => {
      if (!quizRooms.has(roomCode)) {
        return socket.emit("join-error", "Invalid roomcode");
      }
      const roomInfo = quizRooms.get(roomCode);
      if (roomInfo.status !== "waiting") {
        return socket.emit("join-error", "Room is no longer accepting players");
      }
      if (roomInfo.players.includes(userId)) {
        return socket.emit("join-error", "Player already joined");
      }
      roomInfo.players.push(userId);
      socket.join(roomCode);
      socket.emit("room-joined", roomCode);

      const players = await User.find({
        _id: { $in: roomInfo.players },
      }).select("_id name");

      io.to(roomCode).emit(
        "player-joined",
        players.map((player) => ({
          id: player._id.toString(),
          name: player.name,
        }))
      );
    });

    socket.on("start-quiz", (roomCode) => {
      const roomInfo = quizRooms.get(roomCode);
      if (!roomInfo) {
        return socket.emit("invalid-room", "Room does not exists");
      }
      if (roomInfo.hostId.toString() !== userId) {
        return socket.emit("Auth-error", "only the host can start quiz");
      }
      if (roomInfo.status !== "waiting") {
        return socket.emit("start-error", "room is not accepting players");
      }

      for (const id of roomInfo.players) {
        playerQuizProgress.set(`${roomCode}:${id}`, {
          currentQuestionIndex: 0,
          score: 0,
          questionDeadline: null,
          answers: [],
          finished: false,
          timer: null,
        });
      }

      roomInfo.status = "starting";
      roomInfo.ready = new Set();
      roomInfo.startsAt = null;

      io.to(roomCode).emit("quiz-started");

      roomInfo.readyTimer = setTimeout(
        () => beginQuiz(io, roomCode),
        READY_TIMEOUT_MS
      );
    });

    socket.on("quiz-ready", (roomCode) => {
      const roomInfo = quizRooms.get(roomCode);
      if (!roomInfo || !roomInfo.players.includes(userId)) return;

      socket.join(roomCode); // also covers reconnects

      if (roomInfo.status === "starting") {
        roomInfo.ready.add(userId);

        if (roomInfo.startsAt) {
          socket.emit("quiz-countdown", {
            startsAt: roomInfo.startsAt,
            serverTime: Date.now(),
          });
        } else if (roomInfo.ready.size >= roomInfo.players.length) {
          beginQuiz(io, roomCode);
        }
        return;
      }

      if (roomInfo.status === "running") {
        const progress = playerQuizProgress.get(`${roomCode}:${userId}`);
        if (!progress) return;
        if (progress.finished) {
          return socket.emit("player-quiz-completed", {
            score: progress.score,
            totalQuestions: roomInfo.questions.length,
          });
        }
        emitCurrentQuestion(io, roomCode, userId);
      }
    });

    socket.on("submit-quiz-answer", ({ roomCode, questionIndex, selectedOption }) => {
      const progressKey = `${roomCode}:${userId}`;
      const roomInfo = quizRooms.get(roomCode);
      const progress = playerQuizProgress.get(progressKey);

      if (!roomInfo || !progress || progress.finished) return;
      if (questionIndex !== progress.currentQuestionIndex) return;
      if (!progress.questionDeadline || Date.now() > progress.questionDeadline) return;
      if (progress.answers.some((a) => a.questionIndex === questionIndex)) return;

      const question = roomInfo.questions[questionIndex];
      if (
        !question ||
        !Number.isInteger(selectedOption) ||
        selectedOption < 0 ||
        selectedOption >= question.options.length
      ) {
        return;
      }

      const isCorrect = selectedOption === question.correctAnswer;
      if (isCorrect) progress.score++;

      progress.answers.push({ questionIndex, selectedOption, isCorrect });

      if (progress.timer) {
        clearTimeout(progress.timer);
        progress.timer = null;
      }

      progress.currentQuestionIndex++;

      if (progress.currentQuestionIndex >= roomInfo.questions.length) {
        finishPlayer(io, roomCode, userId);
        return;
      }
      sendQuestionToPlayer(io, roomCode, userId);
    });

    // ------------------------------------------------------------------
    // Results page. Called on mount AND on refresh. Replies with the full
    // current state, so it never matters whether this player arrived
    // before or after other players finished.
    // ------------------------------------------------------------------
    socket.on("join_results_room", ({ roomCode } = {}) => {
      const roomInfo = quizRooms.get(roomCode);
      if (!roomInfo || !roomInfo.players.includes(userId)) {
        return socket.emit("quiz_error", { message: "Room not found or you are not part of it." });
      }

      socket.join(roomCode);

      const progress = playerQuizProgress.get(`${roomCode}:${userId}`);
      const { finishedCount, totalPlayers } = getFinishedCounts(roomCode, roomInfo);

      socket.emit("sync_results_state", {
        myScore: progress?.score,
        totalQuestions: roomInfo.questions.length,
        finishedCount,
        totalPlayers,
        isFinal: roomInfo.resultsFinal,
        leaderboard: roomInfo.resultsFinal ? roomInfo.leaderboard : undefined,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

const generateRoomCode = () => {
  let roomCode = randomBytes(3).toString("hex").toUpperCase();
  while (quizRooms.has(roomCode)) {
    roomCode = randomBytes(3).toString("hex").toUpperCase();
  }
  return roomCode;
};

function getFinishedCounts(roomCode, roomInfo) {
  let finishedCount = 0;
  for (const id of roomInfo.players) {
    if (playerQuizProgress.get(`${roomCode}:${id}`)?.finished) finishedCount++;
  }
  return { finishedCount, totalPlayers: roomInfo.players.length };
}

// Single place where a player is marked done (answered last question OR timed out).
function finishPlayer(io, roomCode, userId) {
  const roomInfo = quizRooms.get(roomCode);
  const progress = playerQuizProgress.get(`${roomCode}:${userId}`);
  if (!roomInfo || !progress) return;

  progress.finished = true;
  if (progress.timer) {
    clearTimeout(progress.timer);
    progress.timer = null;
  }

  const { finishedCount, totalPlayers } = getFinishedCounts(roomCode, roomInfo);

  io.to(`user:${userId}`).emit("player-quiz-completed", {
    score: progress.score,
    totalQuestions: roomInfo.questions.length,
    finishedCount,
    totalPlayers,
  });

  io.to(roomCode).emit("room_progress", { finishedCount, totalPlayers });

  if (finishedCount >= totalPlayers) {
    publishFinalLeaderboard(io, roomCode).catch((err) =>
      console.error("Failed to publish leaderboard:", err)
    );
  }
}

async function publishFinalLeaderboard(io, roomCode) {
  const roomInfo = quizRooms.get(roomCode);
  if (!roomInfo || roomInfo.resultsFinal) return;
  roomInfo.resultsFinal = true; // set first so it can't run twice

  const users = await User.find({ _id: { $in: roomInfo.players } }).select("_id name");
  const nameById = new Map(users.map((u) => [u._id.toString(), u.name]));

  roomInfo.leaderboard = roomInfo.players
    .map((id) => {
      const progress = playerQuizProgress.get(`${roomCode}:${id}`);
      const score = progress?.score ?? 0;
      return {
        userId: id,
        name: nameById.get(id) || "Anonymous Player",
        score,
        correctCount: score,
      };
    })
    .sort((a, b) => b.score - a.score);

  io.to(roomCode).emit("final_leaderboard", {
    leaderboard: roomInfo.leaderboard,
    totalQuestions: roomInfo.questions.length,
  });
}

function beginQuiz(io, roomCode) {
  const roomInfo = quizRooms.get(roomCode);
  if (!roomInfo || roomInfo.status !== "starting" || roomInfo.startsAt) return;

  clearTimeout(roomInfo.readyTimer);
  roomInfo.readyTimer = null;
  roomInfo.startsAt = Date.now() + START_DELAY_MS;

  io.to(roomCode).emit("quiz-countdown", {
    startsAt: roomInfo.startsAt,
    serverTime: Date.now(),
  });

  setTimeout(() => {
    roomInfo.status = "running";
    for (const id of roomInfo.players) {
      sendQuestionToPlayer(io, roomCode, id);
    }
  }, START_DELAY_MS);
}

function emitCurrentQuestion(io, roomCode, userId) {
  const roomInfo = quizRooms.get(roomCode);
  const progress = playerQuizProgress.get(`${roomCode}:${userId}`);
  if (!roomInfo || !progress || progress.finished || !progress.questionDeadline) return;

  const questionIndex = progress.currentQuestionIndex;
  const question = roomInfo.questions[questionIndex];
  if (!question) return;

  io.to(`user:${userId}`).emit("next-question", {
    questionIndex,
    totalQuestions: roomInfo.questions.length,
    question: {
      question: question.question,
      options: question.options,
    },
    deadline: progress.questionDeadline,
    serverTime: Date.now(),
  });
}

function sendQuestionToPlayer(io, roomCode, userId) {
  const roomInfo = quizRooms.get(roomCode);
  if (!roomInfo) return;

  const progressKey = `${roomCode}:${userId}`;
  const progress = playerQuizProgress.get(progressKey);
  if (!progress || progress.finished) return;

  if (progress.timer) {
    clearTimeout(progress.timer);
    progress.timer = null;
  }

  const question = roomInfo.questions[progress.currentQuestionIndex];
  if (!question) {
    finishPlayer(io, roomCode, userId);
    return;
  }

  const deadline = Date.now() + QUESTION_TIME_MS;
  progress.questionDeadline = deadline;

  emitCurrentQuestion(io, roomCode, userId);

  progress.timer = setTimeout(() => {
    const current = playerQuizProgress.get(progressKey);
    if (!current || current.finished || current.questionDeadline !== deadline) return;

    current.answers.push({
      questionIndex: current.currentQuestionIndex,
      selectedOption: null,
      isCorrect: false,
    });

    current.currentQuestionIndex++;

    if (current.currentQuestionIndex >= roomInfo.questions.length) {
      finishPlayer(io, roomCode, userId);
      return;
    }

    sendQuestionToPlayer(io, roomCode, userId);
  }, QUESTION_TIME_MS);
}