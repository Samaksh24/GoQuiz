// QuizHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const difficultyStyles = {
  easy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  hard: 'bg-rose-50 text-rose-700 border border-rose-200',
};

export default function QuizHistoryPage({ onStartNewQuiz }) {
  const [expandedId, setExpandedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const getHistory = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/quiz/history', {
          withCredentials: true,
        });

        // Newest attempts first
        const sorted = [...(response.data.userHistory || [])].sort(
          (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
        );
        setHistory(sorted);
      } catch (err) {
        console.log(err.response?.data);
        setError(err.response?.data?.message || 'Could not load your quiz history.');
      } finally {
        setLoading(false);
      }
    };

    getHistory();
  }, []);

  return (
     <div className="min-h-screen bg-slate-50">
          {/* 1. Header is outside, so it spans 100% full width */}
          <Header />
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quiz History</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your past attempts and progress over time
          </p>
        </div>
        {onStartNewQuiz && (
          <button
            type="button"
            onClick={onStartNewQuiz}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors shadow-xs self-start"
          >
            + New Quiz
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm">Loading your history...</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-2xl p-12 text-center text-rose-600">
          <p className="text-sm">{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm">No quiz attempts recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {history.map((attempt) => {
              const isExpanded = expandedId === attempt._id;
              const total = attempt.totalQuestions || 0;
              const percentage = total > 0 ? Math.round((attempt.score / total) * 100) : 0;
              const difficulty = (attempt.difficulty || '').toLowerCase();
              const answers = attempt.answers || [];

              return (
                <div key={attempt._id} className="transition-colors hover:bg-slate-50/50">
                  {/* Summary Row */}
                  <div
                    onClick={() => toggleExpand(attempt._id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {attempt.subject}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${
                            difficultyStyles[difficulty] || difficultyStyles.hard
                          }`}
                        >
                          {attempt.difficulty}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                        {attempt.topic}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Date: {formatDate(attempt.completedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-bold text-slate-900">
                          {attempt.score}/{attempt.totalQuestions}
                        </span>
                        <span className="text-xs text-slate-400 block">{percentage}%</span>
                      </div>
                      <span className="text-slate-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expandable Detail Panel */}
                  {isExpanded && answers.length > 0 && (
                    <div className="bg-slate-50/80 px-4 sm:px-6 py-4 border-t border-slate-100 space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Attempt Breakdown
                      </h4>
                      <div className="space-y-2">
                        {answers.map((item, idx) => {
                          // If the backend populates questionId, it will be an object
                          const q =
                            item.questionId && typeof item.questionId === 'object'
                              ? item.questionId
                              : null;
                          const selectedText =
                            q?.options?.[item.selectedIndex] ??
                            `Option ${String.fromCharCode(65 + item.selectedIndex)}`;

                          return (
                            <div
                              key={`${attempt._id}-${idx}`}
                              className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs flex items-start justify-between gap-4"
                            >
                              <div>
                                <p className="font-medium text-slate-800 mb-1">
                                  {idx + 1}. {q?.question ?? `Question ${idx + 1}`}
                                </p>
                                <p className="text-slate-500">
                                  Answer:{' '}
                                  <span className="font-semibold text-slate-700">
                                    {selectedText}
                                  </span>
                                </p>
                              </div>
                              <span
                                className={`shrink-0 font-semibold px-2 py-0.5 rounded text-[11px] ${
                                  item.isCorrect
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {item.isCorrect ? 'Correct' : 'Missed'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}