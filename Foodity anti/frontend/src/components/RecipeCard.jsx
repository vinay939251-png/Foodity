import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { recipesAPI, trackerAPI } from '../services/api';

export default function RecipeCard({ recipe, onLikeToggle }) {
  const { user } = useAuth();
  const toast = useToast();
  const [liked, setLiked] = useState(recipe.is_liked || false);
  const [saved, setSaved] = useState(recipe.is_saved || false);
  const [likesCount, setLikesCount] = useState(recipe.likes_count || 0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showMealPicker, setShowMealPicker] = useState(false);

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

  const difficultyColor = {
    easy: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-orange-50 text-orange-700 border-orange-200',
    hard: 'bg-red-50 text-red-700 border-red-200',
  }[recipe.difficulty] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <Link to={`/recipe/${recipe.id}`} className="group block">
      <div className="card-white flex flex-col h-full">

        {/* Image container */}
        <div className="relative overflow-hidden aspect-[4/5] bg-gray-100 shrink-0">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={recipe.image}
            alt={recipe.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-700
              group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/10 to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {recipe.difficulty && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${difficultyColor} shadow-sm backdrop-blur-md bg-opacity-90`}>
                {recipe.difficulty}
              </span>
            )}
          </div>

          {/* Hover action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 transform translate-x-12
            group-hover:translate-x-0 transition-transform duration-300">
            <button
              onClick={handleLike}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md
                transition-all duration-200 hover:scale-110
                ${liked ? 'bg-primary text-white border-none' : 'bg-white/90 text-gray-600 hover:text-primary hover:bg-white border border-gray-200'}`}
            >
              <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              onClick={handleSave}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md
                transition-all duration-200 hover:scale-110
                ${saved ? 'bg-gray-900 text-white' : 'bg-white/90 text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-200'}`}
            >
              <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            {/* Add to Tracker button */}
            <button
              onClick={toggleMealPicker}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md
                transition-all duration-200 hover:scale-110
                ${showMealPicker ? 'bg-green-500 text-white' : 'bg-white/90 text-green-600 hover:text-green-700 hover:bg-white border border-gray-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Meal type picker dropdown */}
          {showMealPicker && (
            <div className="absolute top-3 right-16 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 animate-scale-in min-w-[140px]"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              {[
                { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
                { key: 'lunch', label: 'Lunch', icon: '☀️' },
                { key: 'snacks', label: 'Snacks', icon: '🍿' },
                { key: 'dinner', label: 'Dinner', icon: '🌙' },
              ].map(m => (
                <button
                  key={m.key}
                  onClick={(e) => handleAddToTracker(e, m.key)}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-primary flex items-center gap-2 transition-colors"
                >
                  <span>{m.icon}</span> {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Bottom info overlay on hover */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100
            transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            {recipe.total_time > 0 && (
              <div className="flex items-center gap-3 text-white font-medium text-xs drop-shadow-md">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {recipe.total_time} min
                </span>
                {recipe.servings && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {recipe.servings}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card content */}
        <div className="p-4 flex-1 flex flex-col pt-5">
          <h3 className="font-display font-bold text-gray-900 text-base leading-snug mb-1.5 line-clamp-2
            group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>

          {recipe.description && (
            <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed flex-1">{recipe.description}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {recipe.author?.avatar_url ? (
                <img src={recipe.author.avatar_url} alt="" className="w-6 h-6 rounded-full border border-gray-200" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">👤</div>
              )}
              <span className="text-xs font-medium text-gray-700">{recipe.author?.display_name || 'Chef'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
              {recipe.rating > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {recipe.rating.toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor"
                  viewBox="0 0 24 24" style={{ color: liked ? '#f97316' : undefined }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likesCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
