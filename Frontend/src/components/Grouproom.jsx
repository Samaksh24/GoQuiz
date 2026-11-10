import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Header from './Header'; // Adjust path if Header is in '../components/Header'
import socket from '../Socket';
export default function GroupQuizRoomPage({
  // Props with defaults for easy testing / zero-prop drop-in:
  roomCode: propRoomCode,
  players: propPlayers,
  currentUserId: propCurrentUserId,
  hostId: propHostId,
  quizConfig: propQuizConfig,
  onStartQuiz,
  onLeaveRoom,
}) {
  
  const { roomCode: paramRoomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
    const activeRoomCode = propRoomCode || paramRoomCode || 'A3F82B';
  useEffect(() => {
   if (!activeRoomCode) return;

  const handleRoomInfo = (data) => {
    console.log('Room info received:', data);
    setRoomInfo(data);
  };

     const handlePlayerJoined = (players) => {
      setRoomInfo((prev) => {
       if (!prev) return prev;

      return {
      ...prev,
      players,
     };
     });
    };
         
  const handleConnect = () => {
    console.log('Socket connected, requesting room info:', activeRoomCode);
    socket.emit('get-room-info', activeRoomCode);
 };

 const handleQuizStarted = () => {
  navigate(`/quiz/group/${activeRoomCode}`);
};

 // If the server rejects the start (not host, already started...), re-enable the button
 const handleStartError = (message) => {
  console.error('Start error:', message);
  setIsStarting(false);
};
  
  socket.on('quiz-started', handleQuizStarted);
  socket.on('room-info', handleRoomInfo);
  socket.on('player-joined', handlePlayerJoined);
  socket.on('start-error', handleStartError);
  socket.on('Auth-error', handleStartError);

 if (socket.connected) {
  handleConnect();
 } else {
   socket.once('connect', handleConnect);
 }

 return () => {
  socket.off('room-info', handleRoomInfo);
  socket.off('player-joined', handlePlayerJoined);
  socket.off('connect', handleConnect);
  socket.off('quiz-started', handleQuizStarted);
  socket.off('start-error', handleStartError);
  socket.off('Auth-error', handleStartError);
 };
}, [activeRoomCode]);
  // 1. Resolve room code from props or URL route (/room/:roomCode)


  // 2. Resolve current user ID (from props, UserContext, or fallback)
  const resolvedCurrentUserId = propCurrentUserId || user?.id || user?._id || 'user_1';

  // 3. Fallback host ID and player list for UI testing
  const resolvedHostId = roomInfo?.hostId || propHostId || 'user_1';

  const defaultPlayers = [
    { id: 'user_1', name: user?.name || 'Alex Smith', isConnected: true },
    { id: 'user_2', name: 'Jordan Taylor', isConnected: true },
    { id: 'user_3', name: 'Sam Rivera', isConnected: false },
  ];

 const activePlayers = roomInfo
  ? roomInfo.players.map((player) => ({
      id: player.id,
      name: player.name,
      isConnected: true,
    }))
  : propPlayers || defaultPlayers;

  // 4. Default quiz info placeholder
  const activeQuizConfig = roomInfo?.quizConfig || propQuizConfig || {
    subject: 'Computer Science',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    count: 10,
    duration: '5 minutes',
  };

  // 5. Derive host status dynamically
  const isHost = String(resolvedCurrentUserId) === String(resolvedHostId);

  // Local UI state
  const [copied, setCopied] = useState(false);

  // Clipboard copy handler
  const handleCopyCode = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(activeRoomCode);
      } else {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = activeRoomCode;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  // CHANGED: the host no longer navigates directly. It tells the server to start;
  // the server replies with 'quiz-started' to everyone and the listener above
  // navigates every player (host included) at the same time.
  const handleStartClick = () => {
    if (!isHost || isStarting) return;

    setIsStarting(true);
    socket.emit('start-quiz', activeRoomCode);
  };

  const handleLeaveClick = () => {
    // TODO: Connect with Socket.IO backend to emit leave room event
    // Example: socket.emit('leave_room', { roomCode: activeRoomCode, userId: resolvedCurrentUserId });
    if (onLeaveRoom) {
      onLeaveRoom(activeRoomCode);
    } else {
      navigate('/quiz/groupquiz');
    }
  };

  const handleNav = (screenId) => {
    if (screenId === 'setup') navigate('/quiz/groupquiz');
    else if (screenId === 'history') navigate('/quiz/history');
    else navigate(`/${screenId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Pinned App Header */}
      <Header activeScreen="group-room" onNavigate={handleNav} />

      {/* Main Content */}
      <main className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-3xl w-full mx-auto space-y-6">

          {/* Top Bar: Room Header & Code Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Waiting for players
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Group Quiz Lobby
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Share this code with your friends to invite them.
              </p>
            </div>

            {/* Room Code Box */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200 rounded-lg p-2 sm:p-2.5">
              <div className="px-3 py-1 font-mono text-xl sm:text-2xl font-extrabold tracking-widest text-slate-900 select-all">
                {activeRoomCode}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
                title="Copy Room Code"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quiz Information Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Quiz Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Subject</span>
                <span className="font-semibold text-slate-800 text-sm truncate block mt-0.5">
                  {activeQuizConfig.subject || 'General'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Topic</span>
                <span className="font-semibold text-slate-800 text-sm truncate block mt-0.5">
                  {activeQuizConfig.topic || 'General'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Difficulty</span>
                <span className="font-semibold text-indigo-700 text-sm capitalize block mt-0.5">
                  {activeQuizConfig.difficulty || 'Medium'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Questions</span>
                <span className="font-semibold text-slate-800 text-sm block mt-0.5">
                  {activeQuizConfig.count || 10} Qs
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Duration</span>
                <span className="font-semibold text-slate-800 text-sm block mt-0.5">
                  {activeQuizConfig.duration || '5 minutes'}
                </span>
              </div>
            </div>
          </div>

          {/* Players in this room Section */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Players in this room
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activePlayers.length} {activePlayers.length === 1 ? 'player' : 'players'} connected
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                {activePlayers.length} / 10 Max
              </span>
            </div>

            {/* Players List */}
            {activePlayers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                <p className="text-xs">No players have joined yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activePlayers.map((player) => {
                  // Derive host status per player
                  const playerIsHost = String(player.id) === String(resolvedHostId);
                  const isCurrent = String(player.id) === String(resolvedCurrentUserId);

                  return (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                        playerIsHost
                          ? 'border-indigo-200 bg-indigo-50/40'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 border ${
                            playerIsHost
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {player.name ? player.name.charAt(0) : 'P'}
                        </div>

                        {/* Name & current user tag */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900 truncate">
                              {player.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                (You)
                              </span>
                            )}
                            {playerIsHost && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-600 text-white shadow-2xs">
                                HOST
                              </span>
                            )}
                          </div>

                          {/* Connection Status indicator */}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                player.isConnected !== false
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-300'
                              }`}
                            />
                            <span className="text-[11px] text-slate-400">
                              {player.isConnected !== false ? 'Connected' : 'Disconnected'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Footer & Host Controls */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-6 space-y-4">
            {isHost ? (
              <div>
                <button
                  type="button"
                  onClick={handleStartClick}
                  disabled={isStarting}
                  className={`w-full py-3 px-4 font-semibold text-sm rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 ${
                    isStarting
                      ? 'bg-indigo-400 text-white cursor-wait'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600/30'
                  }`}
                >
                  {isStarting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Starting Quiz...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Quiz</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-500 mt-2">
                  You're the host. Start when everyone is ready.
                </p>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs font-medium">
                  <svg className="w-4 h-4 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Waiting for the host to start the quiz…</span>
                </div>
              </div>
            )}

            {/* Room Actions: Leave Room */}
            <div className="pt-2 border-t border-slate-100 flex justify-center">
              <button
                type="button"
                onClick={handleLeaveClick}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors py-1 px-3 rounded hover:bg-rose-50"
              >
                Leave Room
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}