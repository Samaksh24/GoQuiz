// src/pages/GroupQuizResultsPage.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Header from '../components/Header';

// Adjust to match your Socket.IO client singleton path:
import socket  from '../Socket';

export default function GroupQuizResultsPage() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  // 1. Individual player results (retrieved immediately from navigation state or socket sync)
  const navState = location.state || {};
  const [personalScore, setPersonalScore] = useState(navState.score ?? null);
  const [totalQuestions, setTotalQuestions] = useState(navState.totalQuestions ?? null);
  const [playerName] = useState(user?.name || user?.email || navState.playerName || 'Player');

  // 2. Waiting room progress state
  const [isFinal, setIsFinal] = useState(false);
  const [finishedCount, setFinishedCount] = useState(navState.finishedCount ?? null);
  const [totalPlayers, setTotalPlayers] = useState(navState.totalPlayers ?? null);

  // 3. Leaderboard & connection state
  const [leaderboard, setLeaderboard] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [errorMessage, setErrorMessage] = useState(null);

  const currentUserId = user?._id || user?.id;

  // ---------------------------------------------------------------------------
  // Socket.IO Listeners & State Synchronization
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!roomCode) {
      setErrorMessage('Missing room code.');
      return;
    }

    // Sync state on load or reload
    socket.emit('join_results_room', {
      roomCode,
      userId: currentUserId,
    });

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    // Initial state sync (handles browser refreshes)
    const handleSyncResultsState = (data) => {
      if (data.myScore !== undefined) setPersonalScore(data.myScore);
      if (data.totalQuestions !== undefined) setTotalQuestions(data.totalQuestions);
      if (data.finishedCount !== undefined) setFinishedCount(data.finishedCount);
      if (data.totalPlayers !== undefined) setTotalPlayers(data.totalPlayers);

      if (data.isFinal && data.leaderboard) {
        setIsFinal(true);
        setLeaderboard(data.leaderboard);
      }
    };

    // Live update when other players complete their quiz
    const handleRoomProgress = (data) => {
      setFinishedCount(data.finishedCount);
      setTotalPlayers(data.totalPlayers);
    };

    // Broadcast when all players have finished
    const handleFinalLeaderboard = (data) => {
      setIsFinal(true);
      setLeaderboard(data.leaderboard || []);
      if (data.totalQuestions) setTotalQuestions(data.totalQuestions);
    };

    const handleError = (data) => {
      setErrorMessage(data?.message || 'Failed to retrieve group results.');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('sync_results_state', handleSyncResultsState);
    socket.on('room_progress', handleRoomProgress);
    socket.on('final_leaderboard', handleFinalLeaderboard);
    socket.on('quiz_error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('sync_results_state', handleSyncResultsState);
      socket.off('room_progress', handleRoomProgress);
      socket.off('final_leaderboard', handleFinalLeaderboard);
      socket.off('quiz_error', handleError);
    };
  }, [roomCode, currentUserId]);

  // ---------------------------------------------------------------------------
  // Leaderboard Calculation & Standard Competition Tie-Handling (1224 Ranking)
  // ---------------------------------------------------------------------------
  const rankedPlayers = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return [];

    // Sort descending by score
    const sorted = [...leaderboard].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    let currentRank = 1;
    return sorted.map((player, index) => {
      if (index > 0 && player.score < sorted[index - 1].score) {
        currentRank = index + 1; // Standard competition ranking
      }
      return { ...player, computedRank: currentRank };
    });
  }, [leaderboard]);

  // Winner calculation (handles single winner and multi-player ties)
  const winnerInfo = useMemo(() => {
    if (!rankedPlayers.length) return null;
    const topRankPlayers = rankedPlayers.filter((p) => p.computedRank === 1);
    const isUserWinner = topRankPlayers.some((p) => p.userId === currentUserId);

    return {
      winners: topRankPlayers,
      isTie: topRankPlayers.length > 1,
      isUserWinner,
    };
  }, [rankedPlayers, currentUserId]);

  // Percentage accuracy
  const accuracy = useMemo(() => {
    if (personalScore === null || !totalQuestions) return null;
    return Math.round((personalScore / totalQuestions) * 100);
  }, [personalScore, totalQuestions]);

  // ---------------------------------------------------------------------------
  // Render Error State
  // ---------------------------------------------------------------------------
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header activeScreen="group-results" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Results Unavailable</h3>
            <p className="text-sm text-slate-500 mb-5">{errorMessage}</p>
            <button
              type="button"
              onClick={() => navigate('/setup')}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Back to Quiz Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header activeScreen="group-results" />

      <main className="max-w-2xl w-full mx-auto py-8 sm:py-12 px-4 flex-1">
        {/* Connection Notice */}
        {!isConnected && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Reconnecting to room updates...
            </span>
            <span className="font-mono">{roomCode}</span>
          </div>
        )}

        {/* 1. Individual Results Card (Displayed Immediately) */}
        <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Quiz Completed
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Great job, {playerName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Room Code: <span className="font-mono font-semibold text-slate-700">{roomCode}</span>
          </p>

          {/* Score Box */}
          <div className="my-6 inline-flex flex-col items-center justify-center py-5 px-8 bg-slate-50 border border-slate-200/80 rounded-2xl min-w-50">
            <div className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tight">
              {personalScore !== null ? personalScore : '—'}
              <span className="text-2xl font-medium text-slate-400">
                {' '}/ {totalQuestions !== null ? totalQuestions : '—'}
              </span>
            </div>
            {accuracy !== null && (
              <span className="text-xs font-medium text-slate-500 mt-1.5">
                {accuracy}% Accuracy ({personalScore} of {totalQuestions} correct)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Your answers have been recorded on the server.
          </p>
        </section>

        {/* 2. Waiting State (Before all players have completed) */}
        {!isFinal ? (
          <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>

            <h2 className="text-base font-bold text-slate-900 mb-1">
              Waiting for Other Players
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              You've completed the quiz! We're waiting for the other players to finish before revealing the final leaderboard.
            </p>

            {/* Live Completion Progress Pill */}
            {finishedCount !== null && totalPlayers !== null && (
              <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span>
                  <strong className="text-slate-900">{finishedCount}</strong> of{' '}
                  <strong className="text-slate-900">{totalPlayers}</strong> players completed
                </span>
              </div>
            )}
          </section>
        ) : (
          /* 3. Final Leaderboard State (Appears when all players finish) */
          <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 animate-fade-in">
            {/* Winner Announcement Banner */}
            {winnerInfo && (
              <div className="mb-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-center">
                <span className="text-2xl" role="img" aria-label="trophy">🏆</span>
                <h3 className="text-base font-bold text-amber-900 mt-1">
                  {winnerInfo.isTie
                    ? `It's a tie for 1st Place!`
                    : `${winnerInfo.winners[0]?.name || 'Player'} wins the quiz!`}
                </h3>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  {winnerInfo.isUserWinner
                    ? 'Congratulations! You claimed the top spot.'
                    : `Winning score: ${winnerInfo.winners[0]?.score} pts`}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Final Leaderboard</h2>
                <p className="text-xs text-slate-500">Official verified standings</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-slate-600">
                {rankedPlayers.length} {rankedPlayers.length === 1 ? 'Player' : 'Players'}
              </span>
            </div>

            {/* Standings List */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden mb-6">
              {rankedPlayers.map((player) => {
                const isCurrent = player.userId === currentUserId;
                const rank = player.computedRank;

                return (
                  <div
                    key={player.userId}
                    className={`flex items-center justify-between p-3.5 sm:p-4 transition-colors ${
                      isCurrent ? 'bg-indigo-50/50' : 'bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          rank === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : rank === 2
                            ? 'bg-slate-200 text-slate-700 border border-slate-300'
                            : rank === 3
                            ? 'bg-amber-700/10 text-amber-900 border border-amber-700/20'
                            : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {rank}
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          {player.name || 'Anonymous Player'}
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                              YOU
                            </span>
                          )}
                        </p>
                        {player.correctCount !== undefined && (
                          <p className="text-[11px] text-slate-400">
                            {player.correctCount} correct
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <span className="text-base font-bold text-indigo-600">{player.score}</span>
                      <span className="text-xs text-slate-400 ml-1">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/quiz/groupquiz')}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs text-center"
              >
                Create Another Quiz
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="py-3 px-5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm rounded-xl transition-colors text-center"
              >
                Home
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
