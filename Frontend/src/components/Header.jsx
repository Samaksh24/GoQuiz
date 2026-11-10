
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

export default function Header({ showBackButton = true }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleNavigate = (path) => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    navigate(path);
  };

  const handleLogoutClick = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );

      console.log(response.data);
      setUser(null);
      navigate('/');
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center gap-3 sm:gap-8">
            {showBackButton && (
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavigate('/')}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs group-hover:bg-indigo-700 transition-colors">
                G
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">
                Goquiz
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-xs border border-indigo-200">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <div className="text-xs leading-tight">
                    <p className="font-medium text-slate-800">{user.name || 'User'}</p>
                    <p className="text-slate-400 text-[11px]">{user.email || 'Member'}</p>
                  </div>

                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-1 w-56 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 text-xs">
                      <span className="text-slate-400 block text-[11px]">Signed in as</span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {user.email || user.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('/login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate('/register')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-xl mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center border border-indigo-200">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email || 'Member'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigate('/quiz/history')}
                  className="w-full text-left px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Quiz History
                </button>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full text-left px-3 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleNavigate('/login')}
                  className="w-full text-left px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate('/register')}
                  className="w-full text-left px-3 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
