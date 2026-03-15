import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [boards, setBoards] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mine'); // 'mine' or 'saved'


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getProfile(id);
        setProfile(res.data.user);
        setRecipes(res.data.recipes || []);
        setBoards(res.data.boards || []);
        setStats(res.data.stats || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">User not found</h2>
          <Link to="/feed" className="text-primary hover:underline font-medium">Back to feed</Link>
        </div>
      </div>
    );
  }

  const isMe = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-orange-100 to-amber-100" />
          <div className="px-8 pb-8 -mt-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt={profile.display_name}
                className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover bg-gray-100"
              />
              <div className="flex-1 pt-4">
                <h1 className="text-2xl font-display font-bold text-gray-900">{profile.display_name}</h1>
                <p className="text-gray-500 font-medium">@{profile.username}</p>
                {profile.bio && <p className="text-gray-600 mt-2 max-w-lg">{profile.bio}</p>}
              </div>
              <div className="flex gap-3">
                {isMe ? (
                  <Link to="/settings" className="px-6 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
                    Edit Profile
                  </Link>
                ) : (
                  <Link to={`/chat?userId=${profile.id}`} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm shadow-primary/30">
                    Message Chef
                  </Link>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100">
              {[
                { label: 'Recipes', value: stats.recipes_count || 0 },
                { label: 'Likes Given', value: stats.likes_given || 0 },
                { label: 'Boards', value: stats.boards_count || 0 },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-sm text-gray-500 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-6 mt-8">
          <button
            onClick={() => setActiveTab('mine')}
            className={`pb-4 text-base font-bold transition-colors ${
              activeTab === 'mine' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {isMe ? 'My Recipes' : 'Recipes'}
          </button>
          
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-4 text-base font-bold transition-colors ${
              activeTab === 'saved' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Saved Recipes
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'mine' ? (
          <>
            {recipes.length > 0 ? (
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                {recipes.map(recipe => (
                  <div key={recipe.id} className="break-inside-avoid">
                    <RecipeCard recipe={recipe} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-4xl block mb-3">🍳</span>
                <h3 className="text-gray-900 font-bold text-lg">No recipes yet</h3>
                <p className="text-gray-500 text-sm">
                  {isMe ? 'Create your first recipe!' : 'This chef hasn\'t shared any recipes yet.'}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {boards.length > 0 ? (
               <div className="space-y-8">
                 {boards.map(board => (
                   <div key={board.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                     <h3 className="text-xl font-bold text-gray-900 mb-2">{board.name}</h3>
                     {board.description && <p className="text-gray-500 text-sm mb-4">{board.description}</p>}
                     
                     {board.recipes && board.recipes.length > 0 ? (
                       <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                         {board.recipes.map(sr => (
                           <div key={sr.recipe.id} className="break-inside-avoid">
                             <RecipeCard recipe={sr.recipe} />
                           </div>
                         ))}
                       </div>
                     ) : (
                         <p className="text-gray-400 text-sm italic">No recipes in this board yet.</p>
                     )}
                   </div>
                 ))}
               </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-4xl block mb-3">🔖</span>
                <h3 className="text-gray-900 font-bold text-lg">No saved recipes</h3>
                <p className="text-gray-500 text-sm">
                  {isMe ? 'Save recipes you love to find them here.' : 'This chef hasn\'t saved any recipes publicly.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
