"use client";

import { useState } from "react";
import { ChevronLeft, ClipboardList, ClipboardCheck, ReceiptText, Bot, Fingerprint, Save, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UnpurchasedItem {
  id: string;
  name: string;
  merchant: string;
  amountNeeded?: string;
  currentInventory?: string;
  toBuy: string;
  isAuto: boolean;
  // Fields for tracking purchase inputs
  amountBought?: string;
  amountSpent?: string;
  purchaseDate?: string;
  location?: string;
}

interface ReceiveShoppingGoodsFlowProps {
  onBackToBatch: (completed: boolean) => void;
  isCompleted?: boolean;
}

export default function ReceiveShoppingGoodsFlow({ onBackToBatch, isCompleted }: ReceiveShoppingGoodsFlowProps) {
  const [view, setView] = useState<'main' | 'unpurchased' | 'purchased' | 'add_purchase_list' | 'add_purchase_success'>('main');

  // Hardcoded unpurchased data replicating Review Shopping List data per user spec
  const [unpurchasedItems, setItems] = useState<UnpurchasedItem[]>([
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
      toBuy: "-", // Technically sufficient, but replicating design
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

  const [purchasedItems, setPurchasedItems] = useState<UnpurchasedItem[]>([]);

  // State for the Add Purchase form
  const [transactionsName, setTransactionsName] = useState("");
  const [selectedItemsForPurchase, setSelectedItemsForPurchase] = useState<string[]>([]);
  // We will store the active edit values for items being purchased here
  const [purchaseInputs, setPurchaseInputs] = useState<Record<string, {
    amountBought: string;
    amountSpent: string;
    purchaseDate: string;
    location: string;
  }>>({});

  const hasUnpurchased = unpurchasedItems.length > 0;

  const handleToggleSelection = (id: string) => {
    setSelectedItemsForPurchase(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    // Initialize empty inputs when selecting
    if (!selectedItemsForPurchase.includes(id)) {
      setPurchaseInputs(prev => ({
        ...prev,
        [id]: { amountBought: "", amountSpent: "", purchaseDate: "", location: "" }
      }));
    }
  };

  const handleUpdateInput = (id: string, field: string, value: string) => {
    setPurchaseInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handlePerformPurchase = () => {
    // Process selected items
    const newPurchased: UnpurchasedItem[] = [];
    const remainingUnpurchased: UnpurchasedItem[] = [];

    unpurchasedItems.forEach(item => {
      if (selectedItemsForPurchase.includes(item.id)) {
        const inputs = purchaseInputs[item.id];
        const boughtQty = parseInt(inputs.amountBought) || 0;
        const targetQty = parseInt(item.toBuy.replace('gr', '')) || 0;

        // Add to purchased list with input data
        newPurchased.push({
          ...item,
          amountBought: inputs.amountBought,
          amountSpent: inputs.amountSpent,
          purchaseDate: inputs.purchaseDate,
          location: inputs.location
        });

        // Check for partial fulfillment
        if (boughtQty < targetQty) {
          remainingUnpurchased.push({
            ...item,
            toBuy: `${targetQty - boughtQty}gr` // Update remaining to buy
          });
        }
      } else {
        remainingUnpurchased.push(item);
      }
    });

    setPurchasedItems([...purchasedItems, ...newPurchased]);
    setItems(remainingUnpurchased);
    
    // Reset Add flow state
    setTransactionsName("");
    setSelectedItemsForPurchase([]);
    setPurchaseInputs({});
    
    setView('add_purchase_success');
  };

  if (view === 'unpurchased') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans">
        <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
          <button 
            onClick={() => setView('main')}
            className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
          >
            <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
            <span className="text-[17px] font-medium">Back</span>
          </button>
          <span className="text-[17px] font-semibold text-black">Check Unpurchased</span>
        </div>

        <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4">
          <div className="flex flex-col gap-4 mb-8">
            {unpurchasedItems.filter(item => item.toBuy !== "-" && item.toBuy !== "0" && item.toBuy !== "0gr").map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between flex-start mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-black">{item.name}</h3>
                    {item.isAuto ? (
                      <Bot size={20} className="text-[var(--color-ios-blue)]" />
                    ) : (
                      <Fingerprint size={20} className="text-[var(--color-ios-blue)]" />
                    )}
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

  if (view === 'purchased') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans">
        <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
          <button 
            onClick={() => setView('main')}
            className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
          >
            <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
            <span className="text-[17px] font-medium">Back</span>
          </button>
          <span className="text-[17px] font-semibold text-black">Check Purchased</span>
        </div>

        <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4">
          <div className="flex flex-col gap-4 mb-8">
            {purchasedItems.length === 0 ? (
              <p className="text-center text-[var(--color-ios-gray-2)] mt-10">No items purchased yet.</p>
            ) : (
              purchasedItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between flex-start mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-black">{item.name}</h3>
                      {item.isAuto ? (
                        <Bot size={20} className="text-[var(--color-ios-blue)]" />
                      ) : (
                        <Fingerprint size={20} className="text-[var(--color-ios-blue)]" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <div>
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">To Buy</label>
                      <p className="text-[20px] font-light text-[var(--color-ios-gray-2)] mt-0.5 border-b border-dashed border-[var(--color-ios-gray-3)] pb-2">{item.toBuy}</p>
                    </div>
                    <div className="col-start-1">
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Amount Bought</label>
                      <p className="text-[16px] font-medium text-black mt-1">{item.amountBought}gr</p>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Amount Spent</label>
                      <p className="text-[16px] font-medium text-black mt-1">Rp{item.amountSpent}</p>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Purchase Date</label>
                      <p className="text-[16px] font-medium text-black mt-1">{item.purchaseDate}</p>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Location</label>
                      <div className="mt-1 bg-[var(--color-ios-gray-6)] rounded-lg py-1.5 px-3 inline-flex items-center gap-2 w-full justify-between">
                        <span className="text-[14px] font-medium text-black">{item.location}</span>
                        <ChevronLeft size={16} className="text-[var(--color-ios-gray-3)] rotate-[-90deg]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    );
  }

  if (view === 'add_purchase_success') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col items-center justify-center px-6 font-sans">
        <div className="w-32 h-32 rounded-full border-[6px] border-[var(--color-ios-blue)] flex items-center justify-center mb-8">
          <Check size={64} className="text-[var(--color-ios-blue)]" strokeWidth={3} />
        </div>
        <h1 className="text-[28px] font-bold text-black text-center mb-12 max-w-[280px] leading-tight">
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
          <button 
            onClick={() => setView('main')}
            className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
          >
            <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
            <span className="text-[17px] font-medium">Back</span>
          </button>
          <span className="text-[17px] font-semibold text-black">+ Add Purchase (per Receipt)</span>
        </div>

        <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4 pb-8">
          
          <div className="mb-6">
            <h3 className="text-[17px] font-bold text-black mb-3">Transactions Name</h3>
            <div className="relative">
              <input 
                type="text"
                placeholder="Enter Transactions Name..."
                className="w-full bg-white rounded-xl py-3.5 px-4 text-[16px] text-black outline-none placeholder:text-[var(--color-ios-gray-3)]"
                value={transactionsName}
                onChange={(e) => setTransactionsName(e.target.value)}
              />
              {transactionsName && (
                <button 
                  onClick={() => setTransactionsName("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-[var(--color-ios-gray-3)] rounded-full flex items-center justify-center text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-8">
            {unpurchasedItems.length === 0 ? (
              <p className="text-center text-[var(--color-ios-gray-2)] mt-4">All items have been purchased.</p>
            ) : (
              unpurchasedItems.filter(item => item.toBuy !== "-" && item.toBuy !== "0" && item.toBuy !== "0gr").map((item) => {
                const isSelected = selectedItemsForPurchase.includes(item.id);
                const inputs = purchaseInputs[item.id] || { amountBought: "", amountSpent: "", purchaseDate: "", location: "" };

                return (
                  <div key={item.id} className={`bg-white rounded-2xl p-5 shadow-sm transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-xl font-bold text-black">{item.name}</h3>
                          {item.isAuto ? (
                            <Bot size={20} className="text-[var(--color-ios-blue)]" />
                          ) : (
                            <Fingerprint size={20} className="text-[var(--color-ios-blue)]" />
                          )}
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">To Buy</label>
                          <p className={`text-[20px] font-medium mt-0.5 ${isSelected ? 'text-[var(--color-ios-gray-2)] border-b border-dashed border-[var(--color-ios-gray-3)] pb-2 mb-4' : 'text-[var(--color-ios-gray-2)]'}`}>
                            {item.toBuy}
                          </p>
                        </div>
                      </div>
                      
                      {/* Checkbox */}
                      <div 
                        onClick={() => handleToggleSelection(item.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                          isSelected ? 'bg-[var(--color-ios-blue)] text-white' : 'border border-[var(--color-ios-gray-3)]'
                        }`}
                      >
                        {isSelected && <Check size={16} strokeWidth={3} />}
                      </div>
                    </div>

                    {/* Expandable Form details if selected */}
                    {isSelected && (
                      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                        <div>
                          <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Amount Bought</label>
                          <input 
                            type="number"
                            placeholder="Enter Amount Bought..."
                            className="w-full mt-1 text-[14px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)]"
                            value={inputs.amountBought}
                            onChange={(e) => handleUpdateInput(item.id, 'amountBought', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Amount Spent</label>
                          <input 
                            type="number"
                            placeholder="Enter Amount Spent..."
                            className="w-full mt-1 text-[14px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)]"
                            value={inputs.amountSpent}
                            onChange={(e) => handleUpdateInput(item.id, 'amountSpent', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Purchase Date</label>
                          <input 
                            type="date"
                            className="w-full mt-1 text-[14px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)] bg-transparent"
                            value={inputs.purchaseDate}
                            onChange={(e) => handleUpdateInput(item.id, 'purchaseDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Location</label>
                          <select 
                            className="w-full mt-1 bg-[var(--color-ios-gray-6)] rounded-lg py-1.5 px-2 text-[13px] font-medium text-black outline-none appearance-none"
                            value={inputs.location}
                            onChange={(e) => handleUpdateInput(item.id, 'location', e.target.value)}
                          >
                            <option value="" disabled>Search</option>
                            <option value="Freezer No 1">Freezer No 1</option>
                            <option value="Kulkas Nomor 1">Kulkas Nomor 1</option>
                            <option value="Dry Storage">Dry Storage</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          <button 
             disabled={selectedItemsForPurchase.length === 0}
             onClick={handlePerformPurchase}
             className={`w-full py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 border transition-all mb-4 ${
               selectedItemsForPurchase.length > 0 
                 ? 'border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] hover:bg-[var(--color-ios-blue)]/5 cursor-pointer' 
                 : 'border-[var(--color-ios-gray-3)] text-[var(--color-ios-gray-3)] cursor-not-allowed border-none bg-transparent' // In design it's wrapped in border when inactive, let's stick to border
             }`}
             style={selectedItemsForPurchase.length === 0 ? { border: '1px solid var(--color-ios-gray-3)' } : {}}
          >
            + Add Purchase (per Receipt)
          </button>

          {/* Add Item Manually (Note Included) */}
          <div className="bg-[#FFF4E5] rounded-xl p-3 mb-2 flex flex-col gap-1 items-start text-left">
            <span className="text-[12px] font-bold text-[#FF9800]">Note:</span>
            <p className="text-[11px] font-medium text-[#FF9800] leading-tight">
              Tombol ini hanya untuk barang yang tidak diperlukan untuk resep ini tapi berada di struk yang sama (misal beli gergaji). Untuk barang resep, mohon tambahkan di menu 'Review Shopping Lists'.
            </p>
          </div>
          <button 
             onClick={() => setView('add_purchase_list')} // In a full app, this would route to the manual input form described in #5
             className="w-full py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] hover:bg-[var(--color-ios-blue)]/5 transition-all"
          >
            + Add Item Manually
          </button>

        </main>
      </div>
    );
  }

  // view === 'main'
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
      </div>

      <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-2">
        <h1 className="text-2xl font-bold text-center text-black mb-8">Receive Shopping Goods</h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Check Unpurchased */}
          <button 
            onClick={() => setView('unpurchased')}
            className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] aspect-[4/3] active:scale-[0.98] transition-all relative"
          >
            {hasUnpurchased && (
              <div className="absolute top-3 right-3 w-3 h-3 bg-[var(--color-ios-yellow)] rounded-full"></div>
            )}
            <ClipboardList size={32} strokeWidth={1.5} className="text-[var(--color-ios-blue)]" />
            <span className="text-[13px] font-medium text-black text-center leading-tight">Check Unpurchased</span>
          </button>

          {/* Check Purchased */}
          <button 
            onClick={() => setView('purchased')}
            className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] aspect-[4/3] active:scale-[0.98] transition-all"
          >
             <ClipboardCheck size={32} strokeWidth={1.5} className="text-[var(--color-ios-blue)]" />
             <span className="text-[13px] font-medium text-black text-center leading-tight">Check Purchased</span>
          </button>

          {/* Add Purchase (per Receipt) */}
          <button 
            onClick={() => setView('add_purchase_list')}
            className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] aspect-[4/3] active:scale-[0.98] transition-all"
          >
             <div className="relative">
               <ReceiptText size={32} strokeWidth={1.5} className="text-[var(--color-ios-blue)]" />
               <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                 <span className="text-[var(--color-ios-blue)] font-bold text-[18px] leading-none">+</span>
               </div>
             </div>
             <span className="text-[13px] font-medium text-black text-center leading-tight">+ Add Purchase<br/>(per Receipt)</span>
          </button>

          {/* Check Purchase (per Receipt) */}
          <button className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] aspect-[4/3] active:scale-[0.98] transition-all">
             <ReceiptText size={32} strokeWidth={1.5} className="text-[var(--color-ios-blue)]" />
             <span className="text-[13px] font-medium text-black text-center leading-tight">Check Purchase<br/>(per Receipt)</span>
          </button>
        </div>

        <button disabled className="w-full py-4 rounded-[1.25rem] font-semibold text-[17px] flex items-center justify-center gap-2 bg-[#B4B4B8] text-black/30 cursor-not-allowed">
          Complete Task
        </button>
      </main>
    </div>
  );
}
