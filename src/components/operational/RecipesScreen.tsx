"use client";

import { useState, useEffect } from "react";
import { Search, ChevronRight, Plus } from "lucide-react";
import { TopBar } from "../layout/TopBar";
import { BottomNav } from "../layout/BottomNav";
import { getRecipes, createRecipe } from "@/app/lib/recipeActions";

interface RecipesScreenProps {
  onProfileClick?: () => void;
  onViewRecipe?: (id: string) => void;
  onNavTabChange: (tab: 'production' | 'inventory' | 'schedules' | 'recipes') => void;
}

export default function RecipesScreen({ onProfileClick, onViewRecipe, onNavTabChange }: RecipesScreenProps) {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState("");
  const [newRecipeDesc, setNewRecipeDesc] = useState("");

  const loadRecipes = async () => {
    setIsLoading(true);
    const res = await getRecipes();
    if (res.success && res.recipes) {
      setRecipes(res.recipes);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleCreate = async () => {
    if (!newRecipeName) return;
    const res = await createRecipe({ name: newRecipeName, description: newRecipeDesc });
    if (res.success) {
      setNewRecipeName("");
      setNewRecipeDesc("");
      setIsAdding(false);
      loadRecipes();
    } else {
      alert(res.error || "Failed to create recipe.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-24">
      <TopBar onProfileClick={onProfileClick} />
      
      <main className="px-6 flex-1 max-w-xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-4xl font-bold tracking-tight text-black">Recipes</h1>
           <button 
             onClick={() => setIsAdding(!isAdding)}
             className="w-10 h-10 rounded-full bg-[var(--color-ios-blue)] text-white flex justify-center items-center shadow"
           >
             <Plus size={24} />
           </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={20} className="text-[var(--color-ios-gray-2)]" />
          </div>
          <input
            type="text"
            placeholder="Search menus"
            className="w-full bg-[var(--color-ios-gray-5)] rounded-xl py-2 pl-10 pr-4 text-[17px] text-black placeholder:text-[var(--color-ios-gray-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ios-blue)]"
          />
        </div>

        {isAdding && (
           <div className="bg-white p-5 rounded-2xl mb-6 shadow-sm border border-[var(--color-ios-gray-5)]">
              <h3 className="text-[17px] font-bold text-black mb-4">Add New Recipe Menu</h3>
              <input 
                 type="text" 
                 placeholder="Menu Name (e.g. Nasi Campur)" 
                 value={newRecipeName}
                 onChange={e => setNewRecipeName(e.target.value)}
                 className="w-full bg-[var(--color-ios-gray-6)] rounded-xl py-3 px-4 text-[15px] text-black mb-3 outline-none"
              />
              <input 
                 type="text" 
                 placeholder="Description (Optional)" 
                 value={newRecipeDesc}
                 onChange={e => setNewRecipeDesc(e.target.value)}
                 className="w-full bg-[var(--color-ios-gray-6)] rounded-xl py-3 px-4 text-[15px] text-black mb-4 outline-none"
              />
              <div className="flex gap-3">
                 <button onClick={() => setIsAdding(false)} className="flex-1 py-3 rounded-xl bg-[var(--color-ios-gray-6)] text-black font-semibold text-[15px]">Cancel</button>
                 <button onClick={handleCreate} className="flex-1 py-3 rounded-xl bg-[var(--color-ios-blue)] text-white font-semibold text-[15px]">Save Menu</button>
              </div>
           </div>
        )}

        {/* Recipe List */}
        <div>
          <h2 className="text-[17px] font-semibold text-black mb-4">All Menus</h2>
          <div className="flex flex-col gap-3">
             {isLoading ? (
                <p className="text-[15px] text-[var(--color-ios-gray-2)]">Loading...</p>
             ) : recipes.length > 0 ? (
                recipes.map(r => (
                  <div 
                    key={r.id}
                    onClick={() => onViewRecipe && onViewRecipe(r.id)}
                    className="bg-white rounded-2xl p-4 flex justify-between items-center shadow-sm cursor-pointer active:opacity-80 transition-opacity"
                  >
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-[17px] text-black">{r.name}</h3>
                      <p className="text-[13px] text-[var(--color-ios-gray-1)]">
                        {r.ingredients?.length || 0} Ingredients • {r.steps?.length || 0} Steps
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-[var(--color-ios-gray-2)]" />
                  </div>
                ))
             ) : (
                <p className="text-[15px] text-[var(--color-ios-gray-1)]">No recipes found. Add one above.</p>
             )}
          </div>
        </div>

      </main>

      <BottomNav activeTab="recipes" onTabChange={onNavTabChange} />
    </div>
  );
}
