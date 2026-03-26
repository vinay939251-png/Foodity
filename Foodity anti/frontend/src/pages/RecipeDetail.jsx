import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recipesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ShareModal from '../components/ShareModal';
import RecipeAIChatModal from '../components/RecipeAIChatModal';

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await recipesAPI.detail(id);
        setRecipe(res.data);
        setLiked(res.data.is_liked || false);
        setSaved(res.data.is_saved || false);
        setLikesCount(res.data.likes_count || 0);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleLike = async () => {
    if (!user) { toast.info('Sign in to like recipes'); return; }
    try {
      const res = await recipesAPI.like(id);
      setLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
      if (res.data.liked) toast.success('Liked! ❤️');
    } catch { toast.error('Failed to like'); }
  };

  const handleSave = async () => {
    if (!user) { toast.info('Sign in to save recipes'); return; }
    try {
      const res = await recipesAPI.save(id);
      setSaved(res.data.saved);
      if (res.data.saved) toast.success('Saved! 📌');
      else toast.info('Removed from saved');
    } catch { toast.error('Failed to save'); }
  };

  const handleShare = () => {
    setShareOpen(true);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Sign in to comment'); return; }
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await recipesAPI.addComment(id, commentText, replyTo?.id);
      if (replyTo) {
        setComments(prev => prev.map(c =>
          c.id === replyTo.id
            ? { ...c, replies: [...(c.replies || []), res.data] }
            : c
        ));
      } else {
        setComments(prev => [res.data, ...prev]);
      }
      setCommentText('');
      setReplyTo(null);
      toast.success('Comment added! 💬');
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmittingComment(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-6 h-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading recipe...
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Recipe not found</h2>
          <Link to="/feed" className="text-primary hover:underline font-medium">Back to feed</Link>
        </div>
      </div>
    );
  }

  const tabs = ['ingredients', 'instructions', 'nutrition'];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Image */}
      <div className="relative h-[45vh] sm:h-[55vh] overflow-hidden bg-gray-200">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

        {/* Back button */}
        <Link to="/feed"
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center
            text-white hover:bg-white/40 transition-all shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              {recipe.difficulty && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md bg-white/90
                  ${recipe.difficulty === 'easy' ? 'text-green-600 border border-green-200' :
                    recipe.difficulty === 'medium' ? 'text-orange-600 border border-orange-200' :
                    'text-red-600 border border-red-200'}`}>
                  {recipe.difficulty}
                </span>
              )}
              {recipe.rating > 0 && (
                <span className="flex items-center gap-1 text-white font-medium drop-shadow-md text-sm">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {recipe.rating.toFixed(1)}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight drop-shadow-lg">{recipe.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 py-10">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-10 -mt-20">
          {[
            { label: 'Prep', value: `${recipe.prep_time}m`, icon: '⏱️' },
            { label: 'Cook', value: `${recipe.cook_time}m`, icon: '🔥' },
            { label: 'Total', value: `${recipe.total_time}m`, icon: '⏰' },
            { label: 'Serves', value: recipe.servings, icon: '🍽️' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-100 shadow-soft rounded-2xl p-4 sm:p-5 text-center transition-transform hover:-translate-y-1">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-gray-900 font-bold text-lg leading-none mb-1">{stat.value}</div>
              <div className="text-gray-500 font-medium text-xs sm:text-sm uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <button onClick={handleLike}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm
              ${liked ? 'bg-primary text-white hover:bg-primary-600' : 'bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary'}`}>
            <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likesCount} Likes
          </button>
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm
              ${saved ? 'bg-gray-900 text-white hover:bg-black' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-900 hover:text-gray-900'}`}>
            <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save Recipe
          </button>
          <button onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-gray-700 font-semibold text-sm hover:border-gray-900 hover:text-gray-900 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          
          <button onClick={() => setAiChatOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-primary text-white shadow-md shadow-primary/20 rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-orange-500 transition-all transform hover:-translate-y-0.5"
            title="Ask questions about this recipe"
          >
            <span className="text-lg">👨‍🍳</span>
            Ask AI Chef
          </button>
        </div>

        {/* Author */}
        {recipe.author && (
          <Link to={`/profile/${recipe.author.id}`} className="flex items-center justify-between mb-10 p-5 bg-white shadow-sm rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all group/author">
            <div className="flex items-center gap-4">
              <img src={recipe.author.avatar_url} alt="" className="w-12 h-12 rounded-full border border-gray-200 group-hover/author:border-primary transition-colors" />
              <div>
                <p className="text-gray-900 font-bold text-base group-hover/author:text-primary transition-colors">{recipe.author.display_name}</p>
                <p className="text-gray-500 font-medium text-sm">@{recipe.author.username}</p>
              </div>
            </div>
            <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
              {user && user.id !== recipe.author.id && (
                <Link to={`/chat?userId=${recipe.author.id}`}
                  className="px-5 py-2.5 bg-gray-100 border border-gray-200 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors">
                  Message Chef
                </Link>
              )}
              {user && user.id === recipe.author.id && (
                <Link to={`/recipe/edit/${recipe.id}`}
                  className="px-5 py-2.5 bg-primary text-white border border-transparent hover:bg-orange-600 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-primary/30 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Recipe
                </Link>
              )}
            </div>
          </Link>
        )}

        {/* Description */}
        {recipe.description && (
          <p className="text-gray-600 text-lg leading-relaxed mb-10 font-serif">{recipe.description}</p>
        )}

        {/* Tabs */}
        <div className="flex p-1 bg-white border border-gray-200 shadow-sm rounded-2xl mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all duration-300
                ${activeTab === tab
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-16 animate-fade-in bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8">
          {activeTab === 'ingredients' && (() => {
            // Parse all ingredients — split semicolon-delimited entries into individual items
            const allIngredients = [];
            recipe.ingredients?.forEach(ing => {
              const rawName = ing.name || '';
              // If the name contains semicolons, it's a concatenated list
              if (rawName.includes(';')) {
                rawName.split(';').forEach(part => {
                  const trimmed = part.trim();
                  if (trimmed) allIngredients.push({ name: trimmed, quantity: '', unit: '' });
                });
              } else if (rawName.includes(',') && rawName.length > 80) {
                // Very long comma-separated string — likely a list
                rawName.split(',').forEach(part => {
                  const trimmed = part.trim();
                  if (trimmed) allIngredients.push({ name: trimmed, quantity: '', unit: '' });
                });
              } else {
                allIngredients.push({ name: rawName, quantity: ing.quantity || '', unit: ing.unit || '' });
              }
            });

            return (
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-gray-900 mb-6">What you'll need</h3>
                {allIngredients.map((ing, i) => {
                  const isChecked = checkedIngredients[i] || false;
                  return (
                    <button
                      key={i}
                      onClick={() => setCheckedIngredients(prev => ({ ...prev, [i]: !prev[i] }))}
                      className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all text-left group
                        ${isChecked ? 'bg-green-50 border border-green-100' : 'hover:bg-orange-50 border border-transparent'}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                        ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-primary'}`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-base flex-1 transition-all ${isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {ing.name}
                      </span>
                      {(ing.quantity || ing.unit) && (
                        <span className={`font-bold text-sm shrink-0 transition-all
                          ${isChecked ? 'text-green-400' : 'text-primary'}`}>
                          {ing.quantity} {ing.unit}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })()}

          {activeTab === 'instructions' && (() => {
            // Parse all steps — split paragraph-form instructions into individual sentences
            const allSteps = [];
            recipe.steps?.forEach(step => {
              const raw = (step.instruction || '').trim();
              if (!raw) return;
              // Try to split by numbered patterns like "1." "2." etc.
              const numberedSplit = raw.split(/(?:^|\.\s+)(?=\d+[\.\)]\s)/);
              if (numberedSplit.length > 1) {
                numberedSplit.forEach(s => {
                  const cleaned = s.replace(/^\d+[\.\)]\s*/, '').trim();
                  if (cleaned) allSteps.push(cleaned.replace(/\.$/, ''));
                });
              } else {
                // Split by periods followed by a space and uppercase letter (sentence boundaries)
                const sentences = raw.split(/\.\s+(?=[A-Z])/);
                sentences.forEach(s => {
                  const cleaned = s.trim().replace(/\.$/, '');
                  if (cleaned && cleaned.length > 5) allSteps.push(cleaned);
                });
                // If only one sentence resulted, just use the whole text
                if (allSteps.length === 0 && raw.length > 5) {
                  allSteps.push(raw.replace(/\.$/, ''));
                }
              }
            });

            return (
              <div className="space-y-5">
                <h3 className="text-xl font-display font-bold text-gray-900 mb-6">Step-by-step instructions</h3>
                {allSteps.map((stepText, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center
                      text-primary font-black text-lg shrink-0 border border-orange-200 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed pt-1.5">{stepText}.</p>
                  </div>
                ))}
              </div>
            );
          })()}

          {activeTab === 'nutrition' && recipe.nutrition && (
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-6">Nutrition Facts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Calories', value: recipe.nutrition.calories, unit: 'kcal' },
                  { label: 'Protein', value: recipe.nutrition.protein, unit: 'g' },
                  { label: 'Carbs', value: recipe.nutrition.carbs, unit: 'g' },
                  { label: 'Fats', value: recipe.nutrition.fats, unit: 'g' },
                ].map((n, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-black text-gray-900">{n.value}</div>
                    <div className="text-primary font-bold text-xs mt-1 uppercase tracking-wide">{n.unit}</div>
                    <div className="text-gray-500 font-medium text-sm mt-3">{n.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="pb-20">
          <h3 className="text-2xl font-display font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
            Comments {comments.length > 0 && <span className="text-gray-500 text-lg font-medium ml-2">({comments.length})</span>}
          </h3>

          {/* Comment form */}
          <form onSubmit={handleComment} className="mb-10 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            {replyTo && (
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 text-sm">
                <span className="text-gray-600 font-medium">Replying to <span className="text-primary">{replyTo.user?.display_name}</span></span>
                <button type="button" onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-red-500 font-bold">✕ Cancel</button>
              </div>
            )}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 flex items-center justify-center text-sm border border-gray-200 shadow-sm">
                {user ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : '👤'}
              </div>
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={user ? 'Share your thoughts...' : 'Sign in to join the conversation'}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  disabled={!user}
                  className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 font-medium
                    placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!user || !commentText.trim() || submittingComment}
                  className="px-6 py-3 bg-primary rounded-xl text-white text-sm font-bold shadow-md shadow-primary/20
                    hover:bg-primary-600 hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:hover:translate-y-0"
                >
                  {submittingComment ? '...' : 'Post'}
                </button>
              </div>
            </div>
          </form>

          {/* Comments list */}
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <Link to={`/profile/${comment.user?.id}`} className="shrink-0 group/comm">
                    <img src={comment.user?.avatar_url || ''} alt="" className="w-10 h-10 rounded-full border border-gray-200 group-hover/comm:border-primary transition-colors" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <Link to={`/profile/${comment.user?.id}`} className="text-gray-900 text-base font-bold hover:text-primary transition-colors">{comment.user?.display_name}</Link>
                      <span className="text-gray-400 text-xs font-medium">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed">{comment.text}</p>
                    <button
                      onClick={() => setReplyTo(comment)}
                      className="text-sm font-semibold text-gray-400 hover:text-primary mt-3 transition-colors inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                      Reply
                    </button>

                    {/* Replies */}
                    {comment.replies?.length > 0 && (
                      <div className="mt-5 space-y-4 pl-5 sm:pl-6 border-l-2 border-gray-100 relative">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <Link to={`/profile/${reply.user?.id}`} className="shrink-0 group/rep">
                              <img src={reply.user?.avatar_url || ''} alt="" className="w-8 h-8 rounded-full border border-gray-200 group-hover/rep:border-primary transition-colors" />
                            </Link>
                            <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Link to={`/profile/${reply.user?.id}`} className="text-gray-900 text-sm font-bold hover:text-primary transition-colors">{reply.user?.display_name}</Link>
                                <span className="text-gray-400 text-[11px] font-medium">
                                  {new Date(reply.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm py-12">
                <span className="text-4xl block mb-3">💬</span>
                <h3 className="text-gray-900 font-bold text-lg">No comments yet</h3>
                <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {recipe && <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} recipe={recipe} />}

      <RecipeAIChatModal
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        recipe={recipe}
      />
    </div>
  );
}
