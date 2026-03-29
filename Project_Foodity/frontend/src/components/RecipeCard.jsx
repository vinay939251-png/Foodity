import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { recipesAPI, trackerAPI } from '../services/api';
import { getOptimizedImage } from '../utils/imageUtils';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import ShareModal from './ShareModal';

export default function RecipeCard({ recipe, onLikeToggle }) {
 const { user } = useAuth();
 const toast = useToast();
 const [liked, setLiked] = useState(recipe.is_liked || false);
 const [saved, setSaved] = useState(recipe.is_saved || false);
 const [likesCount, setLikesCount] = useState(recipe.likes_count || 0);
 const [imgLoaded, setImgLoaded] = useState(false);
 const [showMealPicker, setShowMealPicker] = useState(false);
 const [shareOpen, setShareOpen] = useState(false);

 const handleLike = async (e) => {
 e.preventDefault();
 e.stopPropagation();
 if (!user) { toast.info('Sign in to like recipes'); return; }
 try {
 const res = await recipesAPI.like(recipe.id);
 setLiked(res.data.liked);
 setLikesCount(res.data.likes_count);
 if (res.data.liked) toast.success('Added to likes ❤️');
 } catch { toast.error('Failed to like'); }
 };

 const handleSave = async (e) => {
 e.preventDefault();
 e.stopPropagation();
 if (!user) { toast.info('Sign in to save recipes'); return; }
 try {
 const res = await recipesAPI.save(recipe.id);
 setSaved(res.data.saved);
 if (res.data.saved) toast.success('Saved to Favorites! 📌');
 else toast.info('Removed from Favorites');
 } catch { toast.error('Failed to save'); }
 };

 const handleAddToTracker = async (e, mealType) => {
 e.preventDefault();
 e.stopPropagation();
 if (!user) { toast.info('Sign in to track meals'); return; }
 try {
 await trackerAPI.add({
 recipe: recipe.id,
 meal_type: mealType,
 date: new Date().toISOString().slice(0, 10),
 });
 toast.success(`Added to ${mealType}! 🎯`);
 setShowMealPicker(false);
 } catch {
 toast.error('Failed to add to tracker');
 }
 };

 const toggleMealPicker = (e) => {
 e.preventDefault();
 e.stopPropagation();
 if (!user) { toast.info('Sign in to track meals'); return; }
 setShowMealPicker(!showMealPicker);
 };

 const handleShare = (e) => {
 e.preventDefault();
 e.stopPropagation();
 setShareOpen(true);
 };

 const difficultyColor = {
 easy: 'bg-green-50 text-green-700 border-green-200',
 medium: 'bg-orange-50 text-orange-700 border-orange-200',
 hard: 'bg-red-50 text-red-700 border-red-200',
 }[recipe.difficulty] || 'bg-gray-100 text-gray-700 border-gray-200';

 return (
 <div className="group block">
 <div className="card-white flex flex-col h-full">

 {/* Image container */}
 <Link to={`/recipe/${recipe.id}`} className="relative overflow-hidden aspect-[4/5] bg-gray-100 dark:bg-gray-800 shrink-0 block">
 <LazyLoadImage
 src={getOptimizedImage(recipe.image, 400)}
 alt={recipe.title}
 effect="blur"
 wrapperClassName="w-full h-full block"
 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
 />

 {/* Hover overlay with actions */}
 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
 {/* Top right "Save" button */}
 <div className="absolute top-3 right-3">
 <button
 onClick={handleSave}
 className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all transform hover:scale-105 shadow-lg
 ${saved ? 'bg-gray-900 text-white' : 'bg-primary text-white hover:bg-orange-600'}`}
 >
 <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
 </svg>
 {saved ? 'Saved' : 'Save'}
 </button>
 </div>

 {/* Bottom group of smaller action icons */}
 <div className="absolute bottom-3 right-3 flex items-center gap-2">
 <button
 onClick={handleLike}
 title={liked ? 'Unlike' : 'Like'}
 className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 shadow-lg
 ${liked ? 'bg-primary text-white' : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary'}`}
 >
 <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 </button>
 
 <button
 onClick={toggleMealPicker}
 title="Add to Tracker"
 className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 shadow-lg
 ${showMealPicker ? 'bg-green-500 text-white' : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-500'}`}
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
 </svg>
 </button>

 <button
 onClick={handleShare}
 title="Share"
 className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-700 dark:text-gray-200 transition-all hover:scale-110 hover:text-blue-500 shadow-lg"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
 </svg>
 </button>
 </div>

 {/* Meal Picker Popover */}
 {showMealPicker && (
 <div className="absolute bottom-16 right-3 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-1.5 z-20 animate-scale-in min-w-[140px]">
 {['breakfast', 'lunch', 'snacks', 'dinner'].map(m => (
 <button
 key={m}
 onClick={(e) => handleAddToTracker(e, m)}
 className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-primary transition-colors capitalize"
 >
 {m}
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
 {recipe.total_time > 0 && (
 <div className="flex items-center gap-1.5 text-white font-bold text-xs drop-shadow-md bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm">
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 {recipe.total_time}m
 </div>
 )}
 </div>
 </Link>


 {/* Card content */}
 <div className="p-4 flex-1 flex flex-col pt-5">
 <Link to={`/recipe/${recipe.id}`}>
 <h3 className="font-display font-bold text-gray-900 dark:text-white text-base leading-snug mb-1.5 line-clamp-2
 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer">
 {recipe.title}
 </h3>
 </Link>

 {recipe.description && (
 <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed flex-1">{recipe.description}</p>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
 <Link to={`/profile/${recipe.author?.id}`} className="flex items-center gap-2 group/author">
 {recipe.author?.avatar_url ? (
 <img src={recipe.author.avatar_url} alt="" className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 group-hover/author:border-primary transition-colors" />
 ) : (
 <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] group-hover/author:bg-primary/10 transition-colors">👤</div>
 )}
 <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover/author:text-primary transition-colors">
 {recipe.author?.display_name || 'Chef'}
 </span>
 </Link>
 
 <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
 {recipe.rating > 0 && (
 <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
 <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
 </svg>
 {recipe.rating.toFixed(1)}
 </span>
 )}
 <span className="flex items-center gap-1">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 {likesCount}
 </span>
 </div>
 </div>
 </div>
 </div>
 <ShareModal
 isOpen={shareOpen}
 onClose={() => setShareOpen(false)}
 recipe={recipe}
 />
 </div>
 );
}
