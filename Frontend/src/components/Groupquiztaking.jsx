import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Header from "../components/Header";
import ProgressBar from "../components/ProgressBar";
import OptionButton from "../components/OptionButton";
import socket from "../Socket.js";

export default function GroupQuizTakingPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [timeLeft, setTimeLeft] = useState(45);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Shared start countdown + server clock offset
  const [startsAt, setStartsAt] = useState(null); // in LOCAL clock ms
  const [countdown, setCountdown] = useState(0);
  const clockOffsetRef = useRef(0); // serverTime - Date.now()

  // Keep the latest values available to socket handlers without re-subscribing.
  const latestRef = useRef({ totalQuestions, userName: user?.name });
  useEffect(() => {
    latestRef.current = { totalQuestions, userName: user?.name };
  }, [totalQuestions, user?.name]);

  // Listen for the events emitted by the backend.
  useEffect(() => {
    if (!roomCode) {
      setErrorMessage("Missing room code.");
      setIsLoading(false);
      return;
    }

    const handleNextQuestion = (data) => {
      if (data.serverTime) {
        clockOffsetRef.current = data.serverTime - Date.now();
      }

      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setCurrentQuestion(data.question);
      setDeadline(data.deadline);
      setStartsAt(null);
      setTimeLeft(
        Math.max(
          0,
          Math.ceil((data.deadline - (Date.now() + clockOffsetRef.current)) / 1000)
        )
      );
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsLoading(false);
      setErrorMessage(null);
    };

    const handleCountdown = ({ startsAt: serverStartsAt, serverTime }) => {
      clockOffsetRef.current = serverTime - Date.now();
      setStartsAt(serverStartsAt - clockOffsetRef.current);
      setIsLoading(false);
      setErrorMessage(null);
    };

    // CHANGED: go straight to the results page (waiting room + leaderboard).
    const handleQuizCompleted = (data) => {
      navigate(`/quiz/group/${roomCode}/results`, {
        replace: true,
        state: {
          score: data.score ?? 0,
          totalQuestions: data.totalQuestions ?? latestRef.current.totalQuestions,
          playerName: latestRef.current.userName,
          finishedCount: data.finishedCount,
          totalPlayers: data.totalPlayers,
        },
      });
    };

    const handleRoomInfoError = (message) => {
      setErrorMessage(
        typeof message === "string" ? message : "Room not found."
      );
      setIsLoading(false);
    };

    const handleRoomInfo = (data) => {
      if (data.status === "waiting") {
        setErrorMessage("The host hasn't started the quiz yet.");
        setIsLoading(false);
      }
    };

    const handleServerError = (message) => {
      setErrorMessage(
        typeof message === "string"
          ? message
          : message?.message || "An error occurred."
      );
      setIsLoading(false);
    };

    const sendReady = () => socket.emit("quiz-ready", roomCode);

    // 1) register ALL listeners first
    socket.on("next-question", handleNextQuestion);
    socket.on("quiz-countdown", handleCountdown);
    socket.on("player-quiz-completed", handleQuizCompleted);
    socket.on("room-info", handleRoomInfo);
    socket.on("room-info-error", handleRoomInfoError);
    socket.on("invalid-room", handleServerError);
    socket.on("Auth-error", handleServerError);
    socket.on("start-error", handleServerError);
    socket.on("connect", sendReady); // re-sync after a reconnect

    socket.emit("get-room-info", roomCode);

    // 2) only THEN tell the server we're ready.
    if (socket.connected) {
      sendReady();
    }

    return () => {
      socket.off("next-question", handleNextQuestion);
      socket.off("quiz-countdown", handleCountdown);
      socket.off("player-quiz-completed", handleQuizCompleted);
      socket.off("room-info", handleRoomInfo);
      socket.off("room-info-error", handleRoomInfoError);
      socket.off("invalid-room", handleServerError);
      socket.off("Auth-error", handleServerError);
      socket.off("start-error", handleServerError);
      socket.off("connect", sendReady);
    };
  }, [roomCode, navigate]);

  // "Starting in 3… 2… 1…" ticker
  useEffect(() => {
    if (!startsAt) return;

    const tick = () => {
      setCountdown(Math.max(0, Math.ceil((startsAt - Date.now()) / 1000)));
    };

    tick();
    const intervalId = setInterval(tick, 200);
    return () => clearInterval(intervalId);
  }, [startsAt]);

  // Countdown based on the server deadline (clock-offset corrected).
  useEffect(() => {
    if (!deadline || isAnswerSubmitted) {
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((deadline - (Date.now() + clockOffsetRef.current)) / 1000)
      );
      setTimeLeft(remaining);
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 250);
    return () => clearInterval(intervalId);
  }, [deadline, isAnswerSubmitted]);

  const handleSelectOption = (index) => {
    if (isAnswerSubmitted || !currentQuestion || timeLeft <= 0) {
      return;
    }

    setSelectedOption(index);
    setIsAnswerSubmitted(true);

    socket.emit("submit-quiz-answer", {
      roomCode,
      questionIndex,
      selectedOption: index,
    });
  };

  const timerBadgeColor = useMemo(() => {
    if (timeLeft <= 10) {
      return "text-rose-600 bg-rose-50 border-rose-200 animate-pulse";
    }
    if (timeLeft <= 20) {
      return "text-amber-600 bg-amber-50 border-amber-200";
    }
    return "text-indigo-600 bg-indigo-50 border-indigo-100";
  }, [timeLeft]);

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header activeScreen="group-quiz" />

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Unable to Load Quiz
            </h3>

            <p className="text-sm text-slate-500 mb-5">{errorMessage}</p>

            <button
              type="button"
              onClick={() => navigate("/quiz/setup")}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
            >
              Back to Quiz Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Shared countdown screen, shown until the first question arrives.
  if (startsAt && !currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header activeScreen="group-quiz" />

        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Quiz starts in
          </p>

          <p className="text-7xl font-extrabold text-indigo-600 mt-3">
            {countdown}
          </p>

          <p className="text-xs text-slate-500 mt-4">
            Room {roomCode} · Get ready!
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header activeScreen="group-quiz" />

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />

          <h2 className="text-base font-semibold text-slate-800">
            Waiting for all players...
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Connecting to Room {roomCode}
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header activeScreen="group-quiz" />

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Waiting for your question...
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Your question will appear when the server sends it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header activeScreen="group-quiz" />

      <div className="max-w-2xl w-full mx-auto py-6 sm:py-8 px-4 flex-1">
        <div className="mb-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Room
              </span>

              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                {roomCode}
              </span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${timerBadgeColor}`}
            >
              <span>{timeLeft}s remaining</span>
            </div>
          </div>

          <ProgressBar current={questionIndex + 1} total={totalQuestions} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Question {questionIndex + 1} of {totalQuestions}
            </span>

            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mt-4 leading-snug">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((optionText, index) => (
              <OptionButton
                key={`${questionIndex}-${index}`}
                index={index}
                text={optionText}
                isSelected={selectedOption === index}
                isCorrect={false}
                isAnswerSubmitted={isAnswerSubmitted}
                onClick={handleSelectOption}
                disabled={isAnswerSubmitted || timeLeft <= 0}
              />
            ))}
          </div>

          {isAnswerSubmitted && (
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <p className="text-xs font-semibold text-indigo-950">
                Answer submitted!
              </p>

              <p className="text-xs text-indigo-700 mt-1">
                Your next question will appear automatically. Other players can
                progress independently.
              </p>
            </div>
          )}

          {!isAnswerSubmitted && timeLeft === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-medium text-amber-800">
                Time expired. Waiting for the server to advance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}