
import React, { useContext, useState } from 'react';
import { MOCK_SUBJECTS } from '../mockData.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Header from './Header';

export default function QuizSetupPage({ onStartQuiz, subjects = MOCK_SUBJECTS }) {
  const { user } = useContext(UserContext);
  const isDemo = user === null;
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'Computer Science');
  const [topic, setTopic] = useState(isDemo ? '' : 'Mixed Topics');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const navigate = useNavigate();

  const handleNav = (screenId) => {
    if (screenId === 'setup') navigate('/setup');
    else if (screenId === 'history') navigate('/history');
    else navigate(`/${screenId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isGenerating) return;

    setIsGenerating(true);

    const quizConfig = {
      subject: selectedSubject,
      topic: topic.trim() || 'General',
      difficulty: difficulty.toLowerCase(),
      count: Number(questionCount),
      startedAt: new Date().toISOString(),
    };

    try {
      let response;

      if (!isDemo) {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/quiz/start`,
          quizConfig,
          { withCredentials: true }
        );

        sessionStorage.clear();
        sessionStorage.setItem('quizQuestions', JSON.stringify(response.data.questions));
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/quiz/demo`,
          { subject: selectedSubject, count: Number(questionCount) }
        );

        sessionStorage.clear();
        sessionStorage.setItem('quizQuestions', JSON.stringify(response.data.demoQuestions));
      }

      sessionStorage.setItem('quizConfig', JSON.stringify(quizConfig));
      console.log(response.data);
      navigate('/quiz');

    } catch (error) {
      console.log(error.response?.data || error.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Header activeScreen="setup" onNavigate={handleNav} />

      <main className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6">
        <div className="max-w-xl w-full mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Configure New Quiz
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select your subject, topic, and difficulty to begin.
            </p>
          </div>

          {isDemo && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
              <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-semibold">Demo session active.</span> Topic input and difficulty options are locked to defaults.
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Topic / Focus Area
                  </label>
                  {!isDemo && (
                    <span className="text-[11px] text-slate-400">Optional</span>
                  )}
                </div>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={isDemo ? 'Topic selection unavailable in demo' : 'e.g. Binary Trees, Flexbox, React Hooks'}
                  disabled={isDemo || isGenerating}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors ${
                    isDemo
                      ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                  }`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Difficulty
                  </label>
                  {isDemo && (
                    <span className="text-[11px] text-slate-400">Locked to Medium</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
                  {difficulties.map((diff) => {
                    const isSelected = difficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        disabled={isDemo || isGenerating}
                        onClick={() => !isDemo && setDifficulty(diff)}
                        className={`py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                          isSelected
                            ? 'bg-white text-slate-900 shadow-xs font-semibold'
                            : isDemo
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

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
                    disabled={isGenerating}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-md appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={questionCount}
                    disabled={isGenerating}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(20, Number(e.target.value) || 1));
                      setQuestionCount(val);
                    }}
                    className="w-14 px-2 py-1 text-center text-xs font-medium rounded-md border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`w-full py-2.5 px-4 bg-indigo-600 text-white font-medium text-sm rounded-lg transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/30 flex items-center justify-center gap-2 ${
                    isGenerating
                      ? 'opacity-80 cursor-not-allowed'
                      : 'hover:bg-indigo-700 cursor-pointer'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span>Generating Questions...</span>
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
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
