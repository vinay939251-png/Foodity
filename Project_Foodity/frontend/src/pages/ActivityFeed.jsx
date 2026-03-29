import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function ActivityFeed({ isTab = false }) {
 const { user } = useAuth();
 const [activities, setActivities] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 if (user) {
 recipesAPI.getActivityFeed()
 .then(res => setActivities(res.data.results || res.data))
 .catch(console.error)
 .finally(() => setLoading(false));
 } else {
 setLoading(false);
 }
 }, [user]);

 if (!user) {
 if (isTab) return <div className="text-center py-20 text-gray-500 font-medium">Sign in to see activity from chefs you follow!</div>;
 return (
 <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign in to see your feeds</h2>
 </div>
 );
 }

 return (
 <div className={`${isTab ? '' : 'pt-24 min-h-screen'} bg-gray-50 dark:bg-gray-950 transition-colors px-4 pb-20 overflow-hidden`}>
 <div className="max-w-3xl mx-auto">
 {!isTab && (
 <div className="flex items-center gap-3 mb-8">
 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-orange-400 shadow-sm shadow-primary/30 flex items-center justify-center text-white text-2xl">
 ⚡
 </div>
 <div>
 <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white leading-tight">Activity Feed</h1>
 <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">See what your favorite chefs are up to</p>
 </div>
 </div>
 )}
 
 {loading ? (
 <div className="space-y-6">
 {[1,2,3].map(i => <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-2xl animate-pulse shadow-sm border border-gray-100 dark:border-gray-700"></div>)}
 </div>
 ) : activities.length === 0 ? (
 <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transform hover:-translate-y-1 transition-transform">
 <div className="text-6xl mb-4">👀</div>
 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">It's quiet here</h3>
 <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">Follow some chefs to see their latest recipes and activity.</p>
 <Link to="/feed" className="inline-block px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-sm shadow-primary/20">Explore Recipes</Link>
 </div>
 ) : (
 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 dark:before:from-gray-700 before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
 {activities.map((item) => (
 <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
 {/* Icon dot */}
 <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-50 dark:border-gray-950 bg-orange-100 dark:bg-orange-900 text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-transform group-hover:scale-110">
 {item.action_type === 'liked' && '❤️'}
 {item.action_type === 'saved' && '📌'}
 {item.action_type === 'commented' && '💬'}
 {item.action_type === 'rated' && '⭐'}
 {item.action_type === 'created' && '👨‍🍳'}
 {item.action_type === 'followed' && '👤'}
 </div>
 
 {/* Card */}
 <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group-hover:border-primary/20 dark:group-hover:border-primary/30">
 <div className="flex items-start gap-3 mb-3">
 <Link to={`/profile/${item.user.id}`} className="shrink-0">
 <img src={item.user.avatar_url} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 hover:border-primary transition-colors"/>
 </Link>
 <div>
 <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-snug">
 <Link to={`/profile/${item.user.id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors">{item.user.display_name}</Link>
 {' '}
 {item.action_type === 'followed' ? 'started following' : item.action_type}
 {' '}
 {item.action_type === 'followed' && item.target_user && (
 <Link to={`/profile/${item.target_user.id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors">{item.target_user.display_name}</Link>
 )}
 {item.action_type !== 'followed' && item.target_recipe && 'a recipe'}
 </p>
 <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
 {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
 </div>
 </div>
 </div>

 {item.target_recipe && (
 <Link to={`/recipe/${item.target_recipe.id}`} className="block mt-4 group/recipe">
 <div className="flex gap-4 items-center bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary/40 transition-colors">
 <img src={item.target_recipe.image} className="w-16 h-16 rounded-lg object-cover shadow-sm bg-gray-200 dark:bg-gray-800"/>
 <div className="flex-1 min-w-0">
 <h4 className="font-bold text-gray-900 dark:text-white group-hover/recipe:text-primary transition-colors truncate">{item.target_recipe.title}</h4>
 {item.target_recipe.author && (
 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">By {item.target_recipe.author.display_name}</p>
 )}
 </div>
 </div>
 </Link>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
