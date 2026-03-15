import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackerAPI, recipesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'from-amber-400 to-orange-400' },
  { key: 'lunch', label: 'Lunch', icon: '☀️', color: 'from-green-400 to-emerald-500' },
  { key: 'snacks', label: 'Snacks', icon: '🍿', color: 'from-purple-400 to-violet-500' },
  { key: 'dinner', label: 'Dinner', icon: '🌙', color: 'from-blue-400 to-indigo-500' },
];

const GOALS = { calories: 2000, protein: 150, carbs: 250, fats: 65 };

function ProgressRing({ value, max, label, unit, color, size = 100 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xl font-bold text-gray-900">{Math.round(value)}</span>
        <span className="text-[10px] text-gray-400 font-medium">{unit}</span>
      </div>
      <span className="text-xs font-semibold text-gray-600 mt-1">{label}</span>
    </div>
  );
}

export default function Tracker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [meals, setMeals] = useState({ breakfast: [], lunch: [], snacks: [], dinner: [], custom: [] });
  const [totals, setTotals] = useState({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0 });
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState(null); // which meal type we're adding to
  const [manualForm, setManualForm] = useState({ meal_name: '', calories: '', protein: '', carbs: '', fats: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchTracker = useCallback(async () => {
    try {
      setLoading(true);
      const res = await trackerAPI.list(date);
      setMeals(res.data.meals);
      setTotals(res.data.totals);
    } catch {
      toast.error('Failed to load tracker');
    } finally {
      setLoading(false);
    }
  }, [date, toast]);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchTracker();
  }, [user, navigate, fetchTracker]);

  const changeDate = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  };

  const isToday = date === new Date().toISOString().slice(0, 10);

  const handleAddFromRecipe = async (recipeId, mealType) => {
    try {
      await trackerAPI.add({ recipe: recipeId, meal_type: mealType, date });
      toast.success('Added to tracker! 🎉');
      setAddingTo(null);
      setSearchQuery('');
      setSearchResults([]);
      fetchTracker();
    } catch {
      toast.error('Failed to add meal');
    }
  };

  const handleAddManual = async (mealType) => {
    if (!manualForm.meal_name.trim()) { toast.info('Enter a meal name'); return; }
    try {
      await trackerAPI.add({
        meal_type: mealType,
        date,
        meal_name: manualForm.meal_name,
        calories: parseFloat(manualForm.calories) || 0,
        protein: parseFloat(manualForm.protein) || 0,
        carbs: parseFloat(manualForm.carbs) || 0,
        fats: parseFloat(manualForm.fats) || 0,
      });
      toast.success('Meal logged! ✅');
      setManualForm({ meal_name: '', calories: '', protein: '', carbs: '', fats: '' });
      setAddingTo(null);
      fetchTracker();
    } catch {
      toast.error('Failed to log meal');
    }
  };

  const handleDelete = async (id) => {
    try {
      await trackerAPI.delete(id);
      toast.success('Meal removed');
      fetchTracker();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const searchRecipes = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      setSearchLoading(true);
      const res = await recipesAPI.list({ search: query, page_size: 8 });
      setSearchResults(res.data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDate = (d) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Calorie Tracker</h1>
            <p className="text-gray-500 text-sm mt-1">Track your daily nutrition intake</p>
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button onClick={() => changeDate(-1)} className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center px-6 py-3 bg-white rounded-xl border border-gray-200 shadow-sm min-w-[260px]">
            <div className="text-base font-bold text-gray-900">{formatDate(date)}</div>
            {isToday && <div className="text-xs text-primary font-semibold mt-0.5">Today</div>}
          </div>
          <button onClick={() => changeDate(1)} className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Daily Totals */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-5">Daily Summary</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Calories', value: totals.total_calories, max: GOALS.calories, unit: 'kcal', color: '#f97316' },
              { label: 'Protein', value: totals.total_protein, max: GOALS.protein, unit: 'g', color: '#22c55e' },
              { label: 'Carbs', value: totals.total_carbs, max: GOALS.carbs, unit: 'g', color: '#3b82f6' },
              { label: 'Fats', value: totals.total_fats, max: GOALS.fats, unit: 'g', color: '#a855f7' },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center">
                <ProgressRing {...item} />
                <div className="text-[10px] text-gray-400 mt-0.5">{Math.round(item.max - item.value)} left</div>
              </div>
            ))}
          </div>
        </div>

        {/* Meal Sections */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            Loading tracker...
          </div>
        ) : (
          <div className="space-y-6">
            {MEAL_TYPES.map(({ key, label, icon, color }) => {
              const items = meals[key] || [];
              const sectionCals = items.reduce((s, m) => s + (m.calories || 0), 0);
              const isAdding = addingTo === key;

              return (
                <div key={key} className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                  {/* Section Header */}
                  <div className={`px-6 py-4 bg-gradient-to-r ${color} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <h3 className="text-white font-bold text-lg">{label}</h3>
                        <p className="text-white/80 text-xs font-medium">{items.length} item{items.length !== 1 ? 's' : ''} • {Math.round(sectionCals)} cal</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAddingTo(isAdding ? null : key)}
                      className="w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-all text-white"
                    >
                      <svg className={`w-5 h-5 transition-transform ${isAdding ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Items */}
                  {items.length > 0 && (
                    <div className="divide-y divide-gray-50">
                      {items.map(meal => (
                        <div key={meal.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 group transition-colors">
                          {meal.recipe_image ? (
                            <img src={meal.recipe_image} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-lg">🍽️</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{meal.meal_name || meal.recipe_title || 'Meal'}</p>
                            <p className="text-xs text-gray-400">
                              {Math.round(meal.calories)} cal • {Math.round(meal.protein)}g P • {Math.round(meal.carbs)}g C • {Math.round(meal.fats)}g F
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(meal.id)}
                            className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Meal Panel */}
                  {isAdding && (
                    <div className="px-6 py-5 bg-gray-50/80 border-t border-gray-100">
                      {/* Recipe search */}
                      <div className="mb-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Search Recipe</label>
                        <input
                          type="text"
                          placeholder="Search recipes to add..."
                          value={searchQuery}
                          onChange={e => searchRecipes(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                        {searchLoading && <p className="text-xs text-gray-400 mt-2">Searching...</p>}
                        {searchResults.length > 0 && (
                          <div className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                            {searchResults.map(r => (
                              <button
                                key={r.id}
                                onClick={() => handleAddFromRecipe(r.id, key)}
                                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
                              >
                                {r.image ? (
                                  <img src={r.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm">🍽️</div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                                  <p className="text-xs text-gray-400">Click to add</p>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 border-t border-gray-200" />
                        <span className="text-xs font-semibold text-gray-400">OR ADD MANUALLY</span>
                        <div className="flex-1 border-t border-gray-200" />
                      </div>

                      {/* Manual form */}
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Meal name"
                          value={manualForm.meal_name}
                          onChange={e => setManualForm({ ...manualForm, meal_name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                        <div className="grid grid-cols-4 gap-2">
                          {['calories', 'protein', 'carbs', 'fats'].map(f => (
                            <input
                              key={f}
                              type="number"
                              placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                              value={manualForm[f]}
                              onChange={e => setManualForm({ ...manualForm, [f]: e.target.value })}
                              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => handleAddManual(key)}
                          className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors shadow-sm"
                        >
                          Log Meal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {items.length === 0 && !isAdding && (
                    <div className="px-6 py-6 text-center">
                      <p className="text-gray-400 text-sm">No {label.toLowerCase()} logged</p>
                      <button
                        onClick={() => setAddingTo(key)}
                        className="mt-2 text-primary text-sm font-semibold hover:underline"
                      >
                        + Add a meal
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
