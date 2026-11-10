import React, { useContext, useState } from 'react';
import socket from '../Socket.js';
import { MOCK_SUBJECTS } from '../mockData.js';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Header from './Header'; // Adjust path if Header is in another directory (e.g. '../components/Header')

export default function GroupQuizSetupPage({ onRoomCreated, subjects = MOCK_SUBJECTS }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Form selections
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'Computer Science');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(10);

  // Join room toggle & input
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleNav = (screenId) => {
    if (screenId === 'setup') navigate('/setup');
    else if (screenId === 'history') navigate('/history');
    else navigate(`/${screenId}`);
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    setIsCreating(true);

    const groupQuizConfig = {
      subject: selectedSubject,
      topic: topic.trim() || 'General',
      difficulty: difficulty.toLowerCase(),
      count: Number(questionCount),
      host: user?.name || user?.email || 'Guest Host',
      createdAt: new Date().toISOString(),
    };

      socket.once("room-created", (roomCode) => {
        setIsCreating(false);
       navigate(`/quiz/room/${roomCode}`);
      });

      socket.once("room-error", (message) => {
       setIsCreating(false);
       console.error(message);
      });

      socket.emit("create-room", groupQuizConfig);
 };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const cleanCode = joinRoomCode.trim().toUpperCase();

    if (!cleanCode) {
      setJoinError('Please enter a valid room code.');
      return;
    }

    setJoinError('');

   
socket.once('room-joined', (roomCode) => {
  navigate(`/quiz/room/${roomCode}`);
});

socket.once('join-error', (message) => {
  setJoinError(message);
});

socket.emit('join-room', cleanCode);

  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Pinned App Header */}
      <Header activeScreen="group-setup" onNavigate={handleNav} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6">
        <div className="max-w-xl w-full mx-auto">
          {/* Page Heading */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Multiplayer</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create Group Quiz
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure your quiz, invite friends, and compete together.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-6 sm:p-8">
            <form onSubmit={handleCreateRoom} className="space-y-6">
              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((sub) => {
                    const isSelected = selectedSubject === sub.name;
                    return (
                      <button
                        key={sub.id || sub.name}
                        type="button"
                        onClick={() => setSelectedSubject(sub.name)}
                        className={`px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-lg border text-left transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        {isSelected && (
                          <svg className="w-4 h-4 text-indigo-600 shrink-0 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic / Focus Area */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Topic / Focus Area
                  </label>
                  <span className="text-[11px] text-slate-400">Optional</span>
                </div>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Binary Trees, Java Collections"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>

              {/* Difficulty Segmented Control */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Difficulty
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
                  {difficulties.map((diff) => {
                    const isSelected = difficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                          isSelected
                            ? 'bg-white text-slate-900 shadow-xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Count Slider & Number Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Question Count
                  </label>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {questionCount}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-md appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={questionCount}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(20, Number(e.target.value) || 1));
                      setQuestionCount(val);
                    }}
                    className="w-14 px-2 py-1 text-center text-xs font-medium rounded-md border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Quiz Summary Section */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/90 text-xs">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
                  Room Configuration Summary
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                  <div className="bg-white p-2 rounded border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Subject</span>
                    <span className="font-semibold text-slate-800 truncate block mt-0.5">{selectedSubject}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Topic</span>
                    <span className="font-semibold text-slate-800 truncate block mt-0.5">
                      {topic.trim() || 'General'}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Difficulty</span>
                    <span className="font-semibold text-indigo-700 block mt-0.5">{difficulty}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Questions</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{questionCount} Qs</span>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isCreating ? 'Creating Room...' : 'Create Room'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

              {/* Join Existing Room Section */}
              <div className="pt-2 text-center border-t border-slate-100">
                {!showJoinInput ? (
                  <p className="text-xs text-slate-500">
                    Have an invite code?{' '}
                    <button
                      type="button"
                      onClick={() => setShowJoinInput(true)}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline focus:outline-none"
                    >
                      Join a Room
                    </button>
                  </p>
                ) : (
                  <div className="mt-2 text-left bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Enter 6-Character Room Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowJoinInput(false);
                          setJoinError('');
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={8}
                        value={joinRoomCode}
                        onChange={(e) => {
                          setJoinRoomCode(e.target.value.toUpperCase());
                          if (joinError) setJoinError('');
                        }}
                        placeholder="e.g. ROOM42"
                        className="flex-1 px-3 py-1.5 text-sm uppercase tracking-wider rounded-md border border-slate-300 bg-white font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={handleJoinRoom}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-md transition-colors"
                      >
                        Join
                      </button>
                    </div>
                    {joinError && (
                      <p className="text-xs text-rose-500 mt-1.5 font-medium">{joinError}</p>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
