import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { recipesAPI } from '../services/api';
import AuthModal from './AuthModal';

export default function Navbar() {
 const { user, logout } = useAuth();
 const { theme, toggleTheme } = useTheme();
 const [authOpen, setAuthOpen] = useState(false);
 const [menuOpen, setMenuOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 // Typeahead
 const [suggestions, setSuggestions] = useState({ recipes: [], users: [] });
 const [showSuggestions, setShowSuggestions] = useState(false);
 const searchRef = useRef(null);
 // Advanced Filters
 const [showFilters, setShowFilters] = useState(false);
 const [filters, setFilters] = useState({ difficulty: '', max_time: '', max_calories: '' });
 const filterRef = useRef(null);
 const location = useLocation();
 const navigate = useNavigate();
 const isHome = location.pathname === '/feed';

 // Typeahead debounce
 useEffect(() => {
 if (searchQuery.trim().length < 2) {
 setSuggestions({ recipes: [], users: [] });
 return;
 }
 const timer = setTimeout(async () => {
 try {
 const res = await recipesAPI.autocomplete(searchQuery.trim());
 const data = res.data || { recipes: [], users: [] };
 setSuggestions(data);
 setShowSuggestions(true);
 } catch { setSuggestions({ recipes: [], users: [] }); }
 }, 250);
 return () => clearTimeout(timer);
 }, [searchQuery]);

 // Close dropdowns on outside click
 useEffect(() => {
 const handler = (e) => {
 if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
 if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilters(false);
 };
 document.addEventListener('mousedown', handler);
 return () => document.removeEventListener('mousedown', handler);
 }, []);

 const handleSearch = (e) => {
 e.preventDefault();
 setShowSuggestions(false);
 const params = new URLSearchParams();
 if (searchQuery.trim()) params.set('search', searchQuery.trim());
 if (filters.difficulty) params.set('difficulty', filters.difficulty);
 if (filters.max_time) params.set('max_time', filters.max_time);
 if (filters.max_calories) params.set('max_calories', filters.max_calories);
 navigate(`/feed?${params.toString()}`);
 };

 const selectSuggestion = (item) => {
 setShowSuggestions(false);
 setSearchQuery('');
 if (item.type === 'user') {
 navigate(`/profile/${item.id}`);
 } else {
 navigate(`/recipe/${item.id}`);
 }
 };

 return (
 <>
 <nav className="fixed top-0 left-0 right-0 z-50 glass dark:bg-gray-900/80 dark:border-b dark:border-gray-800">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
 {/* Logo */}
 <Link to="/" className="flex items-center gap-2 shrink-0 group">
 <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center
 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-primary/20">
 <span className="text-white text-lg leading-none mt-1">🍽</span>
 </div>
 <span className="text-xl font-display font-bold hidden sm:block text-gray-900 dark:text-white">
 Food<span className="text-primary">ity</span>
 </span>
 </Link>

 {/* Search Bar */}
 <div className="flex-1 max-w-lg mx-2 sm:mx-4 flex items-center gap-2" ref={searchRef}>
 <form onSubmit={handleSearch} className="relative flex-1">
 <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 <input
 type="text"
 placeholder="Search recipes & chefs..."
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 onFocus={() => (suggestions.recipes?.length > 0 || suggestions.users?.length > 0) && setShowSuggestions(true)}
 className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-full text-sm text-gray-900 dark:text-white
 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
 />

 {/* Typeahead dropdown */}
 {showSuggestions && (suggestions.recipes?.length > 0 || suggestions.users?.length > 0) && (
 <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-floating overflow-hidden z-50 animate-scale-in">
 {/* Recipes Section */}
 {suggestions.recipes?.length > 0 && (
 <div className="pb-1">
 <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50">Recipes</div>
 {suggestions.recipes.map(s => (
 <button key={`recipe-${s.id}`} type="button" onClick={() => selectSuggestion(s)}
 className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors">
 {s.image && <img src={s.image} alt="" className="w-8 h-8 rounded-lg object-cover" />}
 <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{s.title}</span>
 </button>
 ))}
 </div>
 )}

 {/* Users Section */}
 {suggestions.users?.length > 0 && (
 <div className="border-t border-gray-100 dark:border-gray-700">
 <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50">Chefs</div>
 {suggestions.users.map(u => (
 <button key={`user-${u.id}`} type="button" onClick={() => selectSuggestion(u)}
 className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors">
 <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600" />
 <div className="min-w-0">
 <div className="text-sm text-gray-800 dark:text-gray-200 font-bold truncate">{u.display_name}</div>
 <div className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">@{u.username}</div>
 </div>
 </button>
 ))}
 </div>
 )}
 
 {/* Global Search Users Link */}
 <Link to="/users/search" onClick={() => setShowSuggestions(false)} className="block w-full text-center py-2 text-xs font-bold text-primary hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-100 dark:border-gray-700">
 Search all chefs →
 </Link>
 </div>
 )}
 </form>

 {/* Filter toggle button */}
 <div className="relative" ref={filterRef}>
 <button
 type="button"
 onClick={() => setShowFilters(!showFilters)}
 className={`p-2.5 rounded-full border transition-all ${
 showFilters || filters.difficulty || filters.max_time || filters.max_calories
 ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
 : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
 }`}
 title="Advanced Filters"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
 </svg>
 </button>

 {/* Filter dropdown */}
 {showFilters && (
 <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-floating p-5 z-50 animate-scale-in">
 <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Advanced Filters</h4>

 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Difficulty</label>
 <div className="flex gap-1.5 mb-5">
 {['Any', 'Easy', 'Medium', 'Hard'].map(d => {
 const val = d === 'Any' ? '' : d.toLowerCase();
 const isActive = filters.difficulty === val;
 return (
 <button
 key={d}
 type="button"
 onClick={() => setFilters(f => ({ ...f, difficulty: val }))}
 className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
 isActive
 ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105'
 : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50'
 }`}
 >
 {d}
 </button>
 );
 })}
 </div>

 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Max Cook Time (min)</label>
 <div className="relative mb-5">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
 <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <input type="number" placeholder="e.g. 30" value={filters.max_time}
 onChange={e => setFilters(f => ({...f, max_time: e.target.value}))}
 className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
 </div>

 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Max Calories</label>
 <div className="relative mb-6">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
 <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
 </svg>
 </div>
 <input type="number" placeholder="e.g. 500" value={filters.max_calories}
 onChange={e => setFilters(f => ({...f, max_calories: e.target.value}))}
 className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
 </div>

 <div className="flex gap-2">
 <button type="button" onClick={() => { setFilters({ difficulty: '', max_time: '', max_calories: '' }); setShowFilters(false); navigate('/feed'); }}
 className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
 Clear
 </button>
 <button type="button" onClick={(e) => { setShowFilters(false); handleSearch(e); }}
 className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-orange-600 transition-colors shadow-sm">
 Apply
 </button>
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="flex-1" />

 {/* Nav links */}
 <div className="flex items-center gap-1 sm:gap-2">
 <Link
 to="/feed"
 className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${location.pathname === '/feed' ? 'text-primary bg-orange-50 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-orange-50 dark:hover:bg-gray-800'}`}
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
 className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary rounded-full
 hover:bg-orange-50 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
 </svg>
 AI Chef
 </Link>

 <Link
 to="/tracker"
 className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary rounded-full
 hover:bg-orange-50 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 Tracker
 </Link>

 <Link
 to="/chat"
 className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary rounded-full
 hover:bg-orange-50 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
 </svg>
 Messages
 </Link>


 {/* Theme Toggle */}
 <button
 onClick={toggleTheme}
 className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
 title="Toggle Theme"
 >
 {theme === 'dark' ? (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
 </svg>
 ) : (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
 </svg>
 )}
 </button>

 {/* User menu */}
 <div className="relative">
 <button
 onClick={() => setMenuOpen(!menuOpen)}
 className="flex items-center gap-2 px-2 py-1.5 sm:px-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm
 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-all"
 >
 <img
 src={user.avatar_url}
 alt={user.display_name}
 className="w-7 h-7 rounded-full bg-gray-200"
 />
 <span className="text-sm text-gray-700 dark:text-gray-200 font-medium hidden sm:block">{user.display_name}</span>
 <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
 </svg>
 </button>

 {menuOpen && (
 <div
 className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-floating py-2 animate-scale-in"
 onMouseLeave={() => setMenuOpen(false)}
 >
 <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-t-2xl -mt-2 mb-1">
 <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.display_name}</p>
 <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
 </div>
 <Link to={`/profile/${user.id}`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-primary transition-colors">
 My Profile
 </Link>
 <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-primary transition-colors">
 Settings
 </Link>
 <button
 onClick={() => { logout(); setMenuOpen(false); }}
 className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
