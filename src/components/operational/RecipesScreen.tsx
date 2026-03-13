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
import { getInventory } from "@/app/actions/inventory";

const RecipeRichEditor = ({ onChange, inventoryItems }: { onChange: (html: string) => void, inventoryItems: any[] }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showIngModal, setShowIngModal] = useState(false);
  const [selIngName, setSelIngName] = useState("");
  const [selIngAmount, setSelIngAmount] = useState("");
  const savedRange = useRef<Range | null>(null);
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      let node: Node | null = range.commonAncestorContainer;
      while (node && node !== editorRef.current) {
        node = node.parentNode;
      }
      if (node === editorRef.current) {
        savedRange.current = range.cloneRange();
      }
    }
  };

  const insertContent = (html: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    editor.focus();
    
    const sel = window.getSelection();
    let range: Range | null = null;

    if (savedRange.current) {
      range = savedRange.current;
    } else if (sel && sel.rangeCount > 0) {
      const currentRange = sel.getRangeAt(0);
      let node: Node | null = currentRange.commonAncestorContainer;
      while (node && node !== editor) {
        node = node.parentNode;
      }
      if (node === editor) {
        range = currentRange;
      }
    }

    if (!range) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    const el = document.createElement("div");
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let lastNode: Node | null = null;
    while (el.firstChild) {
      lastNode = frag.appendChild(el.firstChild);
    }
    
    if (range) {
      range.deleteContents();
      range.insertNode(frag);
      
      if (lastNode && sel) {
        const newRange = document.createRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }
    
    savedRange.current = null;
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      // Just let the default Enter behavior happen, no auto-numbering
      handleInput();
    }
  };

  const insertStepNumber = () => {
    const text = editorRef.current?.innerText || "";
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let nextNum = 1;
    
    if (lines.length > 0) {
      for (let i = lines.length - 1; i >= 0; i--) {
        const match = lines[i].match(/^(\d+)\./);
        if (match) {
          nextNum = parseInt(match[1]) + 1;
          break;
        }
      }
      if (nextNum === 1 && lines.length > 0) {
        nextNum = lines.length + 1;
      }
    }
    
    const insertStr = text.trim().length === 0 ? `${nextNum}. ` : `<br><br>${nextNum}. `;
    insertContent(insertStr);
  };

  const insertVariable = () => {
    saveSelection();
    const val = prompt("Enter Amount & Unit (e.g. 100g)");
    if (!val) return;
    const pillHtml = `&nbsp;<span contenteditable="false" class="inline-block align-middle bg-[#F2F2F7] text-black px-2 py-0.5 rounded-md mx-0.5 font-medium text-[14px]" data-variable="${val}">${val}</span>&nbsp;`;
    insertContent(pillHtml);
  };

  const insertIngredientPill = () => {
    if (!selIngName || !selIngAmount) return alert("Fill all fields");
    const item = inventoryItems.find(i => i.name === selIngName);
    const unit = item ? item.unit : "";
    const label = `${selIngName} ${selIngAmount}${unit}`;

    const pillHtml = `&nbsp;<span contenteditable="false" class="inline-block align-middle bg-[#E5E5EA] text-black px-2 py-0.5 rounded-md mx-0.5 font-semibold text-[14px]" data-ingredient="${selIngName}">${label}</span>&nbsp;`;
    
    setShowIngModal(false);
    setSelIngName("");
    setSelIngAmount("");
    insertContent(pillHtml);
  };

  return (
    <>
    <div className="w-full bg-white rounded-xl shadow-sm border border-[#E5E5EA] overflow-hidden flex flex-col mb-6">
       <div className="flex justify-between items-center px-4 py-3 border-b border-[#E5E5EA]">
          <span className="text-[17px] font-bold text-black">Recipe</span>
          <div className="flex gap-4">
            <button onMouseDown={(e) => { e.preventDefault(); insertStepNumber(); }} className="text-[var(--color-ios-blue)] font-bold text-[15px] active:opacity-70 transition-opacity flex items-center gap-1">
               Step No.
            </button>
            <button onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowIngModal(true); }} className="text-[var(--color-ios-blue)] font-bold text-[15px] active:opacity-70 transition-opacity flex items-center gap-1">
               + Add Ingredient
            </button>
            <button onMouseDown={(e) => { e.preventDefault(); insertVariable(); }} className="text-[var(--color-ios-blue)] font-bold text-[15px] active:opacity-70 transition-opacity flex items-center gap-1">
               123...
            </button>
          </div>
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

    {showIngModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-[#F5F5F7] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-6">
            <h3 className="text-[20px] font-bold text-center text-black mb-6">Add Ingredient</h3>
            
            <div className="mb-4 relative">
              <label className="text-[13px] font-semibold text-[var(--color-ios-gray-1)] ml-1 mb-1.5 block">Ingredient</label>
              <select 
                value={selIngName} 
                onChange={e => setSelIngName(e.target.value)}
                className="w-full bg-white rounded-xl py-3.5 pl-4 pr-10 text-[17px] text-black outline-none shadow-sm appearance-none"
              >
                <option value="" disabled>Select from inventory...</option>
                {inventoryItems.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
              </select>
              <ChevronDown size={20} className="absolute right-3.5 bottom-3.5 text-[#C7C7CC] pointer-events-none" />
            </div>

            <div className="mb-8 relative flex items-center">
              <div className="w-full">
                <label className="text-[13px] font-semibold text-[var(--color-ios-gray-1)] ml-1 mb-1.5 block">Amount</label>
                <input 
                  type="number" 
                  value={selIngAmount} 
                  onChange={e => setSelIngAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-white rounded-xl py-3.5 px-4 text-[17px] text-black outline-none shadow-sm"
                />
              </div>
              {selIngName && inventoryItems.find(i => i.name === selIngName)?.unit && (
                <span className="absolute right-4 bottom-3.5 text-[15px] text-[var(--color-ios-gray-2)] pointer-events-none">
                  {inventoryItems.find(i => i.name === selIngName)?.unit}
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowIngModal(false)} className="flex-1 py-3.5 rounded-xl bg-[#E5E5EA] text-black font-semibold text-[17px] active:bg-[#D1D1D6] transition-colors">
                Cancel
              </button>
              <button 
                onClick={insertIngredientPill} 
                disabled={!selIngName || !selIngAmount}
                className="flex-1 py-3.5 rounded-xl bg-[var(--color-ios-blue)] text-white font-semibold text-[17px] active:opacity-80 transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
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
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
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
    const [tempRes, recRes, invRes] = await Promise.all([
      getProductionTemplates(),
      getCookingRecipes(),
      getInventory()
    ]);
    if (tempRes.success) setTemplates(tempRes.templates || []);
    if (recRes.success) setRecipes(recRes.recipes || []);
    setInventoryItems(invRes || []);
    setIsLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleAddTempIngredientLocal = () => {
    if(!ingName || !ingAmount) return alert("Fill all ingredient fields first");
    
    // Auto-detect unit from inventory database
    const selectedItem = inventoryItems.find(i => i.name === ingName);
    const itemUnit = selectedItem ? selectedItem.unit : "pcs";

    setTempIngredients([...tempIngredients, {name: ingName, quantity: ingAmount, unit: itemUnit}]);
    setIngName(""); setIngAmount("");
  };

  const handleAddTempFlowLocal = () => {
    if(!flowName) return alert("Execution flow name is required");
    setTempFlows([...tempFlows, {name: flowName, recipeId: flowRecipeId}]);
    setFlowName(""); setFlowRecipeId("");
  };

  const handleAddTempFlowStepNo = () => {
    let nextNum = 1;
    if (tempFlows.length > 0) {
      for (let i = tempFlows.length - 1; i >= 0; i--) {
        const match = tempFlows[i].name.match(/^(\d+)\./);
        if (match) {
          nextNum = parseInt(match[1]) + 1;
          break;
        }
      }
      if (nextNum === 1) nextNum = tempFlows.length + 1;
    }
    setFlowName(`${nextNum}. `);
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
      <div className="fixed inset-0 w-full max-w-md mx-auto bg-[#F5F5F7] z-50 flex flex-col font-sans overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full">
          <button onClick={() => setShowAddTemplate(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
        </div>
        
        <div className="px-6 pb-32 w-full flex-1">
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
                   <select 
                     value={ingName} 
                     onChange={e => setIngName(e.target.value)} 
                     className="w-full bg-white rounded-xl py-3.5 pl-4 pr-10 text-[17px] text-black outline-none shadow-sm appearance-none"
                   >
                     <option value="" disabled>Select Ingredient...</option>
                     {inventoryItems.map((item) => (
                       <option key={item.id} value={item.name}>{item.name}</option>
                     ))}
                   </select>
                   <ChevronDown size={20} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C7C7CC] pointer-events-none" />
                </div>
                <div className="flex-1 relative flex items-center">
                   <input 
                     type="number" 
                     placeholder="Amount..." 
                     value={ingAmount} 
                     onChange={e => setIngAmount(e.target.value)} 
                     onKeyDown={(e) => e.key === 'Enter' && handleAddTempIngredientLocal()} 
                     className="w-full bg-white rounded-xl py-3.5 px-4 text-[17px] text-black outline-none shadow-sm" 
                   />
                   {ingName && inventoryItems.find(i => i.name === ingName)?.unit && (
                     <span className="absolute right-3 text-[15px] text-[var(--color-ios-gray-2)] pointer-events-none">
                       {inventoryItems.find(i => i.name === ingName)?.unit}
                     </span>
                   )}
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
              <div className="flex gap-3">
                <button onClick={handleAddTempFlowLocal} className="flex-[2] py-3.5 rounded-full border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] font-medium text-[16px] flex items-center justify-center gap-2 bg-white active:bg-blue-50 transition-colors">
                  <Plus size={18} strokeWidth={2.5} /> Add Execution Flow
                </button>
                <button onClick={handleAddTempFlowStepNo} className="flex-1 py-3.5 rounded-full border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] font-medium text-[16px] flex items-center justify-center gap-2 bg-white active:bg-blue-50 transition-colors">
                  Step No.
                </button>
              </div>
           </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none z-10 pb-[env(safe-area-inset-bottom)]">
           <div className="pointer-events-auto shadow-[0_-20px_20px_-10px_rgba(245,245,247,0.9)]">
             <button 
                onClick={handleSaveFullTemplate} 
                disabled={!isFormValid} 
                className={`w-full py-4 rounded-full font-semibold text-[17px] transition-colors ${
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
      <div className="fixed inset-0 w-full max-w-md mx-auto bg-[#F5F5F7] z-50 flex flex-col font-sans overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full">
          <button onClick={() => setShowAddRecipe(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
        </div>
      
        <div className="px-6 pb-32 w-full flex-1 flex flex-col">
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
           <RecipeRichEditor onChange={setNewRecInstructions} inventoryItems={inventoryItems} />
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none pb-[env(safe-area-inset-bottom)] z-10">
           <div className="pointer-events-auto shadow-[0_-20px_20px_-10px_rgba(245,245,247,0.9)]">
             <button 
                onClick={handleSaveNewRecipe} 
                disabled={!isFormValid} 
                className={`w-full py-4 rounded-full font-semibold text-[17px] transition-colors ${
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
        {/* Restore Databases Header */}
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">Databases</h1>

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
                <h2 className="text-[17px] font-semibold text-[var(--color-ios-gray-1)] mb-3 flex items-center gap-2"><ChefHat size={18}/> Cooking Recipes</h2>
                <div className="flex flex-col gap-3">
                   {recipes.length > 0 ? recipes.map(r => (
                      <div key={r.id} onClick={() => onViewRecipe && onViewRecipe(r.id)} className="bg-white rounded-2xl p-4 flex justify-between items-center shadow-sm cursor-pointer active:opacity-80 transition-opacity">
                         <div>
                            <h3 className="font-semibold text-[17px] text-black">{r.name}</h3>
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
