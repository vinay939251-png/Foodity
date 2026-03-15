import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Cpu as FiCpu, Plus as FiPlus, Trash2 as FiTrash2, Save as FiSave, AlertCircle as FiAlertCircle } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';

export default function AIGenerator() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState(['']);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
       setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const validIngredients = ingredients.filter(i => i.trim() !== '');
    if (!validIngredients.length && !prompt.trim()) {
      return toast.error("Please enter at least one ingredient or a prompt");
    }

    setIsGenerating(true);
    setGeneratedRecipe(null);
    try {
      const res = await recipesAPI.generateAIAssistant({
        ingredients: validIngredients,
        prompt: prompt.trim()
      });
      setGeneratedRecipe(res.data.recipe);
      toast.success("Recipe generated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "AI failed to generate recipe. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;
    setIsSaving(true);
    try {
      const validDifficulties = ['easy', 'medium', 'hard'];
      let safeDifficulty = (generatedRecipe.difficulty || 'medium').toLowerCase();
      if (!validDifficulties.includes(safeDifficulty)) {
         safeDifficulty = safeDifficulty.includes('easy') ? 'easy' : safeDifficulty.includes('hard') ? 'hard' : 'medium';
      }

      const recipeToSave = {
        ...generatedRecipe,
        difficulty: safeDifficulty,
        steps: generatedRecipe.steps.map((step, index) => ({
          ...step,
          step_number: index + 1
        }))
      };
      const res = await recipesAPI.create(recipeToSave);
      toast.success("Recipe saved successfully!");
      navigate(`/recipe/${res.data.id}`);
    } catch (err) {
       toast.error("Failed to save the generated recipe.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
             <div className="w-16 h-16 bg-orange-100 text-primary rounded-full flex items-center justify-center text-2xl shadow-inner">
               <FiCpu />
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Gemini AI Chef</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Tell the AI what ingredients you have in your fridge or what you're craving, and it will generate a complete, step-by-step recipe for you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-orange-50/50">
               <h2 className="font-bold text-gray-900 flex items-center gap-2">
                 Your Ingredients
               </h2>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What's in your fridge?</label>
                  <div className="space-y-3">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={ing}
                          onChange={(e) => handleIngredientChange(i, e.target.value)}
                          placeholder="e.g. 2 eggs, spinach, cheddar cheese"
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        />
                        <button type="button" onClick={() => removeIngredient(i)} disabled={ingredients.length === 1} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50">
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addIngredient} className="mt-3 text-sm text-primary font-medium hover:text-orange-600 flex items-center gap-1">
                    <FiPlus /> Add another ingredient
                  </button>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Any special requests? (Optional)</label>
                 <textarea
                   value={prompt}
                   onChange={e => setPrompt(e.target.value)}
                   rows={3}
                   placeholder="e.g. Make it low carb, spicy, or kid-friendly..."
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
                 />
               </div>

               <button
                 type="submit"
                 disabled={isGenerating}
                 className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-70"
               >
                 {isGenerating ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> Cooking up ideas...</>
                 ) : (
                    <><FiCpu /> Generate Recipe</>
                 )}
               </button>
            </form>
          </div>

          {/* Results Area */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 flex flex-col overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
               <h2 className="font-bold text-gray-900">Generated Recipe</h2>
             </div>
             
             <div className="flex-1 p-6 relative">
                 {!generatedRecipe && !isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                      <div className="w-16 h-16 mb-4 opacity-20">
                         <svg fill="currentColor" viewBox="0 0 24 24"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>
                      </div>
                      <p>Your AI-generated recipe will appear here.</p>
                    </div>
                 )}
                 {isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-primary space-y-4">
                      <div className="w-12 h-12 border-4 border-orange-200 border-t-primary rounded-full animate-spin" />
                      <p className="font-medium animate-pulse">Consulting the AI Chef...</p>
                    </div>
                 )}
                 
                 {generatedRecipe && (
                    <div className="space-y-6 animate-fade-in pb-16">
                       <h3 className="text-2xl font-bold font-display text-gray-900 leading-tight">{generatedRecipe.title}</h3>
                       <p className="text-gray-600 italic">{generatedRecipe.description}</p>
                       
                       <div className="flex flex-wrap gap-2">
                           <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
                              {generatedRecipe.difficulty}
                           </span>
                           <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              Prep: {generatedRecipe.prep_time}m
                           </span>
                           <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              Cook: {generatedRecipe.cook_time}m
                           </span>
                       </div>

                       <div>
                          <h4 className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">Ingredients</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                             {generatedRecipe.ingredients.map((ing, i) => (
                               <li key={i} className="flex gap-2">
                                 <span className="text-primary">•</span> 
                                 <span className="font-semibold">{ing.quantity} {ing.unit}</span> {ing.name}
                               </li>
                             ))}
                          </ul>
                       </div>

                       <div>
                          <h4 className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">Instructions</h4>
                          <ol className="space-y-3 text-sm text-gray-700">
                             {generatedRecipe.steps.map((step, i) => (
                               <li key={i} className="flex gap-3">
                                 <span className="font-bold text-gray-400">{i+1}.</span> 
                                 <span>{step.instruction}</span>
                               </li>
                             ))}
                          </ol>
                       </div>
                       
                       {generatedRecipe.nutrition && (
                          <div className="p-4 bg-orange-50/50 rounded-xl grid grid-cols-4 text-center text-sm gap-2">
                             <div><p className="text-gray-500 text-xs uppercase tracking-wide">Calories</p><p className="font-bold text-gray-900">{generatedRecipe.nutrition.calories}</p></div>
                             <div><p className="text-gray-500 text-xs uppercase tracking-wide">Protein</p><p className="font-bold text-gray-900">{generatedRecipe.nutrition.protein}g</p></div>
                             <div><p className="text-gray-500 text-xs uppercase tracking-wide">Carbs</p><p className="font-bold text-gray-900">{generatedRecipe.nutrition.carbs}g</p></div>
                             <div><p className="text-gray-500 text-xs uppercase tracking-wide">Fats</p><p className="font-bold text-gray-900">{generatedRecipe.nutrition.fats}g</p></div>
                          </div>
                       )}

                       <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-end">
                           <button 
                             onClick={handleSaveRecipe}
                             disabled={isSaving}
                             className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-70"
                           >
                             {isSaving ? 'Saving...' : <><FiSave /> Save to My Recipes</>}
                           </button>
                       </div>
                    </div>
                 )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
