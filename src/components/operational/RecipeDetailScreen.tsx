"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Edit, Trash2, Plus, XCircle, ChevronDown, Loader2 } from "lucide-react";
import {
  getProductionTemplateById,
  deleteProductionTemplate,
  updateProductionTemplateName,
  updateTemplateIngredient,
  updateTemplateFlow,
} from "@/app/lib/recipeActionsSingular";
import { addTemplateIngredient, removeTemplateIngredient, addTemplateFlow, removeTemplateFlow } from "@/app/lib/recipeActions";
import { getInventory } from "@/app/actions/inventory";

interface TemplateDetailScreenProps {
  templateId: string;
  onBack: () => void;
}

export default function TemplateDetailScreen({ templateId, onBack }: TemplateDetailScreenProps) {
  const [template, setTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  // Edit state — local copies mutated live
  const [editName, setEditName] = useState("");
  const [editIngredients, setEditIngredients] = useState<{ id: string; name: string; quantity: string; unit: string }[]>([]);
  const [editFlows, setEditFlows] = useState<{ id: string; name: string }[]>([]);

  // New-row add state
  const [newIngName, setNewIngName] = useState("");
  const [newIngAmount, setNewIngAmount] = useState("");
  const [newFlowName, setNewFlowName] = useState("");

  const load = async () => {
    setIsLoading(true);
    const [tRes, inv] = await Promise.all([getProductionTemplateById(templateId), getInventory()]);
    if (tRes.success && tRes.template) {
      setTemplate(tRes.template);
      setEditName(tRes.template.name);
      setEditIngredients(
        tRes.template.ingredients.map((i: any) => ({
          id: i.id,
          name: i.name,
          quantity: String(i.quantity),
          unit: i.unit,
        }))
      );
      setEditFlows(tRes.template.flows.map((f: any) => ({ id: f.id, name: f.name })));
    }
    setInventoryItems(inv || []);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [templateId]);

  // Helper: get unit from inventory for a given ingredient name
  const unitFor = (name: string) => inventoryItems.find(i => i.name === name)?.unit ?? "";

  const handleSave = async () => {
    if (!editName.trim()) return alert("Menu name cannot be empty");
    setIsSaving(true);

    // Save name
    await updateProductionTemplateName(templateId, editName);

    // Save updated existing ingredients
    for (const ing of editIngredients) {
      await updateTemplateIngredient(ing.id, {
        name: ing.name,
        quantity: parseFloat(ing.quantity) || 0,
        unit: unitFor(ing.name) || ing.unit,
      });
    }

    // Save updated existing flows
    for (const flow of editFlows) {
      await updateTemplateFlow(flow.id, flow.name);
    }

    setIsSaving(false);
    setIsEditMode(false);
    await load();
  };

  const handleAddIngredient = async () => {
    if (!newIngName || !newIngAmount) return alert("Fill all ingredient fields");
    const unit = unitFor(newIngName) || "pcs";
    await addTemplateIngredient(templateId, { name: newIngName, quantity: parseFloat(newIngAmount), unit });
    setNewIngName(""); setNewIngAmount("");
    await load();
  };

  const handleRemoveIngredient = async (id: string) => {
    await removeTemplateIngredient(id);
    setEditIngredients(prev => prev.filter(i => i.id !== id));
    await load();
  };

  const handleAddFlow = async () => {
    if (!newFlowName.trim()) return alert("Flow name cannot be empty");
    await addTemplateFlow(templateId, { name: newFlowName });
    setNewFlowName("");
    await load();
  };

  const handleRemoveFlow = async (id: string) => {
    await removeTemplateFlow(id);
    setEditFlows(prev => prev.filter(f => f.id !== id));
    await load();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this production template?")) {
      const res = await deleteProductionTemplate(templateId);
      if (res.success) { onBack(); } else { alert(res.error); }
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
      <Loader2 className="animate-spin text-[var(--color-ios-gray-3)]" size={40} />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-40 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full">
        <button onClick={onBack} className="flex items-center text-[var(--color-ios-blue)] flex-1 text-[17px] font-medium active:opacity-70 transition-opacity">
          <ChevronLeft size={24} className="-ml-1" />
          <span>Back</span>
        </button>
        <span className="font-bold text-black text-[17px] flex-[2] text-center truncate">
          {isEditMode ? "Edit Template" : template?.name}
        </span>
        <div className="flex-1 flex justify-end">
          {isEditMode ? (
            <button onClick={handleSave} disabled={isSaving} className="text-[var(--color-ios-blue)] font-semibold text-[17px] active:opacity-70">
              {isSaving ? "Saving..." : "Save"}
            </button>
          ) : (
            <button onClick={() => setIsEditMode(true)} className="text-[var(--color-ios-blue)] active:opacity-70 transition-opacity">
              <Edit size={22} />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 mt-4 w-full max-w-md mx-auto">

        {/* Menu Name */}
        <div className="mb-6">
          <h2 className="text-[15px] font-bold text-black mb-3">Menu Name</h2>
          {isEditMode ? (
            <div className="relative">
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full bg-white rounded-xl py-3.5 px-4 text-[17px] text-black outline-none shadow-sm border border-[var(--color-ios-blue)]"
              />
              {editName && (
                <button onClick={() => setEditName("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <XCircle size={20} className="text-[#C7C7CC] fill-[#C7C7CC] text-white" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-full bg-white rounded-xl py-3.5 px-4 shadow-sm border border-[#E5E5EA]">
              <span className="text-[17px] text-black">{template?.name}</span>
            </div>
          )}
        </div>

        <hr className="border-[#E5E5EA] mb-6" />

        {/* Ingredients */}
        <div className="mb-6">
          <h2 className="text-[15px] font-bold text-black mb-3">Ingredients</h2>
          <div className="space-y-3 mb-4">
            {(isEditMode ? editIngredients : template?.ingredients)?.map((ing: any, idx: number) => (
              <div key={ing.id} className="flex gap-3 items-center">
                {isEditMode ? (
                  <>
                    {/* Ingredient name — inline select */}
                    <div className="flex-[2] relative">
                      <select
                        value={ing.name}
                        onChange={e => {
                          const newName = e.target.value;
                          const newUnit = unitFor(newName);
                          setEditIngredients(prev =>
                            prev.map((item, i) => i === idx ? { ...item, name: newName, unit: newUnit || item.unit } : item)
                          );
                        }}
                        className="w-full bg-white rounded-xl py-3.5 pl-4 pr-10 text-[17px] text-black outline-none shadow-sm border border-[#E5E5EA] appearance-none"
                      >
                        {/* Keep current value even if not in inventory yet */}
                        {!inventoryItems.find(i => i.name === ing.name) && (
                          <option value={ing.name}>{ing.name}</option>
                        )}
                        {inventoryItems.map(item => (
                          <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C7C7CC] pointer-events-none" />
                    </div>

                    {/* Amount — inline input with unit suffix */}
                    <div className="flex-[1] relative flex items-center">
                      <input
                        type="number"
                        value={ing.quantity}
                        onChange={e => setEditIngredients(prev =>
                          prev.map((item, i) => i === idx ? { ...item, quantity: e.target.value } : item)
                        )}
                        className="w-full bg-white rounded-xl py-3.5 pl-4 pr-10 text-[17px] text-black outline-none shadow-sm border border-[#E5E5EA]"
                      />
                      <span className="absolute right-3 text-[13px] text-[var(--color-ios-gray-2)] pointer-events-none">
                        {unitFor(ing.name) || ing.unit}
                      </span>
                    </div>

                    <button onClick={() => handleRemoveIngredient(ing.id)} className="text-[#FF3B30] p-1 active:opacity-70 flex-shrink-0">
                      <Trash2 size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-[2] bg-white rounded-xl py-3.5 px-4 shadow-sm border border-[#E5E5EA] text-[17px] text-black truncate">{ing.name}</div>
                    <div className="flex-[1] bg-white rounded-xl py-3.5 px-4 shadow-sm border border-[#E5E5EA] text-[17px] text-black truncate">{ing.quantity}{ing.unit}</div>
                  </>
                )}
              </div>
            ))}
            {(!template?.ingredients || template.ingredients.length === 0) && !isEditMode && (
              <p className="text-[#C7C7CC] text-[15px] italic">No ingredients yet.</p>
            )}
          </div>

          {/* Add new ingredient row (only in edit mode) */}
          {isEditMode && (
            <div className="flex gap-3">
              <div className="flex-[2] relative">
                <select
                  value={newIngName}
                  onChange={e => setNewIngName(e.target.value)}
                  className="w-full bg-white rounded-xl py-3.5 pl-4 pr-10 text-[17px] text-black outline-none shadow-sm border border-[#E5E5EA] appearance-none"
                >
                  <option value="" disabled>Add ingredient...</option>
                  {inventoryItems.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C7C7CC] pointer-events-none" />
              </div>
              <div className="flex-[1] relative flex items-center">
                <input
                  type="number"
                  placeholder="Amount"
                  value={newIngAmount}
                  onChange={e => setNewIngAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddIngredient()}
                  className="w-full bg-white rounded-xl py-3.5 pl-4 pr-10 text-[17px] text-black outline-none shadow-sm border border-[#E5E5EA]"
                />
                {newIngName && unitFor(newIngName) && (
                  <span className="absolute right-3 text-[13px] text-[var(--color-ios-gray-2)] pointer-events-none">
                    {unitFor(newIngName)}
                  </span>
                )}
              </div>
              <button onClick={handleAddIngredient} className="w-12 shrink-0 bg-white border border-[#E5E5EA] rounded-xl flex items-center justify-center active:bg-gray-50">
                <Plus size={20} className="text-[var(--color-ios-blue)]" />
              </button>
            </div>
          )}
        </div>

        <hr className="border-[#E5E5EA] mb-6" />

        {/* Execution Flows */}
        <div className="mb-6">
          <h2 className="text-[15px] font-bold text-black mb-3">Execution Flow</h2>
          <div className="space-y-3 mb-4">
            {(isEditMode ? editFlows : template?.flows)?.map((flow: any, idx: number) => (
              <div key={flow.id} className="flex gap-3 items-center">
                {isEditMode ? (
                  <>
                    <input
                      type="text"
                      value={flow.name}
                      onChange={e => setEditFlows(prev =>
                        prev.map((f, i) => i === idx ? { ...f, name: e.target.value } : f)
                      )}
                      className="flex-1 bg-white rounded-xl py-3.5 px-4 text-[17px] text-black outline-none shadow-sm border border-[#E5E5EA]"
                    />
                    <button onClick={() => handleRemoveFlow(flow.id)} className="text-[#FF3B30] p-1 active:opacity-70 flex-shrink-0">
                      <Trash2 size={20} />
                    </button>
                  </>
                ) : (
                  <div className="flex-1 bg-white rounded-xl py-3.5 px-4 shadow-sm border border-[#E5E5EA] text-[17px] text-black truncate">
                    {flow.name}
                  </div>
                )}
              </div>
            ))}
            {(!template?.flows || template.flows.length === 0) && !isEditMode && (
              <p className="text-[#C7C7CC] text-[15px] italic">No execution flows yet.</p>
            )}
          </div>

          {/* Add new flow row (only in edit mode) */}
          {isEditMode && (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="(e.g. Velvet Sapi)"
                  value={newFlowName}
                  onChange={e => setNewFlowName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddFlow()}
                  className="w-full bg-white rounded-xl py-3.5 px-4 pr-10 text-[17px] text-black outline-none shadow-sm border border-[#E5E5EA]"
                />
                {newFlowName && (
                  <button onClick={() => setNewFlowName("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <XCircle size={20} className="text-[#C7C7CC] fill-[#C7C7CC] text-white" />
                  </button>
                )}
              </div>
              <button onClick={handleAddFlow} className="w-12 shrink-0 bg-white border border-[#E5E5EA] rounded-xl flex items-center justify-center active:bg-gray-50">
                <Plus size={20} className="text-[var(--color-ios-blue)]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Delete Button */}
      <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-6 pb-12 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none z-10">
        <div className="pointer-events-auto">
          <button
            onClick={handleDelete}
            className="w-full py-4 rounded-full font-semibold text-[17px] transition-colors bg-transparent text-[#FF3B30] border border-[#FF3B30] active:bg-[#FF3B30]/10"
          >
            Delete Template
          </button>
        </div>
      </div>
    </div>
  );
}
