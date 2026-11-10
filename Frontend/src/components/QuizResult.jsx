// QuizResultsPage.jsx
import React from 'react';
import Header from './Header';
import { Navigate, useNavigate } from 'react-router-dom';

export default function QuizResultsPage({
  onTryAnotherQuiz,
  totalScore,
  totalQuestions,
}) {

    const quizResult = JSON.parse(sessionStorage.getItem('quizResult'));
    const results = JSON.parse(sessionStorage.getItem('userAnswers')) || [];
  // If results array is provided, calculate score directly
  const computedTotal = quizResult.userQuizAttempt.totalQuestions;
  const computedScore = quizResult.userQuizAttempt.score;

  const percentage = computedTotal > 0 ? Math.round((computedScore / computedTotal) * 100) : 0;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Header is outside, so it spans 100% full width */}
      <Header />
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Score Summary Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 text-center mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Quiz Completed
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Your Results</h1>

        <div className="my-6 inline-flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tight">
            {computedScore} <span className="text-2xl font-medium text-slate-400">/ {computedTotal}</span>
          </div>
          <span className="text-xs font-medium text-slate-500 mt-1">{percentage}% Accuracy</span>
        </div>

        <div>
          <button
            type="button"
            onClick={()=>{navigate('/')}}
            className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Home</span>
          </button>
        </div>
      </div>

      {/* Question Breakdown List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 px-1">
          Review Questions ({results.length})
        </h2>

        {results.map((item, index) => {
          return (
            <div
              key={item.questionId || index}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                item.isCorrect ? 'border-emerald-200' : 'border-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    item.isCorrect
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {item.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-800 mb-3">{item.question}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block font-medium">Your answer:</span>
                  <span className={`font-semibold ${item.isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {item.userAnswer || 'None'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
                  <span className="text-emerald-600 block font-medium">Correct answer:</span>
                  <span className="font-semibold text-emerald-800">{item.correctAnswer}</span>
                </div>
              </div>

              {item.explanation && (
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                  <span className="font-semibold text-slate-700 block mb-0.5">Explanation:</span>
                  {item.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}