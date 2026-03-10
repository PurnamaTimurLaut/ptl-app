"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";
import { getRecipeById, addIngredient, removeIngredient, addStep, removeStep } from "@/app/lib/recipeActions";

interface RecipeDetailScreenProps {
  recipeId: string;
  onBack: () => void;
}

export default function RecipeDetailScreen({ recipeId, onBack }: RecipeDetailScreenProps) {
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ingredient Form
  const [ingName, setIngName] = useState("");
  const [ingQty, setIngQty] = useState("");
  const [ingUnit, setIngUnit] = useState("");

  // Step Form
  const [stepOrder, setStepOrder] = useState("");
  const [stepInstruction, setStepInstruction] = useState("");

  const load = async () => {
    setIsLoading(true);
    const res = await getRecipeById(recipeId);
    if (res.success && res.recipe) {
      setRecipe(res.recipe);
      setStepOrder((res.recipe.steps.length + 1).toString()); // Auto-fill next step order
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [recipeId]);

  const handleAddIngredient = async () => {
    if (!ingName || !ingQty || !ingUnit) {
      alert("Please fill all ingredient fields.");
      return;
    }
    const res = await addIngredient(recipe.id, {
      name: ingName,
      quantity: parseFloat(ingQty),
      unit: ingUnit
    });
    if (res.success) {
      setIngName(""); setIngQty(""); setIngUnit("");
      load();
    }
  };

  const handleAddStep = async () => {
    if (!stepOrder || !stepInstruction) {
      alert("Please fill all step fields.");
      return;
    }
    const res = await addStep(recipe.id, {
      order: parseInt(stepOrder),
      instruction: stepInstruction
    });
    if (res.success) {
      setStepInstruction("");
      load();
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-ios-gray-6)] font-sans pb-12 relative">
      {/* Header */}
      <div className="bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md sticky top-0 z-20 px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-[var(--color-ios-blue)] flex-1">
          <ChevronLeft size={24} />
          <span className="text-[17px] -ml-1">Recipes</span>
        </button>
        <span className="font-semibold text-black text-[17px] flex-[2] truncate text-center">{recipe?.name}</span>
        <div className="flex-1"></div>
      </div>

      <div className="px-5 mt-4 space-y-8 max-w-xl mx-auto w-full">
        {/* Ingredients Section */}
        <section>
          <h2 className="text-[20px] font-bold text-black mb-4">Ingredients</h2>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-ios-gray-5)] mb-4 space-y-3">
             <div className="flex gap-2">
                <input type="text" placeholder="Name (e.g. Beras)" value={ingName} onChange={e => setIngName(e.target.value)} className="flex-[2] bg-[var(--color-ios-gray-6)] rounded-xl py-2 px-3 text-[15px] outline-none" />
                <input type="number" placeholder="Qty" value={ingQty} onChange={e => setIngQty(e.target.value)} className="flex-1 bg-[var(--color-ios-gray-6)] rounded-xl py-2 px-3 text-[15px] outline-none" />
                <input type="text" placeholder="Unit (kg, pcs)" value={ingUnit} onChange={e => setIngUnit(e.target.value)} className="flex-1 bg-[var(--color-ios-gray-6)] rounded-xl py-2 px-3 text-[15px] outline-none" />
             </div>
             <button onClick={handleAddIngredient} className="w-full py-2.5 rounded-xl bg-[var(--color-ios-blue)] text-white font-semibold text-[15px]">
                Add Ingredient
             </button>
          </div>

          <div className="space-y-2">
             {recipe.ingredients?.map((ing: any) => (
                <div key={ing.id} className="flex justify-between items-center bg-white py-3 px-4 rounded-xl border border-[var(--color-ios-gray-5)]">
                   <div>
                      <p className="font-semibold text-[15px] text-black">{ing.name}</p>
                      <p className="text-[13px] text-[var(--color-ios-gray-1)]">{ing.quantity} {ing.unit}</p>
                   </div>
                   <button onClick={async () => { await removeIngredient(ing.id); load(); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                   </button>
                </div>
             ))}
             {recipe.ingredients?.length === 0 && <p className="text-sm text-[var(--color-ios-gray-2)]">No ingredients added yet.</p>}
          </div>
        </section>

        {/* Execution Flow Section */}
        <section>
          <h2 className="text-[20px] font-bold text-black mb-4">Execution Flow</h2>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-ios-gray-5)] mb-4 space-y-3">
             <div className="flex gap-2">
                <input type="number" placeholder="Order (1,2..)" value={stepOrder} onChange={e => setStepOrder(e.target.value)} className="w-20 bg-[var(--color-ios-gray-6)] rounded-xl py-2 px-3 text-[15px] outline-none" />
                <input type="text" placeholder="Instruction" value={stepInstruction} onChange={e => setStepInstruction(e.target.value)} className="flex-1 bg-[var(--color-ios-gray-6)] rounded-xl py-2 px-3 text-[15px] outline-none" />
             </div>
             <button onClick={handleAddStep} className="w-full py-2.5 rounded-xl bg-[var(--color-ios-blue)] text-white font-semibold text-[15px]">
                Add Step
             </button>
          </div>

          <div className="space-y-2">
             {recipe.steps?.map((step: any) => (
                <div key={step.id} className="flex gap-3 bg-white py-3 px-4 rounded-xl border border-[var(--color-ios-gray-5)] items-start">
                   <div className="w-6 h-6 rounded-full bg-[var(--color-ios-gray-6)] flex items-center justify-center text-[13px] font-bold shrink-0 mt-0.5">
                      {step.order}
                   </div>
                   <p className="font-semibold text-[15px] text-black flex-1">{step.instruction}</p>
                   <button onClick={async () => { await removeStep(step.id); load(); }} className="p-1 text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                      <Trash2 size={18} />
                   </button>
                </div>
             ))}
             {recipe.steps?.length === 0 && <p className="text-sm text-[var(--color-ios-gray-2)]">No execution steps added yet.</p>}
          </div>
        </section>
      </div>

    </div>
  );
}
