"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Bot, Fingerprint, Save, Edit, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RecipeDetail {
  ingredients: { name: string; amount: string }[];
  instructions: string[];
}

interface ExecutionStep {
  id: string;
  name: string;
  hasRecipe: boolean;
  recipeDetails?: RecipeDetail;
  pic: string;
  startDate: string;
  endDate: string;
  isAuto: boolean;
}

interface ReviewExecutionFlowProps {
  onBackToBatch: (completed: boolean) => void;
  isCompleted?: boolean;
}

function formatDateTimeDisplay(dtString: string) {
  if (!dtString) return "";
  const [datePart, timePart] = dtString.split('T');
  if (!datePart || !timePart) return dtString;
  const splitDate = datePart.split('-');
  if (splitDate.length !== 3) return dtString;
  const [year, month, day] = splitDate;
  return `${timePart}, ${day}/${month}/${year}`;
}

export default function ReviewExecutionFlow({ onBackToBatch, isCompleted }: ReviewExecutionFlowProps) {
  const [view, setView] = useState<'list' | 'add_form' | 'success_add' | 'success_complete' | 'recipe'>('list');
  const [selectedRecipe, setSelectedRecipe] = useState<ExecutionStep | null>(null);

  // Initial mock state matching the design closely
  const [items, setItems] = useState<ExecutionStep[]>([
    {
      id: "1",
      name: "Belanja ke Toko Cigadung",
      hasRecipe: false,
      pic: "",
      startDate: "",
      endDate: "",
      isAuto: true,
    },
    {
      id: "2",
      name: "Potong Cabe-cabean",
      hasRecipe: true,
      recipeDetails: {
        ingredients: [{ name: "Cabe Hijau", amount: "500gr" }],
        instructions: [
          "Siapkan nampan dan pisau yang sudah dibersihkan.",
          "Timbang cabe sesuai yang dibutuhkan.",
          "Potong semua tangkai cabe.",
          "Pisahkan cabe yang tangkainya sudah terpotong ke dalam mangkuk terpisah.",
          "Buang sisa-sisa tangkainya."
        ]
      },
      pic: "",
      startDate: "",
      endDate: "",
      isAuto: true,
    },
    {
      id: "3",
      name: "Chopper Cabe-cabean",
      hasRecipe: true,
      pic: "",
      startDate: "",
      endDate: "",
      isAuto: true,
    }
  ]);

  // Edits State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ pic: "", startDate: "", endDate: "" });

  const handleEditClick = (item: ExecutionStep) => {
    setEditingId(item.id);
    setEditValues({
      pic: item.pic || "",
      startDate: item.startDate || "",
      endDate: item.endDate || ""
    });
  };

  const handleSaveClick = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, ...editValues } : item));
    setEditingId(null);
  };

  // Form State
  const [formName, setFormName] = useState("");
  const [formPic, setFormPic] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  const handleAddItem = () => {
    const newItem: ExecutionStep = {
      id: Math.random().toString(),
      name: formName,
      hasRecipe: false, // Manual items have unavailable recipes
      pic: formPic,
      startDate: formStartDate,
      endDate: formEndDate,
      isAuto: false,
    };
    setItems([...items, newItem]);
    
    // Clear
    setFormName(""); setFormPic(""); setFormStartDate(""); setFormEndDate("");
    setView('success_add');
  };

  const isFormValid = formName.trim() !== "" && formPic.trim() !== "" && 
                      formStartDate.trim() !== "" && formEndDate.trim() !== "";

  // Helper to open recipe
  const openRecipe = (step: ExecutionStep) => {
    if (step.hasRecipe && step.recipeDetails) {
      setSelectedRecipe(step);
      setView('recipe');
    }
  };


  // --- SUB-VIEWS ---

  if (view === 'success_add' || view === 'success_complete') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col items-center justify-center px-6 font-sans">
        <div className="w-32 h-32 rounded-full border-[6px] border-[var(--color-ios-blue)] flex items-center justify-center mb-8">
          <Check size={64} className="text-[var(--color-ios-blue)]" strokeWidth={3} />
        </div>
        <h1 className="text-[28px] font-bold text-black text-center mb-12 max-w-[280px] leading-tight">
          {view === 'success_add' 
            ? "Your New Flow Has Successfully Added" 
            : "You Have Successfully Completed the Task"
          }
        </h1>
        <div className="w-full max-w-sm mt-auto pb-12">
           <Button 
            variant="primary" fullWidth 
            onClick={() => {
              if (view === 'success_add') setView('list');
              if (view === 'success_complete') onBackToBatch(true);
            }}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'recipe' && selectedRecipe) {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans">
        <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
          <button 
            onClick={() => { setView('list'); setSelectedRecipe(null); }}
            className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
          >
            <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
            <span className="text-[17px] font-medium">Back</span>
          </button>
          <span className="text-[17px] font-semibold text-black opacity-0">Recipe</span> {/* Empty title for balance if needed */}
        </div>

        <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h1 className="text-[22px] font-bold text-black mb-6">{selectedRecipe.name}</h1>
            
            <div className="mb-6">
              <h3 className="text-[11px] font-medium text-[var(--color-ios-gray-2)] mb-2">Ingredients</h3>
              {selectedRecipe.recipeDetails?.ingredients.map((ing, idx) => (
                <div key={idx} className="flex justify-between items-center text-[16px] text-black">
                  <span>{ing.name}</span>
                  <span className="text-[16px] text-[var(--color-ios-gray-2)]">{ing.amount}</span>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-[11px] font-medium text-[var(--color-ios-gray-2)] mb-3">Recipes</h3>
              <ol className="list-decimal pl-4 space-y-3 text-[16px] text-black leading-relaxed">
                {selectedRecipe.recipeDetails?.instructions.map((step, idx) => (
                  <li key={idx} className="pl-2">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'add_form') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans">
        <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
          <button 
            onClick={() => setView('list')}
            className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
          >
            <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
            <span className="text-[17px] font-medium">Back</span>
          </button>
          <span className="text-[17px] font-semibold text-black">Add Execution Flow Manually</span>
        </div>

        <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <input 
              type="text"
              placeholder="Flow Name..."
              className="text-xl font-bold text-black w-full outline-none placeholder:text-[var(--color-ios-gray-3)] mb-6"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                 <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Ingredients and Recipes</label>
                 <p className="text-[16px] font-medium text-[var(--color-ios-blue)] mt-1">Unavailable</p>
              </div>
              <div>
                 <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">PIC</label>
                 <input 
                    type="text"
                    placeholder="PIC Name..."
                    className="w-full mt-1 text-[16px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)]"
                    value={formPic}
                    onChange={(e) => setFormPic(e.target.value)}
                  />
              </div>
              <div>
                 <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Start Date</label>
                 <input 
                    type="datetime-local"
                    lang="en-GB"
                    className="w-full mt-1 text-[14px] font-medium text-[var(--color-ios-blue)] outline-none placeholder:text-[var(--color-ios-gray-3)] bg-transparent"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
              </div>
              <div>
                 <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">End Date</label>
                 <input 
                    type="datetime-local"
                    lang="en-GB"
                    className="w-full mt-1 text-[14px] font-medium text-[var(--color-ios-blue)] outline-none placeholder:text-[var(--color-ios-gray-3)] bg-transparent"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
              </div>
            </div>
          </div>

          <button 
            disabled={!isFormValid}
            onClick={handleAddItem}
            className={`w-full py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 border transition-all ${
              isFormValid 
                ? 'border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] hover:bg-[var(--color-ios-blue)]/5 cursor-pointer' 
                : 'border-[var(--color-ios-gray-3)] text-[var(--color-ios-gray-3)] cursor-not-allowed'
            }`}
          >
            + Add Execution Flow Manually
          </button>
        </main>
      </div>
    );
  }

  // view === 'list'
  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-12">
      <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
        <button 
          onClick={() => onBackToBatch(false)}
          className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
        >
          <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
          <span className="text-[17px] font-medium">Back</span>
        </button>
        <span className="text-[17px] font-semibold text-black">Review Execution Flow</span>
      </div>

      <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4">
        <div className="flex flex-col gap-4 mb-8">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            
            return (
            <div key={item.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-colors ${isEditing ? 'border-[var(--color-ios-blue)] shadow-md' : 'border-transparent'}`}>
              <div className="flex justify-between flex-start mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-black">{item.name}</h3>
                  {item.isAuto ? (
                    <Bot size={20} className="text-[var(--color-ios-blue)]" />
                  ) : (
                    <Fingerprint size={20} className="text-[var(--color-ios-blue)]" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleSaveClick(item.id)}
                    disabled={!isEditing || isCompleted}
                    className={`transition-colors ${isEditing && !isCompleted ? 'text-[var(--color-ios-blue)] active:scale-95' : 'text-[var(--color-ios-gray-3)] cursor-not-allowed'}`}
                  >
                    <Save size={20} strokeWidth={isEditing ? 2 : 1.5} />
                  </button>
                  <button 
                    onClick={() => handleEditClick(item)}
                    disabled={isEditing || isCompleted}
                    className={`transition-colors ${!isEditing && !isCompleted ? 'text-[var(--color-ios-blue)] active:scale-95' : 'text-[var(--color-ios-gray-3)] cursor-not-allowed'}`}
                  >
                    <Edit size={20} strokeWidth={!isEditing ? 2 : 1.5} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Ingredients and Recipes</label>
                  {item.hasRecipe ? (
                    <button 
                      onClick={() => openRecipe(item)}
                      className="text-[16px] font-medium text-[var(--color-ios-blue)] mt-1 flex items-center gap-1 active:opacity-70"
                    >
                      Check <ChevronRight size={16} strokeWidth={2.5} className="mt-0.5" />
                    </button>
                  ) : (
                    <p className="text-[16px] font-medium text-[var(--color-ios-blue)] mt-1">Unavailable</p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">PIC</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="w-full mt-1 border-b border-[var(--color-ios-blue)] bg-[var(--color-ios-blue)]/5 py-1 px-2 rounded-t-sm text-[16px] font-medium text-black outline-none"
                      value={editValues.pic}
                      onChange={(e) => setEditValues({ ...editValues, pic: e.target.value })}
                      placeholder="..."
                    />
                  ) : (
                    <p className="text-[16px] font-medium text-black mt-1">
                      {item.pic || <span className="text-[var(--color-ios-gray-3)] italic">Not set</span>}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Start Date</label>
                  {isEditing ? (
                    <input 
                      type="datetime-local"
                      lang="en-GB"
                      className="w-full mt-1 border-b border-[var(--color-ios-blue)] bg-[var(--color-ios-blue)]/5 py-1 px-1 rounded-t-sm text-[14px] font-medium text-[var(--color-ios-blue)] outline-none"
                      value={editValues.startDate}
                      onChange={(e) => setEditValues({ ...editValues, startDate: e.target.value })}
                    />
                  ) : (
                    <p className="text-[14px] font-medium text-black mt-1">
                      {item.startDate ? formatDateTimeDisplay(item.startDate) : <span className="text-[var(--color-ios-gray-3)] italic">Not set</span>}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">End Date</label>
                  {isEditing ? (
                    <input 
                      type="datetime-local"
                      lang="en-GB"
                      className="w-full mt-1 border-b border-[var(--color-ios-blue)] bg-[var(--color-ios-blue)]/5 py-1 px-1 rounded-t-sm text-[14px] font-medium text-[var(--color-ios-blue)] outline-none"
                      value={editValues.endDate}
                      onChange={(e) => setEditValues({ ...editValues, endDate: e.target.value })}
                    />
                  ) : (
                    <p className="text-[14px] font-medium text-black mt-1">
                      {item.endDate ? formatDateTimeDisplay(item.endDate) : <span className="text-[var(--color-ios-gray-3)] italic">Not set</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>

        <div className="space-y-4">
          <button 
             onClick={() => setView('add_form')}
             disabled={isCompleted}
             className={`w-full border py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors ${
               isCompleted ? 'border-[var(--color-ios-gray-3)] text-[var(--color-ios-gray-3)] cursor-not-allowed' : 'border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] hover:bg-[var(--color-ios-blue)]/5 cursor-pointer'
             }`}
          >
            + Add Execution Flow Manually
          </button>
          
          {(() => {
            const canComplete = !isCompleted && editingId === null && items.every(i => i.pic.trim() !== "" && i.startDate.trim() !== "" && i.endDate.trim() !== "");
            return canComplete ? (
              <Button variant="primary" fullWidth onClick={() => setView('success_complete')}>
                Complete Task
              </Button>
            ) : (
              <button disabled className="w-full py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 bg-[var(--color-ios-gray-4)] text-[var(--color-ios-gray-2)] cursor-not-allowed">
                Complete Task
              </button>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
