"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save, Edit3 } from "lucide-react";
import { getCookingRecipes, deleteCookingRecipe } from "@/app/lib/recipeActionsSingular";

interface RecipeDetailScreenProps {
  recipeId: string;
  onBack: () => void;
}

export default function RecipeDetailScreen({ recipeId, onBack }: RecipeDetailScreenProps) {
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getCookingRecipes();
      if (res.success && res.recipes) {
        const found = res.recipes.find((r: any) => r.id === recipeId);
        setRecipe(found);
      }
      setIsLoading(false);
    }
    load();
  }, [recipeId]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      const res = await deleteCookingRecipe(recipeId);
      if (res.success) {
        onBack();
      } else {
        alert("Failed to delete recipe: " + res.error);
      }
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">Loading...</div>;
  if (!recipe) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">Recipe not found.</div>;

  // Assuming it's linked to a template by naming convention "Recipe for X"
  const templateName = recipe.name.replace("Recipe for ", "");

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10">
        <button onClick={onBack} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity">
          <ChevronLeft size={24} className="-ml-1" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-4">
           <button className="text-[var(--color-ios-gray-2)] active:opacity-70 transition-opacity"><Save size={22} /></button>
           <button className="text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"><Edit3 size={22} /></button>
        </div>
      </div>
      
      <div className="px-6 pb-32 max-w-xl mx-auto w-full flex-1 flex flex-col pt-2">
         <h1 className="text-[20px] font-bold text-center text-black mb-8 px-4">{recipe.name}</h1>

         {/* Recipe Of */}
         <div className="mb-6 flex-shrink-0">
           <h2 className="text-[17px] font-bold text-black mb-3">Recipe of</h2>
           <div className="relative">
             <div className="w-full bg-white rounded-xl py-3.5 px-4 text-[17px] text-black shadow-sm flex justify-between items-center opacity-70">
                <span>{templateName}</span>
                <ChevronDown size={20} className="text-[#C7C7CC]" />
             </div>
           </div>
         </div>

         {/* Rich Text Editor Display */}
         <div className="w-full bg-white rounded-xl shadow-sm border border-[#E5E5EA] overflow-hidden flex flex-col mb-6">
           <div className="flex justify-between items-center px-4 py-3 border-b border-[#E5E5EA]">
              <span className="text-[17px] font-bold text-black">Recipe</span>
              <button className="text-[var(--color-ios-blue)] font-bold text-[15px] active:opacity-70 transition-opacity flex items-center gap-1 opacity-50">
                 123...
              </button>
           </div>
           
           {/* Render the saved HTML */}
           <div 
             className="w-full min-h-[350px] p-4 text-[17px] text-black whitespace-pre-wrap leading-relaxed custom-html-content"
             dangerouslySetInnerHTML={{ __html: recipe.instructions }}
           />
         </div>
      </div>

      {/* Fixed Bottom Delete Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none pb-[env(safe-area-inset-bottom)]">
         <div className="max-w-xl mx-auto pointer-events-auto">
           <button 
              onClick={handleDelete} 
              className="w-full py-4 rounded-full font-semibold text-[17px] border-2 border-red-500 text-red-500 active:bg-red-50 transition-colors bg-white shadow-sm"
           >
             Delete Recipe
           </button>
         </div>
      </div>
    </div>
  );
}
// Add a small helper component for the ChevronDown to avoid another lucide import issue if needed, 
// though it's standard. Let's make sure to import ChevronDown.
import { ChevronDown } from "lucide-react";
