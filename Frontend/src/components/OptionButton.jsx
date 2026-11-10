// OptionButton.jsx
import React from 'react';

export default function OptionButton({
  index,
  text,
  isSelected,
  isCorrect,
  isAnswerSubmitted,
  onClick,
  disabled,
}) {
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const letter = optionLetters[index] || String(index + 1);

  // Determine styling based on submission state and correctness
  let containerStyles = 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-700';
  let badgeStyles = 'bg-slate-100 text-slate-600 border-slate-200';

  if (isAnswerSubmitted) {
    if (isCorrect) {
      containerStyles = 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-medium';
      badgeStyles = 'bg-emerald-600 text-white border-emerald-600';
    } else if (isSelected && !isCorrect) {
      containerStyles = 'border-rose-400 bg-rose-50/60 text-rose-950 font-medium';
      badgeStyles = 'bg-rose-500 text-white border-rose-500';
    } else {
      containerStyles = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
      badgeStyles = 'bg-slate-100 text-slate-400 border-slate-200';
    }
  } else if (isSelected) {
    containerStyles = 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20';
    badgeStyles = 'bg-indigo-600 text-white border-indigo-600';
  }

  return (
    <button
      type="button"
      onClick={() => onClick(index)}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center gap-3.5 shadow-sm ${containerStyles}`}
    >
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 border transition-colors ${badgeStyles}`}
      >
        {letter}
      </span>
      <span className="text-sm leading-snug flex-1">{text}</span>
    </button>
  );
}