"use client";

import { useState } from "react";
import { ChevronLeft, Bot, Fingerprint, Save, Edit, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ShoppingItem {
  id: string;
  name: string;
  merchant: string;
  amountNeeded?: string;
  currentInventory?: string;
  toBuy: string;
  isAuto: boolean;
}

interface ReviewShoppingListFlowProps {
  onBackToBatch: (completed: boolean) => void;
  isCompleted?: boolean;
}

export default function ReviewShoppingListFlow({ onBackToBatch, isCompleted }: ReviewShoppingListFlowProps) {
  // Sub-routing within the Shopping List flow
  const [view, setView] = useState<'list' | 'add_form' | 'success_add' | 'success_complete'>('list');
  
  // State for the items list (mix of auto and manual)
  const [items, setItems] = useState<ShoppingItem[]>([
    {
      id: "1",
      name: "Dada Ayam",
      merchant: "SR Chicken",
      amountNeeded: "1000gr",
      currentInventory: "20gr",
      toBuy: "980gr",
      isAuto: true,
    },
    {
      id: "2",
      name: "Cabe Hijau",
      merchant: "Toko Cigadung",
      amountNeeded: "500gr",
      currentInventory: "600gr",
      toBuy: "-", // Sufficient inventory
      isAuto: true,
    }
  ]);

  // Form state for adding manual items
  const [formName, setFormName] = useState("");
  const [formMerchant, setFormMerchant] = useState("");
  const [formToBuy, setFormToBuy] = useState("");

  const handleAddItem = () => {
    const newItem: ShoppingItem = {
      id: Math.random().toString(),
      name: formName,
      merchant: formMerchant,
      toBuy: `${formToBuy}gr`,
      isAuto: false,
    };
    setItems([...items, newItem]);
    
    // Clear form
    setFormName("");
    setFormMerchant("");
    setFormToBuy("");
    
    // Go to success
    setView('success_add');
  };

  // Edits State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ merchant: "", toBuy: "" });

  const handleEditClick = (item: ShoppingItem) => {
    setEditingId(item.id);
    setEditValues({
      merchant: item.merchant,
      toBuy: item.toBuy.replace('gr', '')
    });
  };

  const handleSaveClick = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, merchant: editValues.merchant, toBuy: `${editValues.toBuy}gr` } : item));
    setEditingId(null);
  };

  const handleCompleteTask = () => {
    setView('success_complete');
  };

  const isFormValid = formName.trim() !== "" && formMerchant.trim() !== "" && formToBuy.trim() !== "";

  // --- SUB-VIEWS ---

  if (view === 'success_add' || view === 'success_complete') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col items-center justify-center px-6 font-sans">
        <div className="w-32 h-32 rounded-full border-[6px] border-[var(--color-ios-blue)] flex items-center justify-center mb-8">
          <Check size={64} className="text-[var(--color-ios-blue)]" strokeWidth={3} />
        </div>
        <h1 className="text-[28px] font-bold text-black text-center mb-12 max-w-[280px] leading-tight">
          {view === 'success_add' 
            ? "Your New Item Has Successfully Added" 
            : "You Have Successfully Completed the Task"
          }
        </h1>
        <div className="w-full max-w-sm mt-auto pb-12">
           <Button 
            variant="primary" 
            fullWidth 
            onClick={() => {
              if (view === 'success_add') setView('list');
              if (view === 'success_complete') onBackToBatch(true); // Return to batch details marked as done
            }}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'add_form') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans">
        {/* Header */}
        <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
          <button 
            onClick={() => setView('list')}
            className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
          >
            <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
            <span className="text-[17px] font-medium">Back</span>
          </button>
          <span className="text-[17px] font-semibold text-black">Add Item Manually</span>
        </div>

        <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
            <input 
              type="text"
              placeholder="Item Name..."
              className="text-xl font-bold text-black w-full outline-none placeholder:text-[var(--color-ios-gray-3)]"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            
            <div className="grid grid-cols-2 mt-6 gap-4">
              <div>
                 <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Merchant</label>
                 <select 
                    className="w-full mt-1 bg-[var(--color-ios-gray-6)] rounded-lg py-1.5 px-3 text-[15px] font-medium text-black outline-none appearance-none"
                    value={formMerchant}
                    onChange={(e) => setFormMerchant(e.target.value)}
                  >
                    <option value="" disabled>Merchant Name...</option>
                    <option value="Toko Cigadung">Toko Cigadung</option>
                    <option value="SR Chicken">SR Chicken</option>
                    <option value="Pasar Induk">Pasar Induk</option>
                 </select>
              </div>
              <div className="text-right">
                 <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)] mr-1">To Buy</label>
                 <div className="flex items-center justify-end mt-1">
                   <input 
                      type="number"
                      placeholder="..."
                      className="w-16 text-right text-[15px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)]"
                      value={formToBuy}
                      onChange={(e) => setFormToBuy(e.target.value)}
                    />
                    <span className="text-[15px] text-[var(--color-ios-gray-2)] ml-1">gr</span>
                 </div>
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
            + Add Item Manually
          </button>
        </main>
      </div>
    );
  }

  // view === 'list'
  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-12">
      {/* Header */}
      <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
        <button 
          onClick={() => onBackToBatch(false)}
          className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
        >
          <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
          <span className="text-[17px] font-medium">Back</span>
        </button>
        <span className="text-[17px] font-semibold text-black">Review Shopping Lists</span>
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
                {/* Manual items get Save/Edit icons on the top right per the design */}
                {!item.isAuto && (
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
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Merchant</label>
                  {isEditing ? (
                    <select 
                      className="w-full mt-1 border-b border-[var(--color-ios-blue)] bg-[var(--color-ios-blue)]/5 py-1 px-1 rounded-t-sm text-[14px] font-medium text-black outline-none appearance-none"
                      value={editValues.merchant}
                      onChange={(e) => setEditValues({ ...editValues, merchant: e.target.value })}
                    >
                      <option value="Toko Cigadung">Toko Cigadung</option>
                      <option value="SR Chicken">SR Chicken</option>
                      <option value="Pasar Induk">Pasar Induk</option>
                    </select>
                  ) : (
                    <div className="mt-1 bg-[var(--color-ios-gray-6)] rounded-lg py-1.5 px-3 inline-block">
                      <span className="text-[14px] font-medium text-black">{item.merchant}</span>
                    </div>
                  )}
                </div>
                {item.isAuto && (
                  <div>
                    <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Amount Needed</label>
                    <p className="text-[20px] font-light text-[var(--color-ios-gray-2)] mt-0.5">{item.amountNeeded}</p>
                  </div>
                )}
                {item.isAuto && (
                  <div>
                    <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Current Inventory</label>
                    <p className="text-[20px] font-light text-[var(--color-ios-gray-2)] mt-0.5">{item.currentInventory}</p>
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">To Buy</label>
                  {isEditing ? (
                    <div className="flex items-center mt-0.5">
                      <input 
                        type="number"
                        className="w-16 border-b border-[var(--color-ios-blue)] bg-[var(--color-ios-blue)]/5 py-1 px-1 rounded-t-sm text-[16px] font-medium text-black outline-none"
                        value={editValues.toBuy}
                        onChange={(e) => setEditValues({...editValues, toBuy: e.target.value})}
                      />
                      <span className="text-[16px] text-black ml-1">gr</span>
                    </div>
                  ) : (
                    <p className="text-[20px] font-medium text-black mt-0.5">{item.toBuy}</p>
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
            + Add Item Manually
          </button>
          
          {(() => {
            const canComplete = !isCompleted && editingId === null && items.every(i => i.isAuto || (i.merchant.trim() !== "" && i.toBuy.trim() !== "gr" && i.toBuy.trim() !== ""));
            return canComplete ? (
              <Button variant="primary" fullWidth onClick={handleCompleteTask}>
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
