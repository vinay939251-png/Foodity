import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/feed';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/feed?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center
              group-hover:scale-110 transition-transform duration-300 shadow-md shadow-primary/20">
              <span className="text-white text-lg leading-none mt-1">🍽</span>
            </div>
            <span className="text-xl font-display font-bold hidden sm:block text-gray-900">
              Food<span className="text-primary">ity</span>
            </span>
          </Link>

          {/* Search — shown on feed */}
          {isHome && (
            <form onSubmit={handleSearch} className="flex-1 max-w-lg ml-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-full text-sm text-gray-900
                    placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm inset-y-0"
                />
              </div>
            </form>
          )}

          <div className="flex-1" />

          {/* Nav links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/feed"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-full
                hover:bg-orange-50 transition-all"
            >
              Explore
            </Link>

            {user ? (
              <>
                <Link
                  to="/recipe/new"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-full
                    hover:bg-orange-600 transition-all shadow-sm shadow-primary/30 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create
                </Link>

                <Link
                  to="/ai-chef"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-full
                    hover:bg-orange-50 transition-all flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Chef
                </Link>

                <Link
                  to="/tracker"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-full
                    hover:bg-orange-50 transition-all flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Tracker
                </Link>

                <Link
                  to="/chat"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-full
                    hover:bg-orange-50 transition-all flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Messages
                </Link>


                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 sm:px-3 rounded-full bg-white border border-gray-200 shadow-sm
                      hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="w-7 h-7 rounded-full bg-gray-200"
                    />
                    <span className="text-sm text-gray-700 font-medium hidden sm:block">{user.display_name}</span>
                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-floating py-2 animate-scale-in"
                      onMouseLeave={() => setMenuOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl -mt-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{user.display_name}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                      <Link to={`/profile/${user.id}`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors">
                        My Profile
                      </Link>
                      <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors">
                        Settings
                      </Link>
                      <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-5 py-2 bg-primary rounded-full text-sm font-semibold text-white
                  hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
