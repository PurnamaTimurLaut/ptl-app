"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronRight, FileText, ChefHat, Plus, Trash2, ChevronLeft, XCircle, ChevronDown, ClipboardPlus } from "lucide-react";
import { TopBar } from "../layout/TopBar";
import { BottomNav } from "../layout/BottomNav";
import { 
  getProductionTemplates, getCookingRecipes, 
  createProductionTemplate, createCookingRecipe, createCookingRecipeLinked,
  addTemplateIngredient, addTemplateFlow
} from "@/app/lib/recipeActions";

// Custom Rich Text Editor for Recipes
const RecipeRichEditor = ({ onChange }: { onChange: (html: string) => void }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const text = editorRef.current?.innerText || "";
      // Count lines that start with a number to figure out next sequence
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let nextNum = 1;
      
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        const match = lastLine.match(/^(\d+)\./);
        if (match) nextNum = parseInt(match[1]) + 1;
        else nextNum = lines.length + 1;
      }
      
      const insertStr = text.length === 0 ? `1. ` : `<br><br>${nextNum}. `;
      document.execCommand('insertHTML', false, insertStr);
      handleInput();
    }
  };

  const insertVariable = () => {
    const val = prompt("Enter Amount & Unit (e.g. 100g)");
    if (!val) return;
    
    // Grey pill exactly as designed
    const pillHtml = `&nbsp;<span contenteditable="false" class="inline-flex items-center justify-center bg-[#F2F2F7] text-black px-2 py-0.5 rounded-md mx-0.5 font-medium text-[14px]" data-variable="${val}">${val}</span>&nbsp;`;
    
    editorRef.current?.focus();
    
    if (editorRef.current?.innerText.trim() === "") {
        document.execCommand('insertHTML', false, `1. ${pillHtml}`);
    } else {
        document.execCommand('insertHTML', false, pillHtml);
    }
    handleInput();
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-[#E5E5EA] overflow-hidden flex flex-col mb-6">
       <div className="flex justify-between items-center px-4 py-3 border-b border-[#E5E5EA]">
          <span className="text-[17px] font-bold text-black">Recipe</span>
          <button onClick={insertVariable} className="text-[var(--color-ios-blue)] font-bold text-[15px] active:opacity-70 transition-opacity flex items-center gap-1">
             123...
          </button>
       </div>
       <div 
         ref={editorRef}
         contentEditable
         onInput={handleInput}
         onKeyDown={handleKeyDown}
         className="w-full min-h-[350px] p-4 text-[17px] text-black outline-none focus:bg-[#FAFAFA] transition-colors whitespace-pre-wrap leading-relaxed"
         suppressContentEditableWarning
       />
    </div>
  );
};

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
  const [ingAmount, setIngAmount] = useState("");
  
  const [flowName, setFlowName] = useState("");
  const [flowRecipeId, setFlowRecipeId] = useState("");

  // Recipe Form State
  const [selectedTemplateForRecipe, setSelectedTemplateForRecipe] = useState("");
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
    if(!ingName || !ingAmount) return alert("Fill all ingredient fields first");
    
    // Parse amount like "200g" into qty=200, unit="g"
    const parsedQty = parseFloat(ingAmount) || 0;
    const parsedUnit = ingAmount.replace(/[0-9.]/g, '').trim() || "pcs";

    setTempIngredients([...tempIngredients, {name: ingName, quantity: parsedQty.toString(), unit: parsedUnit}]);
    setIngName(""); setIngAmount("");
  };

  const handleAddTempFlowLocal = () => {
    if(!flowName) return alert("Execution flow name is required");
    setTempFlows([...tempFlows, {name: flowName, recipeId: flowRecipeId}]);
    setFlowName(""); setFlowRecipeId("");
  };

  const handleSaveFullTemplate = async () => {
    if (!newTempName) return alert("Menu Name is required");
    
    try {
      const res = await createProductionTemplate({ name: newTempName });
      if (!res.success || !res.template) throw new Error(res.error);
      const tempId = res.template.id;

      for (const i of tempIngredients) {
         await addTemplateIngredient(tempId, { name: i.name, quantity: parseFloat(i.quantity), unit: i.unit });
      }

      for (const f of tempFlows) {
         await addTemplateFlow(tempId, { name: f.name, recipeId: f.recipeId || undefined });
      }

      setNewTempName(""); 
      setTempIngredients([]); setTempFlows([]);
      setShowAddTemplate(false);
      loadAll();
      if(onViewTemplate) onViewTemplate(tempId);

    } catch (error: any) {
      alert("Failed to save full template: " + error.message);
    }
  }

  const handleSaveNewRecipe = async () => {
    if (!selectedTemplateForRecipe || !newRecInstructions) return alert("Please select a template and write instructions.");
    
    const res = await createCookingRecipeLinked(selectedTemplateForRecipe, newRecInstructions);
    if (res.success) {
      setSelectedTemplateForRecipe(""); setNewRecInstructions(""); setShowAddRecipe(false);
      loadAll();
    } else {
      alert(res.error);
    }
  };

  // ------------- FULL SCREEN RENDER FOR CREATE TEMPLATE -------------
  if (showAddTemplate) {
    const isFormValid = newTempName.length > 0 && tempIngredients.length > 0 && tempFlows.length > 0;

    return (
      <div className="fixed inset-0 bg-[#F5F5F7] z-50 flex flex-col font-sans overflow-y-auto w-full">
        {/* Header */}
        <div className="flex items-center px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10">
          <button onClick={() => setShowAddTemplate(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
        </div>
        
        <div className="px-6 pb-32 max-w-xl mx-auto w-full flex-1">
           <h1 className="text-[20px] font-bold text-center text-black mb-8 px-4">Create New Production Template (per pax)</h1>

           {/* Menu Name */}
           <div className="mb-6">
             <h2 className="text-[17px] font-bold text-black mb-3">Menu Name</h2>
             <div className="relative">
               <input 
                 type="text" 
                 placeholder="(e.g. Sapi Teriyaki)" 
                 value={newTempName} 
                 onChange={e => setNewTempName(e.target.value)} 
                 className="w-full bg-white rounded-xl py-3.5 px-4 text-[17px] text-black outline-none shadow-sm" 
               />
               {newTempName && (
                 <button onClick={() => setNewTempName("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                   <XCircle size={20} className="text-[#C7C7CC] fill-[#C7C7CC] text-white" />
                 </button>
               )}
             </div>
           </div>

           <hr className="border-[#E5E5EA] mb-6" />

           {/* Ingredients */}
           <div className="mb-6">
             <h2 className="text-[17px] font-bold text-black mb-3">Ingredients I</h2>
             
             {/* List mapped ingredients */}
             {tempIngredients.length > 0 && (
               <div className="space-y-3 mb-4">
                 {tempIngredients.map((ing, i) => (
                   <div key={i} className="flex gap-3 items-center">
                      <div className="flex-[2] bg-white rounded-xl py-3.5 px-4 shadow-sm text-[17px] text-black">{ing.name}</div>
                      <div className="flex-[1] bg-white rounded-xl py-3.5 px-4 shadow-sm text-[17px] text-black">{ing.quantity}{ing.unit}</div>
                      <button onClick={() => setTempIngredients(tempIngredients.filter((_, idx) => idx !== i))} className="text-red-500 p-2"><Trash2 size={20}/></button>
                   </div>
                 ))}
               </div>
             )}

             {/* Add Row */}
             <div className="flex gap-3 mb-4">
                <div className="flex-[2] relative">
                   <input type="text" placeholder="Search" value={ingName} onChange={e => setIngName(e.target.value)} className="w-full bg-white rounded-xl py-3.5 px-4 pr-10 text-[17px] text-black outline-none shadow-sm" />
                   <ChevronDown size={20} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C7C7CC] pointer-events-none" />
                </div>
                <div className="flex-1">
                   <input type="text" placeholder="Amount..." value={ingAmount} onChange={e => setIngAmount(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTempIngredientLocal()} className="w-full bg-white rounded-xl py-3.5 px-4 text-[17px] text-black outline-none shadow-sm" />
                </div>
             </div>
             
             <button onClick={handleAddTempIngredientLocal} className="w-full py-3.5 rounded-full border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] font-medium text-[16px] flex items-center justify-center gap-2 bg-white active:bg-blue-50 transition-colors">
               <Plus size={18} strokeWidth={2.5} /> Add Ingredients
             </button>
           </div>

           <hr className="border-[#E5E5EA] mb-6" />

           {/* Flows */}
           <div className="mb-8">
             <h2 className="text-[17px] font-bold text-black mb-3">Execution Flow I</h2>
             
             {/* List mapped flows */}
             {tempFlows.length > 0 && (
               <div className="space-y-3 mb-4">
                 {tempFlows.map((flow, i) => (
                   <div key={i} className="flex gap-3 items-center">
                      <div className="flex-1 bg-white rounded-xl py-3.5 px-4 shadow-sm text-[17px] text-black">{flow.name}</div>
                      <button onClick={() => setTempFlows(tempFlows.filter((_, idx) => idx !== i))} className="text-red-500 p-2"><Trash2 size={20}/></button>
                   </div>
                 ))}
               </div>
             )}
             
             <div className="relative mb-4">
               <input type="text" placeholder="(e.g. Velvet Sapi)" value={flowName} onChange={e => setFlowName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTempFlowLocal()} className="w-full bg-white rounded-xl py-3.5 px-4 pr-10 text-[17px] text-black outline-none shadow-sm" />
                 {flowName && (
                   <button onClick={() => setFlowName("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                     <XCircle size={20} className="text-[#C7C7CC] fill-[#C7C7CC] text-white" />
                   </button>
                 )}
             </div>
             <button onClick={handleAddTempFlowLocal} className="w-full py-3.5 rounded-full border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] font-medium text-[16px] flex items-center justify-center gap-2 bg-white active:bg-blue-50 transition-colors">
               <Plus size={18} strokeWidth={2.5} /> Add Execution Flow
             </button>
           </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none">
           <div className="max-w-xl mx-auto pointer-events-auto shadow-[0_-20px_20px_-10px_rgba(245,245,247,0.9)]">
             <button 
                onClick={handleSaveFullTemplate} 
                disabled={!isFormValid} 
                className={`w-full py-4.5 rounded-full font-semibold text-[17px] transition-colors ${
                  isFormValid ? 'bg-[var(--color-ios-blue)] text-white active:opacity-80' : 'bg-[#AEAEB2] text-[#E5E5EA] cursor-not-allowed'
                }`}
             >
               Create Template
             </button>
           </div>
        </div>
      </div>
    );
  }

  // ------------- FULL SCREEN RENDER FOR CREATE RECIPE -------------
  if (showAddRecipe) {
    const isFormValid = selectedTemplateForRecipe.length > 0 && newRecInstructions.length > 0;

    return (
      <div className="fixed inset-0 bg-[#F5F5F7] z-50 flex flex-col font-sans overflow-y-auto w-full">
        {/* Header */}
        <div className="flex items-center px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10">
          <button onClick={() => setShowAddRecipe(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
        </div>
        
        <div className="px-6 pb-32 max-w-xl mx-auto w-full flex-1 flex flex-col">
           <h1 className="text-[20px] font-bold text-center text-black mb-8 px-4">Create New Recipe (per pax)</h1>

           {/* Recipe Of */}
           <div className="mb-6 flex-shrink-0">
             <h2 className="text-[17px] font-bold text-black mb-3">Recipe of</h2>
             <div className="relative">
               <select 
                 value={selectedTemplateForRecipe} 
                 onChange={e => setSelectedTemplateForRecipe(e.target.value)} 
                 className="w-full bg-white rounded-xl py-3.5 px-4 pr-10 text-[17px] text-black outline-none shadow-sm appearance-none" 
               >
                 <option value="" disabled>Search or Select Template...</option>
                 {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
               <ChevronDown size={20} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C7C7CC] pointer-events-none" />
             </div>
           </div>

           {/* Custom Recipe Editor */}
           <RecipeRichEditor onChange={setNewRecInstructions} />
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none pb-[env(safe-area-inset-bottom)]">
           <div className="max-w-xl mx-auto pointer-events-auto shadow-[0_-20px_20px_-10px_rgba(245,245,247,0.9)]">
             <button 
                onClick={handleSaveNewRecipe} 
                disabled={!isFormValid} 
                className={`w-full py-4.5 rounded-full font-semibold text-[17px] transition-colors ${
                  isFormValid ? 'bg-[var(--color-ios-blue)] text-white active:opacity-80' : 'bg-[#AEAEB2] text-[#E5E5EA] cursor-not-allowed'
                }`}
             >
               Create Recipe
             </button>
           </div>
        </div>
      </div>
    );
  }

  // ------------- END FULL SCREEN RENDERS -------------


  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-24">
      <TopBar onProfileClick={onProfileClick} />
      
      <main className="px-6 flex-1 max-w-xl mx-auto w-full mt-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={20} className="text-[var(--color-ios-gray-2)]" />
          </div>
          <input type="text" placeholder="Search databases" className="w-full bg-[var(--color-ios-gray-5)] rounded-xl py-2 pl-10 pr-4 text-[17px] text-black placeholder:text-[var(--color-ios-gray-2)] focus:outline-none" />
        </div>

        {/* Minimalist Action Buttons */}
        <div className="flex gap-4 mb-8">
           <div className="flex-1 flex flex-col gap-3">
              <button 
                onClick={() => { setShowAddTemplate(true); setShowAddRecipe(false); }} 
                className="w-full aspect-[4/3] bg-white rounded-[28px] shadow-sm border border-[#E5E5EA] flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
              >
                 <ClipboardPlus size={36} className="text-[var(--color-ios-blue)]" strokeWidth={1.5} />
              </button>
              <p className="text-center text-[15px] font-medium text-black leading-tight px-1">Create New Production<br/>Template (per pax)</p>
           </div>
           
           <div className="flex-1 flex flex-col gap-3">
              <button 
                onClick={() => { setShowAddRecipe(true); setShowAddTemplate(false); }} 
                className="w-full aspect-[4/3] bg-white rounded-[28px] shadow-sm border border-[#E5E5EA] flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
              >
                 <ChefHat size={36} className="text-[var(--color-ios-blue)]" strokeWidth={1.5} />
              </button>
              <p className="text-center text-[15px] font-medium text-black leading-tight px-1">Create New Recipe<br/>(per pax)</p>
           </div>
        </div>

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
                            <p className="text-[13px] text-[var(--color-ios-gray-2)] truncate max-w-[220px]" dangerouslySetInnerHTML={{ __html: r.instructions }}></p>
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
