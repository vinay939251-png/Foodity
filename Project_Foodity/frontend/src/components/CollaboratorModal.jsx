import { useState, useEffect } from 'react';
import { usersAPI, boardsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function CollaboratorModal({ isOpen, onClose, board, onUpdate }) {
 const toast = useToast();
 const [searchQuery, setSearchQuery] = useState('');
 const [searchResults, setSearchResults] = useState([]);
 const [loading, setLoading] = useState(false);
 
 useEffect(() => {
 if (!searchQuery.trim() || searchQuery.length < 2) {
 setSearchResults([]);
 return;
 }
 const timer = setTimeout(async () => {
 setLoading(true);
 try {
 const res = await usersAPI.search(searchQuery.trim());
 setSearchResults(res.data || []);
 } catch (err) {
 setSearchResults([]);
 } finally {
 setLoading(false);
 }
 }, 300);
 return () => clearTimeout(timer);
 }, [searchQuery]);

 if (!isOpen || !board) return null;

 const handleAdd = async (user) => {
 try {
 await boardsAPI.addCollaborator(board.id, user.id);
 toast.success(`Added ${user.display_name} as collaborator.`);
 if (onUpdate) onUpdate();
 setSearchQuery('');
 } catch (err) {
 toast.error('Failed to add collaborator.');
 }
 };

 const handleRemove = async (user) => {
 try {
 await boardsAPI.removeCollaborator(board.id, user.id);
 toast.success(`Removed ${user.display_name}.`);
 if (onUpdate) onUpdate();
 } catch (err) {
 toast.error('Failed to remove collaborator.');
 }
 };

 const collaborators = board.collaborators || [];
 const collaboratorIds = collaborators.map(c => c.id);

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
 <div 
 className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]"
 onClick={e => e.stopPropagation()}
 >
 <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
 <div>
 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Collaborators</h2>
 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">For board "{board.name}"</p>
 </div>
 <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
 ✕
 </button>
 </div>

 <div className="p-6 flex-1 overflow-y-auto">
 {/* Search */}
 <div className="mb-6">
 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Invite people</label>
 <div className="relative">
 <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 <input
 type="text"
 placeholder="Search by name or username..."
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm"
 />
 </div>
 
 {/* Search Results Dropdown */}
 {searchQuery.length >= 2 && (
 <div className="mt-2 border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm max-h-48 overflow-y-auto overflow-hidden">
 {loading ? (
 <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
 ) : searchResults.length > 0 ? (
 searchResults.map(user => {
 const isOwner = user.id === board.owner.id;
 const isCollab = collaboratorIds.includes(user.id);
 return (
 <div key={user.id} className="flex items-center justify-between p-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-orange-50 dark:hover:bg-gray-700/50 transition-colors">
 <div className="flex items-center gap-3 overflow-hidden">
 <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="" className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 shrink-0"/>
 <div className="truncate">
 <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.display_name}</p>
 <p className="text-xs text-gray-500 truncate">@{user.username}</p>
 </div>
 </div>
 {isOwner ? (
 <span className="text-xs font-bold text-gray-400 px-3">Owner</span>
 ) : isCollab ? (
 <span className="text-xs font-bold text-primary px-3">Added</span>
 ) : (
 <button onClick={() => handleAdd(user)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors shrink-0">
 Add
 </button>
 )}
 </div>
 );
 })
 ) : (
 <div className="p-4 text-center text-gray-500 text-sm">No users found.</div>
 )}
 </div>
 )}
 </div>

 {/* Current Collaborators */}
 <div>
 <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
 <span>Current Collaborators</span>
 <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">{collaborators.length}</span>
 </h3>
 
 <div className="space-y-3">
 {/* Owner */}
 <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
 <div className="flex items-center gap-3">
 <img src={board.owner.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${board.owner.username}`} alt="" className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover"/>
 <div>
 <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
 {board.owner.display_name} 
 <span className="text-[10px] uppercase font-bold tracking-wider bg-orange-100 dark:bg-orange-900 text-primary px-2 py-0.5 rounded-full">Owner</span>
 </p>
 <p className="text-xs text-gray-500">@{board.owner.username}</p>
 </div>
 </div>
 </div>

 {/* Collaborators */}
 {collaborators.map(c => (
 <div key={c.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-colors group">
 <div className="flex items-center gap-3">
 <img src={c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.username}`} alt="" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 object-cover"/>
 <div>
 <p className="text-sm font-bold text-gray-900 dark:text-white">{c.display_name}</p>
 <p className="text-xs text-gray-500">@{c.username}</p>
 </div>
 </div>
 <button onClick={() => handleRemove(c)} className="px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold rounded-lg transition-colors opacity-0 group-hover:opacity-100">
 Remove
 </button>
 </div>
 ))}
 
 {collaborators.length === 0 && (
 <div className="text-center p-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
 <p className="text-sm text-gray-500 dark:text-gray-400">No collaborators yet.</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
