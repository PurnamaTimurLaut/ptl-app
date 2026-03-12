"use client";

import { useState } from "react";
import { ChevronLeft, ClipboardList, ClipboardCheck, ReceiptText, Bot, Fingerprint, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UnpurchasedItem {
  id: string;
  name: string;
  merchant: string;
  amountNeeded?: string;
  currentInventory?: string;
  toBuy: string;
  isAuto: boolean;
  isManual?: boolean;
  // Fields for tracking purchase inputs
  amountBought?: string;
  amountSpent?: string;
  purchaseDate?: string;
  location?: string;
  transactionName?: string;
}

interface ReceiveShoppingGoodsFlowProps {
  onBackToBatch: (completed: boolean) => void;
  isCompleted?: boolean;
}

function groupPurchasedByTransaction(items: UnpurchasedItem[]) {
  const groups: Record<string, UnpurchasedItem[]> = {};
  items.forEach(item => {
    const key = item.transactionName || "Unknown Transaction";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

export default function ReceiveShoppingGoodsFlow({ onBackToBatch, isCompleted }: ReceiveShoppingGoodsFlowProps) {
  const [view, setView] = useState<'main' | 'unpurchased' | 'purchased' | 'add_purchase_list' | 'add_item_manual' | 'add_purchase_success'>('main');

  // Hardcoded unpurchased data
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
      toBuy: "-", // Technically sufficient
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
  const [manualItems, setManualItems] = useState<UnpurchasedItem[]>([]);

  // State for the Add Purchase form
  const [transactionsName, setTransactionsName] = useState("");
  const [selectedItemsForPurchase, setSelectedItemsForPurchase] = useState<string[]>([]);
  const [purchaseInputs, setPurchaseInputs] = useState<Record<string, {
    amountBought: string;
    amountSpent: string;
    purchaseDate: string;
    location: string;
  }>>({});

  // Manual Item Form State
  const [manualForm, setManualForm] = useState({
    name: "",
    amountBought: "",
    amountSpent: "",
    purchaseDate: "",
    location: ""
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Logic for yellow dot: true if any item has "toBuy" that is not "-" or "0"
  const hasUnpurchased = unpurchasedItems.some(item => 
    item.toBuy !== "-" && item.toBuy !== "0" && item.toBuy !== "0gr"
  );

  const handleToggleSelection = (id: string) => {
    setValidationError(null);
    setSelectedItemsForPurchase(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    // Initialize empty inputs when selecting if not already there
    if (!selectedItemsForPurchase.includes(id) && !purchaseInputs[id]) {
      setPurchaseInputs(prev => ({
        ...prev,
        [id]: { amountBought: "", amountSpent: "", purchaseDate: "", location: "" }
      }));
    }
  };

  const handleUpdateInput = (id: string, field: string, value: string) => {
    setValidationError(null);
    setPurchaseInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleAddManualItem = () => {
    if (!manualForm.name) return;
    
    const newItem: UnpurchasedItem = {
      id: `manual-${Date.now()}`,
      name: manualForm.name,
      merchant: manualForm.location || "Manual Entry",
      toBuy: "N/A",
      isAuto: false,
      isManual: true,
    };

    setManualItems(prev => [...prev, newItem]);
    
    // Auto-select for purchase list? Maybe just add to the list and let user select.
    // The request says "Every item that are added manually, will automatically added to the rest of the item in the '+Add Purchase (per receipt)' menu"
    
    // Also initialize the inputs if they were filled in the manual form
    setPurchaseInputs(prev => ({
      ...prev,
      [newItem.id]: {
        amountBought: manualForm.amountBought,
        amountSpent: manualForm.amountSpent,
        purchaseDate: manualForm.purchaseDate,
        location: manualForm.location
      }
    }));

    // Reset manual form
    setManualForm({ name: "", amountBought: "", amountSpent: "", purchaseDate: "", location: "" });
    setView('add_purchase_list');
  };

  const handlePerformPurchase = () => {
    // Validation
    if (!transactionsName.trim()) {
      setValidationError("Transactions Name is required");
      return;
    }

    if (selectedItemsForPurchase.length === 0) {
      setValidationError("Please select at least one item to purchase");
      return;
    }

    // Check if every selected item has all fields filled
    const allFilled = selectedItemsForPurchase.every(id => {
      const inputs = purchaseInputs[id];
      return inputs && inputs.amountBought && inputs.amountSpent && inputs.purchaseDate && inputs.location;
    });

    if (!allFilled) {
      setValidationError("Fill the required form to proceed");
      return;
    }

    // Process selected items
    const newPurchasedEntries: UnpurchasedItem[] = [];
    const remainingUnpurchased: UnpurchasedItem[] = [];
    const remainingManual: UnpurchasedItem[] = [];

    // Process recipe items
    unpurchasedItems.forEach(item => {
      if (selectedItemsForPurchase.includes(item.id)) {
        const inputs = purchaseInputs[item.id];
        newPurchasedEntries.push({
          ...item,
          amountBought: inputs.amountBought,
          amountSpent: inputs.amountSpent,
          purchaseDate: inputs.purchaseDate,
          location: inputs.location,
          transactionName: transactionsName
        });
      } else {
        remainingUnpurchased.push(item);
      }
    });

    // Process manual items
    manualItems.forEach(item => {
      if (selectedItemsForPurchase.includes(item.id)) {
        const inputs = purchaseInputs[item.id];
        newPurchasedEntries.push({
          ...item,
          amountBought: inputs.amountBought,
          amountSpent: inputs.amountSpent,
          purchaseDate: inputs.purchaseDate,
          location: inputs.location,
          transactionName: transactionsName
        });
      } else {
        remainingManual.push(item);
      }
    });

    setPurchasedItems([...purchasedItems, ...newPurchasedEntries]);
    setItems(remainingUnpurchased);
    setManualItems(remainingManual);
    
    // Reset Add flow state
    setTransactionsName("");
    setSelectedItemsForPurchase([]);
    setPurchaseInputs({});
    setValidationError(null);
    
    setView('add_purchase_success');
  };

  const allAvailableItemsForPurchase = [...unpurchasedItems.filter(item => item.toBuy !== "-" && item.toBuy !== "0" && item.toBuy !== "0gr"), ...manualItems];

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
    const grouped = groupPurchasedByTransaction(purchasedItems);
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
          <div className="flex flex-col gap-8 mb-8">
            {purchasedItems.length === 0 ? (
              <p className="text-center text-[var(--color-ios-gray-2)] mt-10">No items purchased yet.</p>
            ) : (
              Object.entries(grouped).map(([txName, items]) => (
                <div key={txName} className="flex flex-col gap-4">
                  <h2 className="text-[18px] font-bold text-black px-2 flex items-center gap-2">
                    <ReceiptText size={20} className="text-[var(--color-ios-blue)]" />
                    {txName}
                  </h2>
                  <div className="flex flex-col gap-4 pl-2 border-l-2 border-[var(--color-ios-blue)]/20 ml-2">
                    {items.map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex justify-between flex-start mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-black">{item.name}</h3>
                            {item.isManual && <span className="text-[10px] font-bold text-[var(--color-ios-blue)] border border-[var(--color-ios-blue)] px-1.5 py-0.5 rounded">Not Part of the Recipe</span>}
                            {!item.isManual && (item.isAuto ? (
                              <Bot size={20} className="text-[var(--color-ios-blue)]" />
                            ) : (
                              <Fingerprint size={20} className="text-[var(--color-ios-blue)]" />
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                          {!item.isManual && (
                            <div>
                              <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">To Buy</label>
                              <p className="text-[20px] font-light text-[var(--color-ios-gray-2)] mt-0.5 border-b border-dashed border-[var(--color-ios-gray-3)] pb-2">{item.toBuy}</p>
                            </div>
                          )}
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
                            <p className="text-[16px] font-medium text-black mt-1">{item.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    );
  }

  if (view === 'add_item_manual') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans">
        <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
          <button 
            onClick={() => setView('add_purchase_list')}
            className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
          >
            <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
            <span className="text-[17px] font-medium">Back</span>
          </button>
          <span className="text-[17px] font-semibold text-black">+ Add Item Manually</span>
        </div>

        <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4 pb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <input 
              type="text"
              placeholder="Item Name..."
              className="text-2xl font-bold text-black border-none outline-none w-full placeholder:text-[var(--color-ios-gray-3)] mb-6"
              value={manualForm.name}
              onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Amount Bought</label>
                <input 
                  type="number"
                  placeholder="Enter Amount Bought..."
                  className="w-full mt-1 text-[16px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)]"
                  value={manualForm.amountBought}
                  onChange={(e) => setManualForm({...manualForm, amountBought: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Amount Spent</label>
                <input 
                  type="number"
                  placeholder="Enter Amount Spent..."
                  className="w-full mt-1 text-[16px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)]"
                  value={manualForm.amountSpent}
                  onChange={(e) => setManualForm({...manualForm, amountSpent: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Purchase Date</label>
                <input 
                  type="date"
                  className="w-full mt-1 text-[16px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-3)] bg-transparent"
                  value={manualForm.purchaseDate}
                  onChange={(e) => setManualForm({...manualForm, purchaseDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">Location</label>
                <select 
                  className="w-full mt-1 border border-[var(--color-ios-gray-4)] rounded-xl py-3 px-3 text-[15px] font-medium text-black outline-none appearance-none bg-white"
                  value={manualForm.location}
                  onChange={(e) => setManualForm({...manualForm, location: e.target.value})}
                >
                  <option value="" disabled>Search</option>
                  <option value="Freezer No 1">Freezer No 1</option>
                  <option value="Kulkas Nomor 1">Kulkas Nomor 1</option>
                  <option value="Dry Storage">Dry Storage</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            disabled={!manualForm.name}
            onClick={handleAddManualItem}
            className={`w-full py-4 rounded-full font-semibold text-[17px] flex items-center justify-center gap-2 border transition-all ${
              manualForm.name 
                ? 'border-[var(--color-ios-gray-2)] text-[var(--color-ios-gray-2)] active:scale-[0.98]' 
                : 'border-[var(--color-ios-gray-3)] text-[var(--color-ios-gray-3)] cursor-not-allowed'
            }`}
          >
            + Add Item to Receipt
          </button>
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
                className={`w-full bg-white rounded-xl py-3.5 px-4 text-[16px] text-black outline-none placeholder:text-[var(--color-ios-gray-3)] ${validationError && !transactionsName ? 'border-2 border-red-500' : ''}`}
                value={transactionsName}
                onChange={(e) => {
                  setTransactionsName(e.target.value);
                  setValidationError(null);
                }}
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
            {allAvailableItemsForPurchase.length === 0 ? (
              <p className="text-center text-[var(--color-ios-gray-2)] mt-4">All items have been purchased.</p>
            ) : (
              allAvailableItemsForPurchase.map((item) => {
                const isSelected = selectedItemsForPurchase.includes(item.id);
                const inputs = purchaseInputs[item.id] || { amountBought: "", amountSpent: "", purchaseDate: "", location: "" };

                return (
                  <div key={item.id} className={`bg-white rounded-2xl p-5 shadow-sm transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-xl font-bold text-black">{item.name}</h3>
                          {item.isManual && <span className="text-[9px] font-bold text-[var(--color-ios-blue)] border border-[var(--color-ios-blue)] px-1 py-0.5 rounded whitespace-nowrap">Not Part of the Recipe</span>}
                          {!item.isManual && (item.isAuto ? (
                            <Bot size={20} className="text-[var(--color-ios-blue)]" />
                          ) : (
                            <Fingerprint size={20} className="text-[var(--color-ios-blue)]" />
                          ))}
                        </div>
                        {!item.isManual && (
                          <div>
                            <label className="text-[11px] font-medium text-[var(--color-ios-gray-3)]">To Buy</label>
                            <p className={`text-[20px] font-medium mt-0.5 ${isSelected ? 'text-[var(--color-ios-gray-2)] border-b border-dashed border-[var(--color-ios-gray-3)] pb-2 mb-4' : 'text-[var(--color-ios-gray-2)]'}`}>
                              {item.toBuy}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Checkbox */}
                      <div 
                        onClick={() => handleToggleSelection(item.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-4 ${
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
              })
            )}
          </div>
          
          {validationError && (
            <div className="flex items-center gap-2 text-red-500 text-[13px] font-semibold mb-3 justify-center">
              <AlertCircle size={16} />
              {validationError}
            </div>
          )}

          <button 
             disabled={selectedItemsForPurchase.length === 0}
             onClick={handlePerformPurchase}
             className={`w-full py-4 rounded-full font-bold text-[17px] flex items-center justify-center gap-2 shadow-lg transition-all mb-4 ${
               selectedItemsForPurchase.length > 0 
                 ? 'bg-[var(--color-ios-blue)] text-white active:scale-[0.98] active:shadow-md' 
                 : 'bg-[var(--color-ios-gray-4)] text-[var(--color-ios-gray-2)] cursor-not-allowed shadow-none'
             }`}
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
             onClick={() => setView('add_item_manual')}
             className="w-full py-4 rounded-full font-semibold text-[17px] flex items-center justify-center gap-2 border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] hover:bg-[var(--color-ios-blue)]/5 transition-all"
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
              <div className="absolute top-4 right-4 w-3 h-3 bg-[var(--color-ios-yellow)] rounded-full"></div>
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
            onClick={() => {
              setValidationError(null);
              setView('add_purchase_list');
            }}
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
