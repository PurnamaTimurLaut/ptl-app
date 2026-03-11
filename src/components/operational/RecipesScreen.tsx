"use client";

import { useState, useEffect } from "react";
import { Search, ChevronRight, FileText, ChefHat, Plus, Trash2 } from "lucide-react";
import { TopBar } from "../layout/TopBar";
import { BottomNav } from "../layout/BottomNav";
import { 
  getProductionTemplates, getCookingRecipes, 
  createProductionTemplate, createCookingRecipe,
  addTemplateIngredient, addTemplateFlow
} from "@/app/lib/recipeActions";

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

  // Template Form State
  const [newTempName, setNewTempName] = useState("");
  const [tempIngredients, setTempIngredients] = useState<{name: string, quantity: string, unit: string}[]>([]);
  const [tempFlows, setTempFlows] = useState<{name: string, recipeId: string}[]>([]);

  // Individual Form Row State for adding
  const [ingName, setIngName] = useState("");
  const [ingQty, setIngQty] = useState("");
  const [ingUnit, setIngUnit] = useState("");
  
  const [flowName, setFlowName] = useState("");
  const [flowRecipeId, setFlowRecipeId] = useState("");

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

  const handleAddTempIngredientLocal = () => {
    if(!ingName || !ingQty || !ingUnit) return alert("Fill all ingredient fields first");
    setTempIngredients([...tempIngredients, {name: ingName, quantity: ingQty, unit: ingUnit}]);
    setIngName(""); setIngQty(""); setIngUnit("");
  };

  const handleAddTempFlowLocal = () => {
    if(!flowName) return alert("Execution flow name is required");
    setTempFlows([...tempFlows, {name: flowName, recipeId: flowRecipeId}]);
    setFlowName(""); setFlowRecipeId("");
  };

  const handleSaveFullTemplate = async () => {
    if (!newTempName) return alert("Menu Name is required");
    
    try {
      // 1. Create Template Parent
      const res = await createProductionTemplate({ name: newTempName });
      if (!res.success || !res.template) throw new Error(res.error);
      const tempId = res.template.id;

      // 2. Add Ingredients
      for (const i of tempIngredients) {
         await addTemplateIngredient(tempId, { name: i.name, quantity: parseFloat(i.quantity), unit: i.unit });
      }

      // 3. Add Flows
      for (const f of tempFlows) {
         await addTemplateFlow(tempId, { name: f.name, recipeId: f.recipeId || undefined });
      }

      // 4. Success, load and navigate
      setNewTempName(""); 
      setTempIngredients([]); setTempFlows([]);
      setShowAddTemplate(false);
      loadAll();
      if(onViewTemplate) onViewTemplate(tempId);

    } catch (error: any) {
      alert("Failed to save full template: " + error.message);
    }
  }

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
              <input type="text" placeholder="Menu Name (e.g. Nasi Campur)" value={newTempName} onChange={e => setNewTempName(e.target.value)} className="w-full bg-[var(--color-ios-gray-6)] rounded-xl py-3 px-4 text-[15px] text-black mb-6 outline-none border border-transparent focus:border-[var(--color-ios-blue)] font-semibold" />
              
              {/* Ingredients Builder */}
              <div className="mb-6">
                 <h4 className="text-[14px] font-bold text-[var(--color-ios-blue)] mb-3">Ingredients Recipe</h4>
                 
                 {/* List Added Ingredients */}
                 <div className="space-y-2 mb-3">
                   {tempIngredients.map((ing, i) => (
                     <div key={i} className="flex justify-between items-center bg-[var(--color-ios-gray-6)] p-3 rounded-xl">
                        <div>
                           <p className="font-semibold text-black text-[14px]">{ing.name}</p>
                           <p className="text-[var(--color-ios-gray-2)] text-[12px]">{ing.quantity} {ing.unit}</p>
                        </div>
                        <button onClick={() => setTempIngredients(tempIngredients.filter((_, idx) => idx !== i))} className="text-red-500 p-1"><Trash2 size={16}/></button>
                     </div>
                   ))}
                 </div>

                 <div className="flex flex-col gap-2 p-3 border border-[var(--color-ios-gray-5)] rounded-xl">
                    <input type="text" placeholder="Ingredient Name (Text for now)" value={ingName} onChange={e => setIngName(e.target.value)} className="w-full bg-[var(--color-ios-gray-6)] rounded-lg py-2 px-3 text-[14px] outline-none" />
                    <div className="flex gap-2">
                       <input type="number" placeholder="Amt" value={ingQty} onChange={e => setIngQty(e.target.value)} className="flex-[2] bg-[var(--color-ios-gray-6)] rounded-lg py-2 px-3 text-[14px] outline-none" />
                       <input type="text" placeholder="Unit (kg, gr)" value={ingUnit} onChange={e => setIngUnit(e.target.value)} className="flex-[2] bg-[var(--color-ios-gray-6)] rounded-lg py-2 px-3 text-[14px] outline-none" />
                       <button onClick={handleAddTempIngredientLocal} className="flex-1 bg-[var(--color-ios-blue)] text-white font-bold rounded-lg flex items-center justify-center"><Plus size={18}/></button>
                    </div>
                 </div>
              </div>

              {/* Flows Builder */}
              <div className="mb-6">
                 <h4 className="text-[14px] font-bold text-[var(--color-ios-blue)] mb-3">Execution Flows</h4>
                 
                 {/* List Added Flows */}
                 <div className="space-y-2 mb-3">
                   {tempFlows.map((flow, i) => (
                     <div key={i} className="flex justify-between items-center bg-[var(--color-ios-gray-6)] p-3 rounded-xl">
                        <div className="flex-1">
                           <p className="font-semibold text-black text-[14px]">{i+1}. {flow.name}</p>
                           <p className="text-[var(--color-ios-gray-2)] text-[12px] flex items-center gap-1 mt-0.5"><ChefHat size={12}/> {recipes.find(r => r.id === flow.recipeId)?.name || 'No Recipe'}</p>
                        </div>
                        <button onClick={() => setTempFlows(tempFlows.filter((_, idx) => idx !== i))} className="text-red-500 p-1"><Trash2 size={16}/></button>
                     </div>
                   ))}
                 </div>

                 <div className="flex flex-col gap-2 p-3 border border-[var(--color-ios-gray-5)] rounded-xl">
                    <input type="text" placeholder="Flow Name (e.g. Potong Ayam)" value={flowName} onChange={e => setFlowName(e.target.value)} className="w-full bg-[var(--color-ios-gray-6)] rounded-lg py-2 px-3 text-[14px] outline-none" />
                    <select value={flowRecipeId} onChange={e => setFlowRecipeId(e.target.value)} className="w-full bg-[var(--color-ios-gray-6)] rounded-lg py-2 px-3 text-[14px] outline-none text-black">
                       <option value="">Link to Cooking Recipe ...</option>
                       {recipes.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                       ))}
                    </select>
                    <button onClick={handleAddTempFlowLocal} className="w-full mt-1 bg-[var(--color-ios-blue)] text-white font-bold rounded-lg py-2 flex items-center justify-center text-[14px]">Add Flow Item</button>
                 </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-[var(--color-ios-gray-5)]">
                 <button onClick={() => setShowAddTemplate(false)} className="flex-1 py-3 rounded-xl bg-[var(--color-ios-gray-6)] text-black font-semibold text-[15px]">Cancel</button>
                 <button onClick={handleSaveFullTemplate} className="flex-1 py-3 rounded-xl bg-[var(--color-ios-blue)] text-white font-semibold text-[15px]">Save Full Template</button>
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
