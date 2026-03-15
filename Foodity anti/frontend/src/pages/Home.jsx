import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import RecipeCard from '../components/RecipeCard';
import { recipesAPI } from '../services/api';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Healthy', 'Quick & Easy'];

const breakpointCols = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 2,
  640: 2,
};

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const fetchRecipes = useCallback(async (pageNum, cat, search, append = false) => {
    try {
      setLoading(true);
      const params = { page: pageNum, ordering: '?', t: Date.now() };
      if (cat && cat !== 'All') params.category = cat;
      if (search) {
        params.search = search;
        delete params.ordering; // If searching, default backend sorting is better
      }
      const res = await recipesAPI.list(params);
      const newRecipes = res.data.results;
      setRecipes(prev => append ? [...prev, ...newRecipes] : newRecipes);
      setHasMore(!!res.data.next);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchRecipes(1, category, searchQuery);
  }, [category, searchQuery, fetchRecipes]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRecipes(nextPage, category, searchQuery, true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
            {searchQuery ? (
               <>Results for "<span className="text-primary">{searchQuery}</span>"</>
            ) : (
               <>Discover <span className="text-primary">Inspiration</span></>
            )}
          </h1>
          {!searchQuery && (
            <p className="text-gray-500 max-w-2xl">Browse thousands of curated recipes designed to be simple, beautiful, and delicious.</p>
          )}
          {searchQuery && (
            <p className="text-gray-500">Showing {recipes.length} matching recipes</p>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-3 mb-10 overflow-x-auto py-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300
                ${category === cat
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105 transform'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/50 hover:text-primary hover:shadow-sm'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recipe grid */}
        {loading && recipes.length === 0 ? (
          <Masonry
            breakpointCols={breakpointCols}
            className="masonry-grid"
            columnClassName="masonry-grid-column"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-white animate-pulse">
                <div className="aspect-[4/5] bg-gray-200" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full line-clamp-2" />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </Masonry>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-500">We couldn't find anything that matches. Try a different search or clear your category filter.</p>
            <button 
              onClick={() => { setCategory('All'); window.history.replaceState(null, '', '/feed'); }}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <Masonry
              breakpointCols={breakpointCols}
              className="masonry-grid"
              columnClassName="masonry-grid-column"
            >
              {recipes.map((recipe, i) => (
                <div key={recipe.id} className="animate-fade-in" style={{ animationDelay: `${(i % 8) * 0.05}s` }}>
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </Masonry>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-12 mb-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-10 py-4 bg-white border border-gray-200 shadow-sm rounded-xl text-gray-700 font-semibold
                    hover:bg-gray-50 hover:border-gray-300 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading Recipes...
                    </span>
                  ) : 'Load More Recipes'}
                </button>
              </div>
            )}
            
            {!hasMore && recipes.length > 0 && (
              <div className="text-center mt-12 mb-8 text-gray-400 text-sm">
                You've reached the end of the feed 🥘
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
