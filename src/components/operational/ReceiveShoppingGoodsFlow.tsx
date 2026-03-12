"use client";

import { useState } from "react";
import { ChevronLeft, ClipboardList, ReceiptText, Bot, Fingerprint, Check, X, AlertCircle, Trash2, Edit2, ChevronDown, ChevronUp, Image as ImageIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UnpurchasedItem {
  id: string;
  name: string;
  merchant: string;
  amountNeeded?: string;
  currentInventory?: string;
  toBuy: string; // "980gr"
  isAuto: boolean;
  isManual?: boolean;
}

interface PurchaseEntry {
  id: string;
  itemId: string;
  name: string;
  toBuyLabel: string;
  amountBought: string;
  amountSpent: string;
  purchaseDate: string;
  location: string;
  isAuto: boolean;
  isManual: boolean;
}

interface Transaction {
  id: string;
  name: string;
  totalSpent: string;
  receiptCount: number;
  items: PurchaseEntry[];
}

interface ManualDraft {
  tempId: string;
  name: string;
  amountBought: string;
  amountSpent: string;
  purchaseDate: string;
  location: string;
}

interface ReceiveShoppingGoodsFlowProps {
  onBackToBatch: (completed: boolean) => void;
  isCompleted?: boolean;
}

export default function ReceiveShoppingGoodsFlow({ onBackToBatch, isCompleted }: ReceiveShoppingGoodsFlowProps) {
  const [view, setView] = useState<'main' | 'unpurchased' | 'history_receipts' | 'add_purchase_list' | 'add_purchase_success'>('main');

  // Recipe Data
  const [unpurchasedItems, setUnpurchasedItems] = useState<UnpurchasedItem[]>([
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
      toBuy: "0", 
      isAuto: true,
    },
    {
      id: "3",
      name: "Cabe Rawit",
      merchant: "Toko Cigadung",
      toBuy: "400gr",
      isAuto: false,
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedTransactions, setExpandedTransactions] = useState<string[]>([]);

  // State for Add Purchase View
  const [transactionsName, setTransactionsName] = useState("");
  const [selectedRecipeItems, setSelectedRecipeItems] = useState<string[]>([]);
  const [recipeInputs, setRecipeInputs] = useState<Record<string, {
    amountBought: string;
    amountSpent: string;
    purchaseDate: string;
    location: string;
  }>>({});

  // Inline Manual Drafts
  const [manualDrafts, setManualDrafts] = useState<ManualDraft[]>([]);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Logic for yellow dot
  const hasUnpurchased = unpurchasedItems.some(item => {
    const val = parseInt(item.toBuy.replace(/[^0-9]/g, '')) || 0;
    return val > 0;
  });

  const isAllRecipeDone = unpurchasedItems.every(item => {
    const val = parseInt(item.toBuy.replace(/[^0-9]/g, '')) || 0;
    return val === 0;
  });

  const handleToggleRecipeSelection = (id: string) => {
    setValidationError(null);
    setSelectedRecipeItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    if (!selectedRecipeItems.includes(id) && !recipeInputs[id]) {
      setRecipeInputs(prev => ({
        ...prev,
        [id]: { amountBought: "", amountSpent: "", purchaseDate: "", location: "" }
      }));
    }
  };

  const handleUpdateRecipeInput = (id: string, field: string, value: string) => {
    setValidationError(null);
    setRecipeInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleAddManualDraft = () => {
    setManualDrafts(prev => [...prev, {
      tempId: `draft-${Date.now()}`,
      name: "",
      amountBought: "",
      amountSpent: "",
      purchaseDate: "",
      location: ""
    }]);
  };

  const handleUpdateManualDraft = (tempId: string, field: string, value: string) => {
    setValidationError(null);
    setManualDrafts(prev => prev.map(d => d.tempId === tempId ? { ...d, [field]: value } : d));
  };

  const handleRemoveManualDraft = (tempId: string) => {
    setManualDrafts(prev => prev.filter(d => d.tempId !== tempId));
  };

  const handlePerformPurchase = () => {
    if (!transactionsName.trim()) {
      setValidationError("Transactions Name is required");
      return;
    }
    
    // Check if anything is being bought
    if (selectedRecipeItems.length === 0 && manualDrafts.length === 0) {
      setValidationError("Please select at least one recipe item or add a manual item");
      return;
    }

    // Validate Recipe Items
    const recipeFilled = selectedRecipeItems.every(id => {
      const inputs = recipeInputs[id];
      return inputs && inputs.amountBought && inputs.amountSpent && inputs.purchaseDate && inputs.location;
    });

    // Validate Manual Items (must have Name + all fields)
    const manualFilled = manualDrafts.every(d => {
      return d.name.trim() && d.amountBought && d.amountSpent && d.purchaseDate && d.location;
    });

    if (!recipeFilled || !manualFilled) {
      setValidationError("Fill the required form to proceed");
      return;
    }

    const transactionItems: PurchaseEntry[] = [];
    let transactionTotal = 0;

    // Process Recipe Items
    const nextUnpurchased = [...unpurchasedItems];
    selectedRecipeItems.forEach(id => {
      const inputs = recipeInputs[id];
      const amountBoughtNum = parseInt(inputs.amountBought) || 0;
      transactionTotal += parseInt(inputs.amountSpent) || 0;

      const recipeIdx = nextUnpurchased.findIndex(item => item.id === id);
      const item = nextUnpurchased[recipeIdx];
      const toBuyNum = parseInt(item.toBuy.replace(/[^0-9]/g, '')) || 0;
      const unit = item.toBuy.replace(/[0-9]/g, '') || "gr";
      
      transactionItems.push({
        id: `entry-${Date.now()}-${id}`,
        itemId: id,
        name: item.name,
        toBuyLabel: item.toBuy,
        amountBought: inputs.amountBought + unit,
        amountSpent: inputs.amountSpent,
        purchaseDate: inputs.purchaseDate,
        location: inputs.location,
        isAuto: item.isAuto,
        isManual: false
      });

      // Partial fulfillment
      const remaining = Math.max(0, toBuyNum - amountBoughtNum);
      nextUnpurchased[recipeIdx] = {
        ...item,
        toBuy: remaining > 0 ? `${remaining}${unit}` : "0"
      };
    });

    // Process Manual Items
    manualDrafts.forEach(d => {
      transactionTotal += parseInt(d.amountSpent) || 0;
      transactionItems.push({
        id: `manual-${Date.now()}-${d.tempId}`,
        itemId: "manual",
        name: d.name,
        toBuyLabel: "-",
        amountBought: d.amountBought,
        amountSpent: d.amountSpent,
        purchaseDate: d.purchaseDate,
        location: d.location,
        isAuto: false,
        isManual: true
      });
    });

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      name: transactionsName,
      totalSpent: transactionTotal.toLocaleString('id-ID'),
      receiptCount: 0,
      items: transactionItems
    };

    setTransactions([newTransaction, ...transactions]);
    setUnpurchasedItems(nextUnpurchased);
    
    // Reset Add state
    setTransactionsName("");
    setSelectedRecipeItems([]);
    setRecipeInputs({});
    setManualDrafts([]);
    setValidationError(null);
    
    setView('add_purchase_success');
  };

  if (view === 'unpurchased') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans">
        <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
          <button onClick={() => setView('main')} className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity">
            <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
            <span className="text-[17px] font-medium">Back</span>
          </button>
          <span className="text-[17px] font-semibold text-black">Check Unpurchased</span>
        </div>
        <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4">
          <div className="flex flex-col gap-4 mb-8">
            {unpurchasedItems.filter(item => {
               const val = parseInt(item.toBuy.replace(/[^0-9]/g, '')) || 0;
               return val > 0;
            }).map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-black">{item.name}</h3>
                    {item.isAuto ? <Bot size={20} className="text-[var(--color-ios-blue)]" /> : <Fingerprint size={20} className="text-[var(--color-ios-blue)]" />}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Merchant</label>
                    <div className="mt-1 bg-[var(--color-ios-gray-6)] rounded-lg py-1.5 px-3 inline-flex items-center gap-2 w-full justify-between">
                      <span className="text-[14px] font-medium text-black">{item.merchant}</span>
                      <ChevronLeft size={16} className="text-[var(--color-ios-gray-3)] rotate-[-90deg]" />
                    </div>
                  </div>
                  {item.isAuto && (
                    <>
                      <div>
                        <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Amount Needed</label>
                        <p className="text-[20px] font-light text-[var(--color-ios-gray-2)] mt-0.5">{item.amountNeeded}</p>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Current Inventory</label>
                        <p className="text-[20px] font-light text-[var(--color-ios-gray-2)] mt-0.5">{item.currentInventory}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">To Buy</label>
                    <p className="text-[20px] font-medium text-black mt-0.5">{item.toBuy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (view === 'history_receipts') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans">
        <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
          <button onClick={() => setView('main')} className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity">
            <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
            <span className="text-[17px] font-medium">Back</span>
          </button>
          <span className="text-[17px] font-semibold text-black">Check Purchase (per Receipt)</span>
        </div>

        <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4 pb-8">
          <div className="flex flex-col gap-4 mb-8">
            {transactions.length === 0 ? (
              <p className="text-center text-[var(--color-ios-gray-2)] mt-10">No transactions recorded yet.</p>
            ) : (
              transactions.map((tx) => {
                const isExpanded = expandedTransactions.includes(tx.id);
                return (
                  <div key={tx.id} className="bg-white rounded-[24px] overflow-hidden shadow-sm">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <h2 className="text-[22px] font-bold text-black">{tx.name}</h2>
                          <div className="flex items-center gap-1 bg-[#FFFBEB] px-2 py-1 rounded-md">
                             <AlertCircle size={14} className="text-[var(--color-ios-yellow)]" />
                             <span className="text-[10px] font-bold text-[var(--color-ios-yellow)] uppercase">Upload Receipt</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[var(--color-ios-gray-2)]">
                           <Trash2 size={20} className="text-red-400 cursor-pointer" />
                           <Edit2 size={20} className="text-[var(--color-ios-blue)] cursor-pointer" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-[12px] font-medium text-[var(--color-ios-gray-3)]">Amount Spent</label>
                          <p className="text-[20px] font-medium text-black mt-1">Rp{tx.totalSpent}</p>
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-[var(--color-ios-gray-3)]">Receipt Uploaded</label>
                          <p className="text-[20px] font-medium text-black mt-1">{tx.receiptCount}</p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button onClick={() => toggleExpand(tx.id)} className="text-[var(--color-ios-gray-3)]">
                           {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="flex gap-3 mt-4 border-t border-gray-100 pt-6">
                           <button className="flex-1 py-2.5 px-4 rounded-xl border-2 border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] font-bold text-[14px] flex items-center justify-center gap-2">
                             <ImageIcon size={18} /> Upload Receipt
                           </button>
                           <button className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-ios-gray-3)] text-white/50 font-bold text-[14px] flex items-center justify-center gap-2 cursor-not-allowed">
                             <Search size={18} /> View Receipt
                           </button>
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="bg-[#F2F2F7] p-4 flex flex-col gap-4 text-left">
                        {tx.items.map((item) => (
                          <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border-l-[3px] border-[var(--color-ios-blue)]">
                            <div className="flex items-center gap-2 mb-4">
                              <h3 className="text-xl font-bold text-black">{item.name}</h3>
                              {item.isManual && <span className="text-[10px] font-bold text-[var(--color-ios-blue)] border border-[var(--color-ios-blue)] px-1.5 py-0.5 rounded">Not Part of the Recipe</span>}
                              {!item.isManual && (item.isAuto ? <Bot size={20} className="text-[var(--color-ios-blue)]" /> : <Fingerprint size={20} className="text-[var(--color-ios-blue)]" />)}
                            </div>

                            <div className="flex flex-col mb-4">
                              <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">To Buy</label>
                              <p className="text-[20px] font-medium text-black/20 mt-0.5">{item.toBuyLabel}</p>
                              <div className="border-b border-dashed border-gray-200 mt-2 mb-4"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                              <div>
                                <label className="text-[11px] font-bold text-[var(--color-ios-gray-3)]">Amount Bought</label>
                                <p className="text-[16px] font-medium text-black mt-1">{item.amountBought}</p>
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-[var(--color-ios-gray-3)]">Amount Spent</label>
                                <p className="text-[16px] font-medium text-black mt-1">Rp{parseInt(item.amountSpent).toLocaleString('id-ID')}</p>
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-[var(--color-ios-gray-3)]">Purchase Date</label>
                                <p className="text-[16px] font-medium text-black mt-1">{item.purchaseDate}</p>
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-[var(--color-ios-gray-3)]">Location</label>
                                <div className="mt-1 bg-[var(--color-ios-gray-6)] rounded-lg py-1.5 px-3 flex items-center justify-between">
                                  <span className="text-[14px] font-medium text-black">{item.location}</span>
                                  <ChevronDown size={16} className="text-[var(--color-ios-gray-3)]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    );
  }

  if (view === 'add_purchase_success') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col items-center justify-center px-6 font-sans text-center">
        <div className="w-32 h-32 rounded-full border-[6px] border-[var(--color-ios-blue)] flex items-center justify-center mb-8">
          <Check size={64} className="text-[var(--color-ios-blue)]" strokeWidth={3} />
        </div>
        <h1 className="text-[28px] font-bold text-black mb-12 max-w-[280px] leading-tight mx-auto">
          Your New Purchase Has Successfully Added
        </h1>
        <div className="w-full max-w-sm mt-auto pb-12">
           <Button variant="primary" fullWidth onClick={() => setView('main')}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'add_purchase_list') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans">
        <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
          <button onClick={() => setView('main')} className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity">
            <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
            <span className="text-[17px] font-medium">Back</span>
          </button>
          <span className="text-[17px] font-semibold text-black">+ Add Purchase (per Receipt)</span>
        </div>

        <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4 pb-8 text-left">
          
          <div className="mb-6">
            <h3 className="text-[17px] font-bold text-black mb-3">Transactions Name</h3>
            <div className="relative">
              <input type="text" placeholder="Enter Transactions Name..." className={`w-full bg-white rounded-xl py-3.5 px-4 text-[16px] text-black outline-none placeholder:text-[var(--color-ios-gray-3)] ${validationError && !transactionsName ? 'border-2 border-red-500' : ''}`} value={transactionsName} onChange={(e) => { setTransactionsName(e.target.value); setValidationError(null); }} />
              {transactionsName && <button onClick={() => setTransactionsName("")} className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-[var(--color-ios-gray-3)] rounded-full flex items-center justify-center text-white"><X size={14} /></button>}
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            {unpurchasedItems.filter(i => {
               const val = parseInt(i.toBuy.replace(/[^0-9]/g, '')) || 0;
               return val > 0;
            }).map((item) => {
              const isSelected = selectedRecipeItems.includes(item.id);
              const inputs = recipeInputs[item.id] || { amountBought: "", amountSpent: "", purchaseDate: "", location: "" };
              return (
                <div key={item.id} className={`bg-white rounded-2xl p-5 shadow-sm transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xl font-bold text-black">{item.name}</h3>
                        {item.isAuto ? <Bot size={20} className="text-[var(--color-ios-blue)]" /> : <Fingerprint size={20} className="text-[var(--color-ios-blue)]" />}
                      </div>
                      <div className="flex flex-col">
                         <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">To Buy</label>
                         <p className={`text-[20px] font-medium mt-0.5 ${isSelected ? 'text-[var(--color-ios-gray-2)] border-b border-dashed border-[var(--color-ios-gray-3)] pb-2 mb-4' : 'text-[var(--color-ios-gray-2)]'}`}>{item.toBuy}</p>
                      </div>
                    </div>
                    <div onClick={() => handleToggleRecipeSelection(item.id)} className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-4 ${isSelected ? 'bg-[var(--color-ios-blue)] text-white' : 'border border-[var(--color-ios-gray-3)]'}`}>{isSelected && <Check size={16} strokeWidth={3} />}</div>
                  </div>
                  {isSelected && (
                    <div className="grid grid-cols-2 gap-y-5 gap-x-4 animate-in fade-in duration-300">
                      <div>
                        <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Amount Bought</label>
                        <input type="number" placeholder="Enter Amount Bought..." className="w-full mt-1 text-[14px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)]" value={inputs.amountBought} onChange={(e) => handleUpdateRecipeInput(item.id, 'amountBought', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Amount Spent</label>
                        <input type="number" placeholder="Enter Amount Spent..." className="w-full mt-1 text-[14px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)]" value={inputs.amountSpent} onChange={(e) => handleUpdateRecipeInput(item.id, 'amountSpent', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Purchase Date</label>
                        <input type="date" className="w-full mt-1 text-[14px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)] bg-transparent" value={inputs.purchaseDate} onChange={(e) => handleUpdateRecipeInput(item.id, 'purchaseDate', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Location</label>
                        <select className="w-full mt-1 bg-[var(--color-ios-gray-6)] rounded-lg py-1.5 px-2 text-[13px] font-medium text-black outline-none appearance-none" value={inputs.location} onChange={(e) => handleUpdateRecipeInput(item.id, 'location', e.target.value)}>
                          <option value="">Search</option>
                          <option value="Freezer No 1">Freezer No 1</option>
                          <option value="Kulkas Nomor 1">Kulkas Nomor 1</option>
                          <option value="Dry Storage">Dry Storage</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Manual Draft Cards */}
            {manualDrafts.map((draft) => (
              <div key={draft.tempId} className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[var(--color-ios-blue)]/20 animate-in slide-in-from-bottom duration-300 relative group">
                <button 
                  onClick={() => handleRemoveManualDraft(draft.tempId)}
                  className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={20} />
                </button>
                
                <input 
                  type="text"
                  placeholder="Item Name..."
                  className="text-2xl font-bold text-black border-none outline-none w-full placeholder:text-[var(--color-ios-gray-3)] mb-6 pr-8"
                  value={draft.name}
                  onChange={(e) => handleUpdateManualDraft(draft.tempId, 'name', e.target.value)}
                />

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Amount Bought</label>
                    <input type="number" placeholder="Enter Amount Bought..." className="w-full mt-1 text-[16px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)]" value={draft.amountBought} onChange={(e) => handleUpdateManualDraft(draft.tempId, 'amountBought', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Amount Spent</label>
                    <input type="number" placeholder="Enter Amount Spent..." className="w-full mt-1 text-[16px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)]" value={draft.amountSpent} onChange={(e) => handleUpdateManualDraft(draft.tempId, 'amountSpent', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Purchase Date</label>
                    <input type="date" className="w-full mt-1 text-[16px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)] bg-transparent" value={draft.purchaseDate} onChange={(e) => handleUpdateManualDraft(draft.tempId, 'purchaseDate', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Location</label>
                    <select className="w-full mt-1 border border-[var(--color-ios-gray-4)] rounded-xl py-3 px-3 text-[15px] font-medium text-black outline-none appearance-none bg-white" value={draft.location} onChange={(e) => handleUpdateManualDraft(draft.tempId, 'location', e.target.value)}>
                      <option value="" disabled>Search</option>
                      <option value="Freezer No 1">Freezer No 1</option>
                      <option value="Kulkas Nomor 1">Kulkas Nomor 1</option>
                      <option value="Dry Storage">Dry Storage</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(selectedRecipeItems.length === 0 && manualDrafts.length === 0) && (
             <p className="text-center text-[var(--color-ios-gray-2)] mt-4 mb-4">Select items to start this receipt.</p>
          )}

          {validationError && <div className="flex items-center gap-2 text-red-500 text-[13px] font-semibold mb-3 justify-center"><AlertCircle size={16} />{validationError}</div>}

          <button 
             disabled={selectedRecipeItems.length === 0 && manualDrafts.length === 0} 
             onClick={handlePerformPurchase} 
             className={`w-full py-4 rounded-full font-bold text-[17px] flex items-center justify-center gap-2 shadow-lg transition-all mb-4 ${
               (selectedRecipeItems.length > 0 || manualDrafts.length > 0) 
                 ? 'bg-[var(--color-ios-blue)] text-white active:scale-[0.98] active:shadow-md' 
                 : 'bg-[var(--color-ios-gray-4)] text-[var(--color-ios-gray-2)] cursor-not-allowed shadow-none'
             }`}
          >
            + Add Purchase (per Receipt)
          </button>

          <div className="bg-[#FFF4E5] rounded-xl p-3 mb-2 flex flex-col gap-1 items-start text-left">
            <span className="text-[12px] font-bold text-[#FF9800]">Note:</span>
            <p className="text-[11px] font-medium text-[#FF9800] leading-tight">Tombol ini hanya untuk barang yang tidak diperlukan untuk resep ini tapi berada di struk yang sama (misal beli gergaji). Untuk barang resep, mohon tambahkan di menu 'Review Shopping Lists'.</p>
          </div>
          <button onClick={handleAddManualDraft} className="w-full py-4 rounded-full font-semibold text-[17px] flex items-center justify-center gap-2 border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] hover:bg-[var(--color-ios-blue)]/5 transition-all">+ Add Item Manually</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-12">
      <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
        <button onClick={() => onBackToBatch(false)} className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity">
          <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
          <span className="text-[17px] font-medium">Back</span>
        </button>
      </div>

      <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-2">
        <h1 className="text-2xl font-bold text-center text-black mb-8">Receive Shopping Goods</h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={() => setView('unpurchased')} className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] aspect-[4/3] active:scale-[0.98] transition-all relative">
            {hasUnpurchased && <div className="absolute top-4 right-4 w-3 h-3 bg-[var(--color-ios-yellow)] rounded-full"></div>}
            <ClipboardList size={32} strokeWidth={1.5} className="text-[var(--color-ios-blue)]" />
            <span className="text-[13px] font-medium text-black text-center leading-tight">Check Unpurchased</span>
          </button>

          <button onClick={() => { setValidationError(null); setView('add_purchase_list'); }} className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] aspect-[4/3] active:scale-[0.98] transition-all">
             <div className="relative">
               <ReceiptText size={32} strokeWidth={1.5} className="text-[var(--color-ios-blue)]" />
               <div className="absolute -bottom-1 -right-1 bg-white rounded-full"><span className="text-[var(--color-ios-blue)] font-bold text-[18px] leading-none">+</span></div>
             </div>
             <span className="text-[13px] font-medium text-black text-center leading-tight">+ Add Purchase<br/>(per Receipt)</span>
          </button>

          <button onClick={() => setView('history_receipts')} className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] aspect-[4/3] active:scale-[0.98] transition-all">
             <ReceiptText size={32} strokeWidth={1.5} className="text-[var(--color-ios-blue)]" />
             <span className="text-[13px] font-medium text-black text-center leading-tight">Check Purchase<br/>(per Receipt)</span>
          </button>
        </div>

        <button 
          disabled={!isAllRecipeDone}
          onClick={() => onBackToBatch(true)}
          className={`w-full py-4 rounded-[1.25rem] font-semibold text-[17px] flex items-center justify-center gap-2 transition-all ${
            isAllRecipeDone 
              ? 'bg-[var(--color-ios-blue)] text-white active:scale-[0.98]' 
              : 'bg-[#B4B4B8] text-black/30 cursor-not-allowed'
          }`}
        >
          Complete Task
        </button>
      </main>
    </div>
  );
}
