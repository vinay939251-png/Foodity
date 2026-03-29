import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function UserSearch() {
 const { user } = useAuth();
 const toast = useToast();
 const [query, setQuery] = useState('');
 const [results, setResults] = useState([]);
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 const delayDebounceFn = setTimeout(() => {
 if (query.length >= 2) {
 handleSearch();
 } else {
 setResults([]);
 }
 }, 500);

 return () => clearTimeout(delayDebounceFn);
 }, [query]);

 const handleSearch = async () => {
 setLoading(true);
 try {
 const res = await usersAPI.search(query);
 setResults(res.data.results || res.data);
 } catch (err) {
 console.error(err);
 toast.error('Search failed');
 } finally {
 setLoading(false);
 }
 };

 const handleFollow = async (e, targetUserId) => {
 e.preventDefault();
 e.stopPropagation();
 if (!user) {
 toast.info('Sign in to follow chefs');
 return;
 }
 try {
 const res = await usersAPI.follow(targetUserId);
 setResults(prev => prev.map(u => 
 u.id === targetUserId ? { ...u, is_following: res.data.following } : u
 ));
 if (res.data.following) toast.success('Following! 👨‍🍳');
 } catch (err) {
 toast.error('Failed to follow');
 }
 };

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4">
 <div className="max-w-4xl mx-auto">
 <div className="text-center mb-10">
 <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">Find Chefs</h1>
 <p className="text-gray-500 dark:text-gray-400">Discover and follow talented cooks in the Foodity community</p>
 </div>

 {/* Search Bar */}
 <div className="relative max-w-2xl mx-auto mb-12">
 <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 <input
 type="text"
 placeholder="Search by name or username..."
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-lg shadow-sm
 focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all"
 />
 {loading && (
 <div className="absolute right-4 top-1/2 -translate-y-1/2">
 <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin" />
 </div>
 )}
 </div>

 {/* Results */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {results.length > 0 ? (
 results.map((profile) => (
 <Link
 key={profile.id}
 to={`/profile/${profile.id}`}
 className="group bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
 >
 <div className="flex flex-col items-center">
 <div className="relative mb-4">
 <img
 src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
 alt={profile.display_name}
 className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
 />
 {profile.is_following && (
 <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow-sm">
 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
 <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
 </svg>
 </div>
 )}
 </div>
 
 <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
 {profile.display_name}
 </h3>
 <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">@{profile.username}</p>

 <button
 onClick={(e) => handleFollow(e, profile.id)}
 className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all
 ${profile.is_following 
 ? 'bg-gray-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200' 
 : 'bg-primary text-white hover:bg-orange-600 shadow-sm shadow-primary/20'}`}
 >
 {profile.is_following ? 'Following' : 'Follow'}
 </button>
 </div>
 </Link>
 ))
 ) : query.length >= 2 ? (
 <div className="col-span-full text-center py-12">
 <span className="text-4xl block mb-3">🔍</span>
 <p className="text-gray-500 dark:text-gray-400 font-medium">No chefs found matching "{query}"</p>
 </div>
 ) : !loading && (
 <div className="col-span-full text-center py-12">
 <span className="text-4xl block mb-3">👋</span>
 <p className="text-gray-500 dark:text-gray-400 font-medium">Type at least 2 characters to search</p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
