"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Save, Edit3, ChevronDown, Loader2 } from "lucide-react";
import { getCookingRecipes, deleteCookingRecipe, updateCookingRecipe } from "@/app/lib/recipeActionsSingular";
import { getInventory } from "@/app/actions/inventory";

interface RecipeDetailScreenProps {
  recipeId: string;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Editable Rich Text Editor
// ---------------------------------------------------------------------------
const RecipeEditor = ({
  initialHtml,
  onChange,
  inventoryItems,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
  inventoryItems: any[];
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showIngModal, setShowIngModal] = useState(false);
  const [selIngName, setSelIngName] = useState("");
  // Store the saved selection so we can restore it after modal closes
  const savedRange = useRef<Range | null>(null);

  // Initialise editor content once
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHtml;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      // Just let the default Enter behavior happen, no auto-numbering
      handleInput();
    }
  };

  const insertStepNumber = () => {
    const text = editorRef.current?.innerText || "";
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    let nextNum = 1;
    if (lines.length > 0) {
      // Try to find the last line that starts with a number.
      // We look through lines from end to start.
      for (let i = lines.length - 1; i >= 0; i--) {
        const match = lines[i].match(/^(\d+)\./);
        if (match) {
          nextNum = parseInt(match[1]) + 1;
          break;
        }
      }
      // If no numbered line was found, nextNum remains based on line count or 1
      if (nextNum === 1 && lines.length > 0) {
        nextNum = lines.length + 1;
      }
    }
    
    editorRef.current?.focus();
    const insertStr = text.trim().length === 0 ? `${nextNum}. ` : `<br><br>${nextNum}. `;
    document.execCommand("insertHTML", false, insertStr);
    handleInput();
  };

  const insertVariable = () => {
    const val = prompt("Enter Amount & Unit (e.g. 100g)");
    if (!val) return;
    const pillHtml = `&nbsp;<span contenteditable="false" class="inline-flex items-center justify-center bg-[#F2F2F7] text-black px-2 py-0.5 rounded-md mx-0.5 font-medium text-[14px]" data-variable="${val}">${val}</span>&nbsp;`;
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, pillHtml);
    handleInput();
  };

  // Save current caret position before opening modal
  const openIngModal = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
    setShowIngModal(true);
  };

  const insertIngredientPill = () => {
    if (!selIngName) return alert("Select an ingredient first");
    const item = inventoryItems.find(i => i.name === selIngName);
    const label = item ? `${selIngName}` : selIngName;

    const pillHtml = `&nbsp;<span contenteditable="false" class="inline-flex items-center justify-center bg-[#E5E5EA] text-black px-2 py-0.5 rounded-md mx-0.5 font-semibold text-[14px]" data-ingredient="${selIngName}">${label}</span>&nbsp;`;

    setShowIngModal(false);
    setSelIngName("");

    // Restore the saved caret position and insert there
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
      document.execCommand("insertHTML", false, pillHtml);
    } else {
      // Fallback: insert at end
      document.execCommand("insertHTML", false, pillHtml);
    }
    handleInput();
  };

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow-sm border border-[#E5E5EA] overflow-hidden flex flex-col mb-6">
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#E5E5EA]">
          <span className="text-[17px] font-bold text-black">Recipe</span>
          <div className="flex gap-4">
            <button
              onClick={insertStepNumber}
              className="text-[var(--color-ios-blue)] font-bold text-[15px] active:opacity-70 transition-opacity"
            >
               Step No.
            </button>
            <button
              onClick={openIngModal}
              className="text-[var(--color-ios-blue)] font-bold text-[15px] active:opacity-70 transition-opacity"
            >
              + Add Ingredient
            </button>
            <button
              onClick={insertVariable}
              className="text-[var(--color-ios-blue)] font-bold text-[15px] active:opacity-70 transition-opacity"
            >
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
          <div className="bg-[#F5F5F7] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="text-[20px] font-bold text-center text-black mb-6">Add Ingredient</h3>

              <div className="mb-8 relative">
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

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowIngModal(false); setSelIngName(""); }}
                  className="flex-1 py-3.5 rounded-xl bg-[#E5E5EA] text-black font-semibold text-[17px] active:bg-[#D1D1D6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={insertIngredientPill}
                  disabled={!selIngName}
                  className="flex-1 py-3.5 rounded-xl bg-[var(--color-ios-blue)] text-white font-semibold text-[17px] active:opacity-80 transition-colors disabled:opacity-50"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// Read-only recipe HTML view
// ---------------------------------------------------------------------------
const RecipeView = ({
  instructions,
  inventoryItems,
}: {
  instructions: string;
  inventoryItems: any[];
}) => (
  <div className="w-full bg-white rounded-xl shadow-sm border border-[#E5E5EA] overflow-hidden flex flex-col mb-6">
    <div className="flex justify-between items-center px-4 py-3 border-b border-[#E5E5EA]">
      <span className="text-[17px] font-bold text-black">Recipe</span>
      <div className="flex gap-4 pointer-events-none">
        <span className="text-[15px] text-[var(--color-ios-gray-3)]">Step No.</span>
        <span className="text-[15px] text-[var(--color-ios-gray-3)]">+ Add Ingredient</span>
        <span className="text-[15px] text-[var(--color-ios-gray-3)]">123...</span>
      </div>
    </div>
    <div
      className="w-full min-h-[200px] p-4 text-[17px] text-black whitespace-pre-wrap leading-relaxed custom-html-content"
      dangerouslySetInnerHTML={{ __html: instructions }}
    />
  </div>
);

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function RecipeDetailScreen({ recipeId, onBack }: RecipeDetailScreenProps) {
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedInstructions, setEditedInstructions] = useState("");
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [recRes, invRes] = await Promise.all([getCookingRecipes(), getInventory()]);
      if (recRes.success && recRes.recipes) {
        const found = recRes.recipes.find((r: any) => r.id === recipeId);
        setRecipe(found);
        setEditedInstructions(found?.instructions || "");
      }
      setInventoryItems(invRes || []);
      setIsLoading(false);
    }
    load();
  }, [recipeId]);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateCookingRecipe(recipeId, editedInstructions);
    setIsSaving(false);
    if (res.success) {
      setRecipe((prev: any) => ({ ...prev, instructions: editedInstructions }));
      setIsEditMode(false);
    } else {
      alert("Failed to save: " + res.error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      const res = await deleteCookingRecipe(recipeId);
      if (res.success) { onBack(); } else { alert("Failed to delete recipe: " + res.error); }
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
      <Loader2 className="animate-spin text-[var(--color-ios-gray-3)]" size={40} />
    </div>
  );
  if (!recipe) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">Recipe not found.</div>;

  const templateName = recipe.name.replace("Recipe for ", "");

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-40 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full">
        <button onClick={onBack} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity w-20">
          <ChevronLeft size={24} className="-ml-1" />
          <span>Back</span>
        </button>
        <h1 className="text-[17px] font-semibold text-center text-black truncate flex-1 px-2">
          {isEditMode ? "Edit Recipe" : recipe.name}
        </h1>
        <div className="flex items-center gap-3 justify-end w-20">
          {isEditMode ? (
            <button onClick={handleSave} disabled={isSaving} className="text-[var(--color-ios-blue)] font-semibold text-[17px] active:opacity-70">
              {isSaving ? "Saving..." : "Save"}
            </button>
          ) : (
            <button onClick={() => setIsEditMode(true)} className="text-[var(--color-ios-blue)] active:opacity-70 transition-opacity">
              <Edit3 size={22} />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 w-full max-w-md mx-auto flex-1 flex flex-col pt-6">
        {/* Recipe Of */}
        <div className="mb-6 flex-shrink-0">
          <h2 className="text-[17px] font-bold text-black mb-3">Recipe of</h2>
          <div className="w-full bg-white rounded-xl py-3.5 px-4 text-[17px] text-black shadow-sm flex justify-between items-center opacity-70">
            <span>{templateName}</span>
            <ChevronDown size={20} className="text-[#C7C7CC]" />
          </div>
        </div>

        {/* Editor or View */}
        {isEditMode ? (
          <RecipeEditor
            key={recipeId} // Reset editor when recipe changes
            initialHtml={recipe.instructions}
            onChange={setEditedInstructions}
            inventoryItems={inventoryItems}
          />
        ) : (
          <RecipeView instructions={recipe.instructions} inventoryItems={inventoryItems} />
        )}
      </div>

      {/* Fixed Bottom Delete Button */}
      <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-6 pb-12 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none z-10">
        <div className="pointer-events-auto">
          <button
            onClick={handleDelete}
            className="w-full py-4 rounded-full font-semibold text-[17px] bg-transparent text-[#FF3B30] border border-[#FF3B30] active:bg-[#FF3B30]/10 transition-colors"
          >
            Delete Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
