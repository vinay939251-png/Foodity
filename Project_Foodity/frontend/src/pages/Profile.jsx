import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Masonry from 'react-masonry-css';
import RecipeCard from '../components/RecipeCard';
import CollaboratorModal from '../components/CollaboratorModal';

const breakpointCols = {
 default: 4,
 1280: 4,
 1024: 3,
 768: 2,
 640: 2,
};

export default function Profile() {
 const { id } = useParams();
 const { user } = useAuth();
 const toast = useToast();
 const [profile, setProfile] = useState(null);
 const [recipes, setRecipes] = useState([]);
 const [boards, setBoards] = useState([]);
 const [likedRecipes, setLikedRecipes] = useState([]);
 const [stats, setStats] = useState({});
 const [loading, setLoading] = useState(true);
 const [isFollowing, setIsFollowing] = useState(false);
 const [followLoading, setFollowLoading] = useState(false);
 const [activeTab, setActiveTab] = useState('mine'); // 'mine', 'saved', or 'liked'
 const [showFollowers, setShowFollowers] = useState(false);
 const [showFollowing, setShowFollowing] = useState(false);
 const [userList, setUserList] = useState([]);
 const [listLoading, setListLoading] = useState(false);
 const [collabModalOpen, setCollabModalOpen] = useState(false);
 const [collabBoard, setCollabBoard] = useState(null);


 useEffect(() => {
 const fetchProfile = async () => {
 try {
 setLoading(true);
 const res = await usersAPI.getProfile(id);
 setProfile(res.data.user);
 setRecipes(res.data.recipes || []);
 setBoards(res.data.boards || []);
 setStats(res.data.stats || {});
 setIsFollowing(res.data.user.is_following || false);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };
 fetchProfile();
 }, [id]);

 useEffect(() => {
 if (activeTab === 'liked') {
 const fetchLiked = async () => {
 setLoading(true);
 try {
 const res = await usersAPI.getLikedRecipes(id);
 // Handle both paginated (results) and non-paginated responses
 const data = res.data.results !== undefined ? res.data.results : res.data;
 setLikedRecipes(data || []);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };
 fetchLiked();
 }
 }, [id, activeTab]);

 if (loading) {
 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
 <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin" />
 </div>
 );
 }

 if (!profile) {
 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 flex items-center justify-center transition-colors duration-300">
 <div className="text-center">
 <div className="text-6xl mb-4">👤</div>
 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">User not found</h2>
 <Link to="/feed" className="text-primary hover:underline font-medium">Back to feed</Link>
 </div>
 </div>
 );
 }

 const isMe = user?.id === profile.id;

 const fetchUserList = async (type) => {
 setListLoading(true);
 try {
 const res = type === 'followers' 
 ? await usersAPI.getFollowers(id)
 : await usersAPI.getFollowing(id);
 const data = res.data.results !== undefined ? res.data.results : res.data;
 setUserList(data || []);
 } catch (err) {
 toast.error('Failed to load user list');
 } finally {
 setListLoading(false);
 }
 };

 const openFollowers = () => {
 setShowFollowers(true);
 fetchUserList('followers');
 };

 const openFollowing = () => {
 setShowFollowing(true);
 fetchUserList('following');
 };

 const handleFollow = async () => {
 if (!user) {
 toast.info('Please sign in to follow others');
 return;
 }
 setFollowLoading(true);
 try {
 const res = await usersAPI.follow(profile.id);
 setIsFollowing(res.data.following);
 setStats(prev => ({
 ...prev,
 followers_count: res.data.following 
 ? (prev.followers_count || 0) + 1 
 : Math.max(0, (prev.followers_count || 0) - 1)
 }));
 toast.success(res.data.following ? `Following ${profile.display_name}` : `Unfollowed ${profile.display_name}`);
 } catch (err) {
 toast.error('Failed to update follow status');
 } finally {
 setFollowLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 transition-colors duration-300">
 <div className="max-w-5xl mx-auto px-4">
 {/* Profile Header */}
 <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden mb-8 transition-colors">
 <div className="h-32 bg-gradient-to-r from-primary/20 via-orange-100 dark:via-orange-900/30 to-amber-100 dark:to-amber-900/30" />
 <div className="px-8 pb-8 -mt-16">
 <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
 <img
 src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
 alt={profile.display_name}
 className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover bg-gray-100 dark:bg-gray-700"
 />
 <div className="flex-1 pt-4">
 <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{profile.display_name}</h1>
 <p className="text-gray-500 dark:text-gray-400 font-medium">@{profile.username}</p>
 {profile.bio && <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-lg">{profile.bio}</p>}
 </div>
 <div className="flex gap-3">
 {isMe ? (
 <Link to="/settings" className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
 Edit Profile
 </Link>
 ) : (
 <div className="flex gap-2">
 <button
 onClick={handleFollow}
 disabled={followLoading}
 className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
 isFollowing 
 ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600' 
 : 'bg-primary text-white hover:bg-orange-600 shadow-primary/30'
 } disabled:opacity-50`}
 >
 {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
 </button>
 <Link to={`/chat?userId=${profile.id}`} className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
 Message
 </Link>
 </div>
 )}
 </div>
 </div>

 {/* Stats */}
 <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
 <div className="text-center">
 <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recipes_count || 0}</div>
 <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Recipes</div>
 </div>
 <button onClick={openFollowers} className="text-center hover:opacity-75 transition-opacity">
 <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.followers_count || 0}</div>
 <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Followers</div>
 </button>
 <button onClick={openFollowing} className="text-center hover:opacity-75 transition-opacity">
 <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.following_count || 0}</div>
 <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Following</div>
 </button>

 </div>
 </div>
 </div>

 {/* Tabs */}
 <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6 mt-8">
 <button
 onClick={() => setActiveTab('mine')}
 className={`pb-4 text-base font-bold transition-colors ${
 activeTab === 'mine' 
 ? 'text-primary border-b-2 border-primary' 
 : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
 }`}
 >
 {isMe ? 'My Recipes' : 'Recipes'}
 </button>
 
 <button
 onClick={() => setActiveTab('saved')}
 className={`pb-4 text-base font-bold transition-colors ${
 activeTab === 'saved' 
 ? 'text-primary border-b-2 border-primary' 
 : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
 }`}
 >
 Saved Recipes
 </button>

 <button
 onClick={() => setActiveTab('liked')}
 className={`pb-4 text-base font-bold transition-colors ${
 activeTab === 'liked' 
 ? 'text-primary border-b-2 border-primary' 
 : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
 }`}
 >
 Liked Recipes
 </button>
 </div>

 {/* Tab Content */}
 {activeTab === 'mine' ? (
 <>
 {recipes.length > 0 ? (
 <Masonry
 breakpointCols={breakpointCols}
 className="masonry-grid"
 columnClassName="masonry-grid-column"
 >
 {recipes.map(recipe => (
 <div key={recipe.id} className="animate-fade-in">
 <RecipeCard recipe={recipe} />
 </div>
 ))}
 </Masonry>
 ) : (
 <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
 <span className="text-4xl block mb-3">🍳</span>
 <h3 className="text-gray-900 dark:text-white font-bold text-lg">No recipes yet</h3>
 <p className="text-gray-500 dark:text-gray-400 text-sm">
 {isMe ? 'Create your first recipe!' : 'This chef hasn\'t shared any recipes yet.'}
 </p>
 </div>
 )}
 </>
 ) : activeTab === 'saved' ? (
 <>
 {boards.length > 0 ? (
 <div className="space-y-8">
 {boards.map(board => (
 <div key={board.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
 <div className="flex justify-between items-start mb-4">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <h3 className="text-xl font-bold text-gray-900 dark:text-white">{board.name}</h3>
 
 {/* Collaborator Avatars */}
 {board.collaborators && board.collaborators.length > 0 && (
 <div className="flex -space-x-2">
 {board.collaborators.slice(0, 3).map(c => (
 <img key={c.id} src={c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.username}`} title={c.display_name} className="w-6 h-6 rounded-full border border-white dark:border-gray-800" />
 ))}
 {board.collaborators.length > 3 && (
 <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 border border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
 +{board.collaborators.length - 3}
 </div>
 )}
 </div>
 )}
 </div>
 {board.description && <p className="text-gray-500 dark:text-gray-400 text-sm">{board.description}</p>}
 </div>
 
 {isMe && (
 <button 
 onClick={() => { setCollabBoard(board); setCollabModalOpen(true); }}
 className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1.5"
 >
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
 Manage
 </button>
 )}
 </div>
 
 {board.recipes && board.recipes.length > 0 ? (
 <Masonry
 breakpointCols={breakpointCols}
 className="masonry-grid"
 columnClassName="masonry-grid-column"
 >
 {board.recipes.map(sr => (
 <div key={sr.recipe.id} className="animate-fade-in">
 <RecipeCard recipe={sr.recipe} />
 </div>
 ))}
 </Masonry>
 ) : (
 <p className="text-gray-400 dark:text-gray-500 text-sm italic">No recipes in this board yet.</p>
 )}
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
 <span className="text-4xl block mb-3">🔖</span>
 <h3 className="text-gray-900 dark:text-white font-bold text-lg">No saved recipes</h3>
 <p className="text-gray-500 dark:text-gray-400 text-sm">
 {isMe ? 'Save recipes you love to find them here.' : 'This chef hasn\'t saved any recipes publicly.'}
 </p>
 </div>
 )}
 </>
 ) : (
 <>
 {likedRecipes.length > 0 ? (
 <Masonry
 breakpointCols={breakpointCols}
 className="masonry-grid"
 columnClassName="masonry-grid-column"
 >
 {likedRecipes.map(recipe => (
 <div key={recipe.id} className="animate-fade-in">
 <RecipeCard recipe={recipe} />
 </div>
 ))}
 </Masonry>
 ) : (
 <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
 <span className="text-4xl block mb-3">❤️</span>
 <h3 className="text-gray-900 dark:text-white font-bold text-lg">No liked recipes</h3>
 <p className="text-gray-500 dark:text-gray-400 text-sm">
 {isMe ? 'Recipes you like will appear here.' : 'This chef hasn\'t liked any recipes yet.'}
 </p>
 </div>
 )}
 </>
 )}
 </div>

 {/* User List Modal */}
 {(showFollowers || showFollowing) && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up transition-colors">
 <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
 <h3 className="text-lg font-bold text-gray-900 dark:text-white">
 {showFollowers ? 'Followers' : 'Following'}
 </h3>
 <button 
 onClick={() => { setShowFollowers(false); setShowFollowing(false); }}
 className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 font-bold transition-colors"
 >
 ✕
 </button>
 </div>
 
 <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
 {listLoading ? (
 <div className="py-8 flex justify-center">
 <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin" />
 </div>
 ) : userList.length > 0 ? (
 userList.map(item => {
 const targetUser = showFollowers ? item.follower : item.following;
 return (
 <Link 
 key={targetUser.id} 
 to={`/profile/${targetUser.id}`}
 onClick={() => { setShowFollowers(false); setShowFollowing(false); }}
 className="flex items-center gap-4 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
 >
 <img 
 src={targetUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.username}`} 
 alt="" 
 className="w-12 h-12 rounded-full border border-gray-100 dark:border-gray-600 object-cover"
 />
 <div className="flex-1 min-w-0">
 <div className="text-gray-900 dark:text-white font-bold truncate">{targetUser.display_name}</div>
 <div className="text-gray-500 dark:text-gray-400 text-sm truncate">@{targetUser.username}</div>
 </div>
 <div className="text-primary font-bold text-sm">View Profile →</div>
 </Link>
 );
 })
 ) : (
 <div className="py-12 text-center text-gray-500 dark:text-gray-400">
 {showFollowers ? 'No followers yet.' : 'Not following anyone yet.'}
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 <CollaboratorModal 
 isOpen={collabModalOpen} 
 onClose={() => setCollabModalOpen(false)} 
 board={collabBoard}
 onUpdate={() => {
 // Re-fetch profile to update board collaborators
 usersAPI.getProfile(id).then(res => {
 setBoards(res.data.boards || []);
 }).catch(console.error);
 }}
 />
 </div>
 );
}
