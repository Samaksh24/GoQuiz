// ProgressBar.jsx
import React from 'react';

export default function ProgressBar({ current, total }) {
  const percentage = Math.min(Math.round((current / total) * 100), 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1.5">
        <span>Question {current} of {total}</span>
        <span>{percentage}% completed</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}