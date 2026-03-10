"use client";

import { useState, useEffect } from "react";
import { Search, ChevronRight, FileText, ChefHat, Plus } from "lucide-react";
import { TopBar } from "../layout/TopBar";
import { BottomNav } from "../layout/BottomNav";
import { getProductionTemplates, getCookingRecipes, createProductionTemplate, createCookingRecipe } from "@/app/lib/recipeActions";

interface DatabasesScreenProps {
  onProfileClick?: () => void;
  onViewTemplate?: (id: string) => void;
  onViewRecipe?: (id: string) => void;
  onNavTabChange: (tab: 'production' | 'inventory' | 'schedules' | 'recipes') => void;
}

export default function DatabasesScreen({ onProfileClick, onViewTemplate, onViewRecipe, onNavTabChange }: DatabasesScreenProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Modals
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);

  const [newTempName, setNewTempName] = useState("");
  const [newRecName, setNewRecName] = useState("");
  const [newRecInstructions, setNewRecInstructions] = useState("");

  const loadAll = async () => {
    setIsLoading(true);
    const [tempRes, recRes] = await Promise.all([
      getProductionTemplates(),
      getCookingRecipes()
    ]);
    if (tempRes.success) setTemplates(tempRes.templates || []);
    if (recRes.success) setRecipes(recRes.recipes || []);
    setIsLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreateTemplate = async () => {
    if (!newTempName) return;
    const res = await createProductionTemplate({ name: newTempName });
    if (res.success) {
      setNewTempName(""); setShowAddTemplate(false);
      loadAll();
      if(onViewTemplate && res.template) onViewTemplate(res.template.id);
    } else alert(res.error);
  };

  const handleCreateRecipe = async () => {
    if (!newRecName || !newRecInstructions) return;
    
    // Validate Word Count (< 500)
    const wordCount = newRecInstructions.trim().split(/\s+/).length;
    if (wordCount > 500) {
      alert(`Cooking instructions cannot exceed 500 words. (Currently: ${wordCount})`);
      return;
    }

    const res = await createCookingRecipe({ name: newRecName, instructions: newRecInstructions });
    if (res.success) {
      setNewRecName(""); setNewRecInstructions(""); setShowAddRecipe(false);
      loadAll();
    } else alert(res.error);
  };

  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-24">
      <TopBar onProfileClick={onProfileClick} />
      
      <main className="px-6 flex-1 max-w-xl mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">Databases</h1>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={20} className="text-[var(--color-ios-gray-2)]" />
          </div>
          <input type="text" placeholder="Search databases" className="w-full bg-[var(--color-ios-gray-5)] rounded-xl py-2 pl-10 pr-4 text-[17px] text-black placeholder:text-[var(--color-ios-gray-2)] focus:outline-none" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
           <button onClick={() => { setShowAddTemplate(true); setShowAddRecipe(false); }} className="flex-1 py-4 px-2 rounded-2xl border-2 border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] font-bold text-[14px] flex flex-col items-center justify-center gap-2 hover:bg-[var(--color-ios-blue)]/5 transition-colors text-center">
              <FileText size={28} strokeWidth={2} />
              <span className="leading-tight">Create New<br/>Production Template</span>
           </button>
           <button onClick={() => { setShowAddRecipe(true); setShowAddTemplate(false); }} className="flex-1 py-4 px-2 rounded-2xl border-2 border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] font-bold text-[14px] flex flex-col items-center justify-center gap-2 hover:bg-[var(--color-ios-blue)]/5 transition-colors text-center">
              <ChefHat size={28} strokeWidth={2} />
              <span className="leading-tight">Create New<br/>Cooking Recipe</span>
           </button>
        </div>

        {/* Creation Forms */}
        {showAddTemplate && (
           <div className="bg-white p-5 rounded-2xl mb-8 shadow-sm border border-[var(--color-ios-blue)]/30 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-[17px] font-bold text-black mb-4 flex items-center gap-2"><FileText size={20} className="text-[var(--color-ios-blue)]"/> New Production Template</h3>
              <input type="text" placeholder="Menu Name (e.g. Nasi Campur)" value={newTempName} onChange={e => setNewTempName(e.target.value)} className="w-full bg-[var(--color-ios-gray-6)] rounded-xl py-3 px-4 text-[15px] text-black mb-4 outline-none border border-transparent focus:border-[var(--color-ios-blue)]" />
              <div className="flex gap-3">
                 <button onClick={() => setShowAddTemplate(false)} className="flex-1 py-3 rounded-xl bg-[var(--color-ios-gray-6)] text-black font-semibold text-[15px]">Cancel</button>
                 <button onClick={handleCreateTemplate} className="flex-1 py-3 rounded-xl bg-[var(--color-ios-blue)] text-white font-semibold text-[15px]">Continue to Builder</button>
              </div>
           </div>
        )}

        {showAddRecipe && (
           <div className="bg-white p-5 rounded-2xl mb-8 shadow-sm border border-[var(--color-ios-blue)]/30 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-[17px] font-bold text-black mb-4 flex items-center gap-2"><ChefHat size={20} className="text-[var(--color-ios-blue)]"/> New Cooking Recipe</h3>
              <input type="text" placeholder="Recipe Name (e.g. Resep Bumbu Kuning)" value={newRecName} onChange={e => setNewRecName(e.target.value)} className="w-full bg-[var(--color-ios-gray-6)] rounded-xl py-3 px-4 text-[15px] text-black mb-3 outline-none border border-transparent focus:border-[var(--color-ios-blue)]" />
              <textarea 
                 placeholder="1. Prepare ingredients...&#10;2. Cook on medium heat...&#10;(Max 500 words)" 
                 value={newRecInstructions} onChange={e => setNewRecInstructions(e.target.value)} 
                 rows={6}
                 className="w-full bg-[var(--color-ios-gray-6)] rounded-xl py-3 px-4 text-[15px] text-black mb-4 outline-none resize-none border border-transparent focus:border-[var(--color-ios-blue)]" 
              />
              <div className="flex gap-3">
                 <button onClick={() => setShowAddRecipe(false)} className="flex-1 py-3 rounded-xl bg-[var(--color-ios-gray-6)] text-black font-semibold text-[15px]">Cancel</button>
                 <button onClick={handleCreateRecipe} disabled={!newRecName || !newRecInstructions} className="flex-1 py-3 rounded-xl bg-[var(--color-ios-blue)] text-white font-semibold text-[15px] disabled:opacity-50">Save Recipe</button>
              </div>
           </div>
        )}

        {/* Existing Lists */}
        {isLoading ? <p className="text-center mt-10 text-[var(--color-ios-gray-2)]">Loading Databases...</p> : (
           <div className="space-y-8">
             <div>
                <h2 className="text-[17px] font-semibold text-[var(--color-ios-gray-1)] mb-3 flex items-center gap-2"><FileText size={18}/> Production Templates</h2>
                <div className="flex flex-col gap-3">
                   {templates.length > 0 ? templates.map(t => (
                      <div key={t.id} onClick={() => onViewTemplate && onViewTemplate(t.id)} className="bg-white rounded-2xl p-4 flex justify-between items-center shadow-sm cursor-pointer active:opacity-80 transition-opacity">
                         <div>
                            <h3 className="font-semibold text-[17px] text-black">{t.name}</h3>
                            <p className="text-[13px] text-[var(--color-ios-gray-2)]">{t.ingredients?.length || 0} Ingredients • {t.flows?.length || 0} Flows</p>
                         </div>
                         <ChevronRight size={20} className="text-[var(--color-ios-gray-2)]" />
                      </div>
                   )) : <p className="text-[14px] text-[var(--color-ios-gray-2)] bg-white p-4 rounded-xl shadow-sm text-center italic">No templates created yet.</p>}
                </div>
             </div>

             <div>
                <h2 className="text-[17px] font-semibold text-[var(--color-ios-gray-1)] mb-3 flex items-center gap-2"><ChefHat size={18}/> Cooking Recipes (How-To)</h2>
                <div className="flex flex-col gap-3">
                   {recipes.length > 0 ? recipes.map(r => (
                      <div key={r.id} onClick={() => onViewRecipe && onViewRecipe(r.id)} className="bg-white rounded-2xl p-4 flex justify-between items-center shadow-sm cursor-pointer active:opacity-80 transition-opacity">
                         <div>
                            <h3 className="font-semibold text-[17px] text-black">{r.name}</h3>
                            <p className="text-[13px] text-[var(--color-ios-gray-2)] truncate max-w-[220px]">{r.instructions}</p>
                         </div>
                         <ChevronRight size={20} className="text-[var(--color-ios-gray-2)]" />
                      </div>
                   )) : <p className="text-[14px] text-[var(--color-ios-gray-2)] bg-white p-4 rounded-xl shadow-sm text-center italic">No recipes created yet.</p>}
                </div>
             </div>
           </div>
        )}

      </main>
      <BottomNav activeTab="recipes" onTabChange={onNavTabChange} />
    </div>
  );
}
