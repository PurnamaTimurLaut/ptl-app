"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Trash2, Plus, ChefHat } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { getProductionTemplates, addTemplateIngredient, removeTemplateIngredient, addTemplateFlow, removeTemplateFlow, getCookingRecipes } from "@/app/lib/recipeActions";

// Reusing getProductionTemplates locally and just filtering because Server Actions can't return complex joined JSON easily sometimes
// But since we just built it cleanly, let's fetch it from a dedicated action for singular get.
import { getProductionTemplateById } from "@/app/lib/recipeActionsSingular";

interface TemplateDetailScreenProps {
  templateId: string;
  onBack: () => void;
}

export default function TemplateDetailScreen({ templateId, onBack }: TemplateDetailScreenProps) {
  const [template, setTemplate] = useState<any>(null);
  const [availableRecipes, setAvailableRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ingredient Form
  const [ingName, setIngName] = useState("");
  const [ingQty, setIngQty] = useState("");
  const [ingUnit, setIngUnit] = useState("");

  // Flow Form
  const [flowName, setFlowName] = useState("");
  const [flowRecipeId, setFlowRecipeId] = useState("");

  const load = async () => {
    setIsLoading(true);
    const [tRes, rRes] = await Promise.all([
      getProductionTemplateById(templateId),
      getCookingRecipes()
    ]);
    if (tRes.success) setTemplate(tRes.template);
    if (rRes.success) setAvailableRecipes(rRes.recipes || []);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [templateId]);

  const handleAddIngredient = async () => {
    if (!ingName || !ingQty || !ingUnit) return alert("Fill all ingredient fields.");
    const res = await addTemplateIngredient(templateId, { name: ingName, quantity: parseFloat(ingQty), unit: ingUnit });
    if (res.success) { setIngName(""); setIngQty(""); setIngUnit(""); load(); }
  };

  const handleAddFlow = async () => {
    if (!flowName) return alert("Flow Name is required.");
    const res = await addTemplateFlow(templateId, { name: flowName, recipeId: flowRecipeId || undefined });
    if (res.success) { setFlowName(""); setFlowRecipeId(""); load(); }
  };

  if (isLoading) return <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-ios-gray-6)] font-sans pb-12 relative">
      <div className="bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md sticky top-0 z-20 px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-[var(--color-ios-blue)] flex-1">
          <ChevronLeft size={24} />
          <span className="text-[17px] -ml-1">Databases</span>
        </button>
        <span className="font-semibold text-black text-[17px] flex-[2] truncate text-center">{template?.name}</span>
        <div className="flex-1"></div>
      </div>

      <div className="px-5 mt-4 space-y-8 max-w-xl mx-auto w-full">
        {/* INGREDIENTS */}
        <section>
          <h2 className="text-[20px] font-bold text-black mb-4 flex items-center gap-2">Ingredients Blueprint</h2>
          
          <div className="space-y-3 mb-4">
             {template?.ingredients?.map((ing: any, i: number) => (
                <div key={ing.id} className="flex justify-between items-center bg-white py-3 px-4 rounded-xl border border-[var(--color-ios-gray-5)]">
                   <div>
                      <p className="text-[11px] font-bold text-[var(--color-ios-blue)] uppercase tracking-wider mb-0.5">Ingredient {i+1}</p>
                      <p className="font-semibold text-[16px] text-black">{ing.name}</p>
                      <p className="text-[14px] text-[var(--color-ios-gray-1)]">{ing.quantity} {ing.unit}</p>
                   </div>
                   <button onClick={async () => { await removeTemplateIngredient(ing.id); load(); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={20} />
                   </button>
                </div>
             ))}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-ios-blue)]/20">
             <div className="flex flex-col gap-3 mb-3">
                <input type="text" placeholder="Ingredient Name (text placeholder)" value={ingName} onChange={e => setIngName(e.target.value)} className="w-full bg-[var(--color-ios-gray-6)] rounded-xl py-2.5 px-3 text-[15px] outline-none" />
                <div className="flex gap-2">
                   <input type="number" placeholder="Amount" value={ingQty} onChange={e => setIngQty(e.target.value)} className="flex-[2] bg-[var(--color-ios-gray-6)] rounded-xl py-2.5 px-3 text-[15px] outline-none" />
                   <input type="text" placeholder="Unit (kg, gr)" value={ingUnit} onChange={e => setIngUnit(e.target.value)} className="flex-[1.5] bg-[var(--color-ios-gray-6)] rounded-xl py-2.5 px-3 text-[15px] outline-none" />
                </div>
             </div>
             <button onClick={handleAddIngredient} className="w-full py-3 rounded-xl bg-[var(--color-ios-blue)]/10 text-[var(--color-ios-blue)] font-bold flex items-center justify-center gap-2">
                <Plus size={18} strokeWidth={2.5}/> Add Ingredient
             </button>
          </div>
        </section>

        <hr className="border-[var(--color-ios-gray-4)]" />

        {/* EXECUTION FLOWS */}
        <section>
          <h2 className="text-[20px] font-bold text-black mb-4 flex items-center gap-2">Execution Flow Blueprint</h2>
          
          <div className="space-y-3 mb-4">
             {template?.flows?.map((flow: any, i: number) => (
                <div key={flow.id} className="bg-white py-3 px-4 rounded-xl border border-[var(--color-ios-gray-5)]">
                   <div className="flex justify-between items-start mb-2">
                      <div>
                         <p className="text-[11px] font-bold text-[var(--color-ios-blue)] uppercase tracking-wider mb-0.5">Execution Flow {i+1}</p>
                         <p className="font-semibold text-[16px] text-black leading-tight">{flow.name}</p>
                      </div>
                      <button onClick={async () => { await removeTemplateFlow(flow.id); load(); }} className="p-1 text-red-500 hover:bg-red-50 rounded-lg -mt-1 -mr-2">
                         <Trash2 size={18} />
                      </button>
                   </div>
                   <div className="flex items-center gap-2 bg-[var(--color-ios-gray-6)] p-2 rounded-lg">
                      <ChefHat size={16} className="text-[var(--color-ios-gray-2)]" />
                      <span className="text-[13px] text-[var(--color-ios-gray-1)] font-medium">
                        Recipe: {flow.recipe ? flow.recipe.name : <span className="italic text-[var(--color-ios-gray-3)]">None attached</span>}
                      </span>
                   </div>
                </div>
             ))}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-ios-blue)]/20">
             <div className="flex flex-col gap-3 mb-3">
                <input type="text" placeholder="Execution Flow Name" value={flowName} onChange={e => setFlowName(e.target.value)} className="w-full bg-[var(--color-ios-gray-6)] rounded-xl py-2.5 px-3 text-[15px] outline-none" />
                <select value={flowRecipeId} onChange={e => setFlowRecipeId(e.target.value)} className="w-full bg-[var(--color-ios-gray-6)] rounded-xl py-2.5 px-3 text-[15px] outline-none text-black">
                   <option value="">Select Recipe (Optional) ...</option>
                   {availableRecipes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                   ))}
                </select>
             </div>
             <button onClick={handleAddFlow} className="w-full py-3 rounded-xl bg-[var(--color-ios-blue)]/10 text-[var(--color-ios-blue)] font-bold flex items-center justify-center gap-2">
                <Plus size={18} strokeWidth={2.5}/> Add Execution Flow
             </button>
          </div>
        </section>
      </div>
    </div>
  );
}
