import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus as FiPlus, Trash2 as FiTrash2, Save as FiSave, Image as FiImage, Clock as FiClock, Users as FiUsers, Tag as FiTag } from 'lucide-react';

export default function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    prep_time: 15,
    cook_time: 30,
    servings: 4,
    difficulty: 'medium',
    ingredients: [{ name: '', quantity: '', unit: '', order: 0 }],
    steps: [{ instruction: '', step_number: 1 }],
    nutrition: { calories: '', protein: '', carbs: '', fats: '' }
  });

  useEffect(() => {
    if (isEditing) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      const res = await recipesAPI.detail(id);
      const r = res.data;
      setFormData({
        title: r.title || '',
        description: r.description || '',
        image: r.image || '',
        prep_time: r.prep_time || 0,
        cook_time: r.cook_time || 0,
        servings: r.servings || 1,
        difficulty: r.difficulty || 'medium',
        ingredients: r.ingredients?.length ? r.ingredients : [{ name: '', quantity: '', unit: '', order: 0 }],
        steps: r.steps?.length ? r.steps : [{ instruction: '', step_number: 1 }],
        nutrition: r.nutrition || { calories: '', protein: '', carbs: '', fats: '' }
      });
    } catch (err) {
      toast.error('Failed to load recipe');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      nutrition: { ...prev.nutrition, [name]: value ? Number(value) : null }
    }));
  };

  // --- Ingredients ---
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '', order: prev.ingredients.length }]
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length <= 1) return;
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  // --- Steps ---
  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index].instruction = value;
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { instruction: '', step_number: prev.steps.length + 1 }]
    }));
  };

  const removeStep = (index) => {
    if (formData.steps.length <= 1) return;
    const newSteps = formData.steps.filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, step_number: i + 1 })); // Re-number
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error("Recipe title is required");
    
    // Clean up empty rows
    const payload = { ...formData };
    payload.ingredients = payload.ingredients.filter(i => i.name.trim() !== '');
    payload.steps = payload.steps.filter(s => s.instruction.trim() !== '');
    
    // Clean up empty nutrition
    if (!payload.nutrition.calories && !payload.nutrition.protein) {
       payload.nutrition = null;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        await recipesAPI.update(id, payload);
        toast.success('Recipe updated!');
        navigate(`/recipe/${id}`);
      } else {
        const res = await recipesAPI.create(payload);
        toast.success('Recipe created!');
        navigate(`/recipe/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-100 bg-white">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
            </h1>
            <p className="text-gray-500 mt-2">
              Share your culinary masterpiece with the Foodity community.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            
            {/* Basic Info */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleBasicChange}
                  placeholder="e.g. Classic Margherita Pizza"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleBasicChange}
                  rows={3}
                  placeholder="Tell us about this recipe..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiImage className="text-gray-400" /> Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleBasicChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                {formData.image && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 h-48 relative">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiClock className="text-gray-400" /> Prep (mins)
                  </label>
                  <input type="number" name="prep_time" value={formData.prep_time} onChange={handleBasicChange} min="0" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiClock className="text-gray-400" /> Cook (mins)
                  </label>
                  <input type="number" name="cook_time" value={formData.cook_time} onChange={handleBasicChange} min="0" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiUsers className="text-gray-400" /> Servings
                  </label>
                  <input type="number" name="servings" value={formData.servings} onChange={handleBasicChange} min="1" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiTag className="text-gray-400" /> Difficulty
                  </label>
                  <select name="difficulty" value={formData.difficulty} onChange={handleBasicChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Ingredients */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h2 className="text-xl font-bold text-gray-900">Ingredients</h2>
                <button type="button" onClick={addIngredient} className="text-primary hover:text-orange-600 font-medium flex items-center gap-1 text-sm bg-orange-50 px-3 py-1 rounded-full">
                  <FiPlus /> Add Ingredient
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-3 items-start animate-fade-in group">
                    <input
                      type="text"
                      placeholder="e.g. Flour"
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(i, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. 2"
                      value={ing.quantity}
                      onChange={(e) => handleIngredientChange(i, 'quantity', e.target.value)}
                      className="w-24 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. cups"
                      value={ing.unit}
                      onChange={(e) => handleIngredientChange(i, 'unit', e.target.value)}
                      className="w-24 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(i)}
                      className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                      disabled={formData.ingredients.length <= 1}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Steps */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h2 className="text-xl font-bold text-gray-900">Instructions</h2>
                <button type="button" onClick={addStep} className="text-primary hover:text-orange-600 font-medium flex items-center gap-1 text-sm bg-orange-50 px-3 py-1 rounded-full">
                  <FiPlus /> Add Step
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start animate-fade-in">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-primary flex items-center justify-center font-bold mt-1">
                      {step.step_number}
                    </div>
                    <textarea
                      placeholder={`Step ${step.step_number} instructions...`}
                      value={step.instruction}
                      onChange={(e) => handleStepChange(i, e.target.value)}
                      rows={2}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="p-3 mt-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                      disabled={formData.steps.length <= 1}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </section>

             {/* Nutrition */}
             <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Nutrition (Optional)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                  <input type="number" name="calories" value={formData.nutrition.calories} onChange={handleNutritionChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Protein (g)</label>
                  <input type="number" name="protein" value={formData.nutrition.protein} onChange={handleNutritionChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carbs (g)</label>
                  <input type="number" name="carbs" value={formData.nutrition.carbs} onChange={handleNutritionChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fats (g)</label>
                  <input type="number" name="fats" value={formData.nutrition.fats} onChange={handleNutritionChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 rounded-xl font-medium bg-primary text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><FiSave /> {isEditing ? 'Save Changes' : 'Create Recipe'}</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
