// LandingPage.jsx
import React, { useContext } from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

export default function LandingPage({
  onGetStarted,
  onSelectCategory,
}) {
  const features = [
    {
      title: 'Instant Explanations',
      description: 'Get immediate breakdown and reasoning for every question right as you answer.',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      title: 'Tailored Difficulty',
      description: 'Dial in your level from Easy fundamentals to Hard edge cases with customizable question counts.',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
    {
      title: 'Track Performance',
      description: 'Review complete historical quiz attempts, identify knowledge gaps, and watch your scores rise.',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const popularTopics = [
  { name: 'Computer Science', count: 'Core Concepts', tag: 'CS' },
  { name: 'Web Development', count: 'Build & Develop', tag: 'Frontend' },
  { name: 'Algorithms & Data Structures', count: 'Problem Solving', tag: 'Core' },
  { name: 'Database Systems & SQL', count: 'Data Management', tag: 'Backend' },
];

  const navigate = useNavigate();
  const {user} = useContext(UserContext);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header showBackButton={false}></Header>
      <div>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Interactive Practice Platform
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
              Master technical topics with{' '}
              <span className="text-indigo-600">targeted quizzes</span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
              Sharpen your coding, algorithms, and system design knowledge with focused, self-paced quizzes. Instant answer validation and deep explanations included.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={()=> navigate('/quiz/setup')}
                className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-indigo-500/20 hover:-translate-y-0.5"
              >
                {user ? 'Take a Quiz' : 'Take a Demo Quiz'}
              </button>
              <button
                type="button"
                onClick={user ? ()=> navigate('/quiz/history') : ()=> navigate('/login')}
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200/90 transition-all shadow-2xs"
              >
                {user ? 'View History' : 'Sign In'}
              </button>
            </div>
          </div>
        </section>

        
{/* Group Quiz Section */}
<section className="py-12 sm:py-16 bg-slate-50">
  <div className="max-w-5xl mx-auto px-4 sm:px-6">
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 sm:p-12">

      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

        {/* Text Content */}
        <div className="max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Multiplayer Mode
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Challenge Your Friends.
            <span className="block text-indigo-400 mt-1">
              Compete Together.
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Create a quiz room, invite your friends using a room code,
            and test your knowledge together in real time.
          </p>

          <button
            type="button"
            onClick={() => navigate('/quiz/groupquiz')}
            className="mt-7 inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-lg hover:-translate-y-0.5"
          >
            Start Group Quiz

            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Multiplayer Visual */}
        <div className="flex items-center justify-center shrink-0">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">

            <div className="w-24 h-24 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 rotate-3">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>

            <div className="absolute top-5 left-4 w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
              A
            </div>

            <div className="absolute top-7 right-3 w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
              B
            </div>

            <div className="absolute bottom-5 left-8 w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
              C
            </div>

            <div className="absolute bottom-5 right-7 w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold shadow-lg">
              D
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</section>


        {/* Features Section */}
        <section className="py-16 bg-white border-y border-slate-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Built for active recall
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Designed to test your intuition, reinforce key concepts, and prepare you for interviews or exams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1.5">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Topics preview */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Browse Categories</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Popular Subjects</h2>
            </div>
           
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularTopics.map((topic, i) => (
              <div
                key={i}
                onClick={() => onSelectCategory && onSelectCategory(topic.name)}
                className="p-5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-400 hover:shadow-xs transition-all group"
              >
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{topic.tag}</span>
                  <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors mt-0.5">
                    {topic.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{topic.count}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <div className="bg-indigo-600 text-white rounded-2xl p-8 sm:p-12 text-center shadow-md relative overflow-hidden">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight relative z-10">
              Ready to test your knowledge?
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base mt-2 max-w-xl mx-auto relative z-10">
              Jump into a 5-minute quiz right now or build a customized curriculum to track your growth.
            </p>
            <div className="mt-6 relative z-10">
              <button
                type="button"
                onClick={()=> navigate('/quiz/setup')}
                className="px-6 py-3 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold text-sm rounded-xl transition-all shadow-sm"
              >
                Create a Quiz Now
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Goquiz. Clean UI components built with React and Tailwind CSS.</p>
      </footer>
    </div>
  );
}