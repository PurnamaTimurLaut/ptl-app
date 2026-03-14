import { useState, useEffect } from "react";
import { ChevronLeft, FileEdit, ArrowRightLeft, ShoppingBasket, HelpCircle, ClipboardList, Settings, Search, AlertTriangle, ChevronDown, XCircle, Tag, Trash2, X, Plus, Loader2 } from "lucide-react";
import { getInventoryItem, adjustStock, moveStock, buyStock, assignStock, updateItemSettings, deleteContainer, addContainer, deleteInventoryItem } from "@/app/actions/inventory";

interface InventoryDetailScreenProps {
  itemId: string;
  onBack: () => void;
}

export default function InventoryDetailScreen({ itemId, onBack }: InventoryDetailScreenProps) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await getInventoryItem(itemId);
      setItem(data);
      setSettingName(data.name);
      setSettingUnit(data.unit);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjContainer, setAdjContainer] = useState("");
  const [adjType, setAdjType] = useState<"add" | "subtract">("add");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [adjNotes, setAdjNotes] = useState("");

  const handleConfirmAdjustment = async () => {
    try {
      // Find container ID by name
      const allContainers = [...item.activeStock.containers, ...item.reserveStock.cabinets];
      const selectedContainer = allContainers.find(c => c.name === adjContainer);
      if (!selectedContainer) return;
      
      await adjustStock(itemId, selectedContainer.id, adjType, parseFloat(adjAmount), adjReason, adjNotes);
      setShowAdjustment(false);
      setAdjContainer(""); setAdjAmount(""); setAdjReason(""); setAdjNotes("");
      await loadItem();
    } catch (e) {
      alert("Error adjusting stock");
    }
  };

  const [showMove, setShowMove] = useState(false);
  const [moveFrom, setMoveFrom] = useState("");
  const [moveTo, setMoveTo] = useState("");
  const [moveAmount, setMoveAmount] = useState("");
  
  const handleMoveStock = async () => {
    try {
      await moveStock(itemId, moveFrom, moveTo, parseFloat(moveAmount));
      setShowMove(false);
      setMoveFrom(""); setMoveTo(""); setMoveAmount("");
      await loadItem();
    } catch (e) {
      alert("Error moving stock");
    }
  };

  const [showBuy, setShowBuy] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyTo, setBuyTo] = useState("");

  const handleBuyStock = async () => {
    try {
      await buyStock(itemId, parseFloat(buyAmount), parseFloat(buyPrice), buyTo);
      setShowBuy(false);
      setBuyAmount(""); setBuyPrice(""); setBuyTo("");
      await loadItem();
    } catch (e) {
      alert("Error buying stock");
    }
  };

  const [showAssign, setShowAssign] = useState(false);
  const [assignSelectedId, setAssignSelectedId] = useState<string | null>(null);
  const [assignToContainer, setAssignToContainer] = useState("");

  const handleAssignStock = async () => {
    if (!assignSelectedId) return;
    try {
      await assignStock(itemId, assignSelectedId, assignToContainer);
      setAssignSelectedId(null);
      setAssignToContainer("");
      setShowAssign(false);
      await loadItem();
    } catch (e) {
      alert("Error assigning stock");
    }
  };

  const [showLog, setShowLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [settingName, setSettingName] = useState("");
  const [settingUnit, setSettingUnit] = useState("");
  const [settingNewContainerName, setSettingNewContainerName] = useState("");
  const [settingNewContainerType, setSettingNewContainerType] = useState<"ACTIVE"|"RESERVE">("ACTIVE");

  const handleSaveSettings = async () => {
    try {
      await updateItemSettings(itemId, settingName, settingUnit);
      setShowSettings(false);
      await loadItem();
    } catch (e) {
      alert("Error updating settings");
    }
  };

  const handleDeleteItem = async () => {
    try {
      await deleteInventoryItem(itemId);
      setShowDeleteConfirm(false);
      onBack(); // Return to inventory list
    } catch (e) {
      alert("Error deleting item");
    }
  };

  const handleDeleteContainer = async (containerId: string) => {
    if (confirm("Are you sure you want to delete this container?")) {
      await deleteContainer(containerId);
      await loadItem();
    }
  };

  const handleAddContainer = async () => {
    if (!settingNewContainerName) return;
    await addContainer(itemId, settingNewContainerName, settingNewContainerType);
    setSettingNewContainerName("");
    await loadItem();
  };

  const actionButtons = [
    { id: "adjustment", label: "Stock Adjustment", icon: FileEdit, badge: false },
    { id: "move", label: "Move Stock", icon: ArrowRightLeft, badge: false },
    { id: "buy", label: "Buy Stock", icon: ShoppingBasket, badge: false },
    { id: "assign", label: "Assign Stock", icon: HelpCircle, badge: item?.unassignedContainers?.length > 0 },
    { id: "log", label: "Stock Log", icon: ClipboardList, badge: false },
    { id: "setting", label: "Item Setting", icon: Settings, badge: false },
  ];

  // ------- ADJUSTMENT OVERLAY -------
  if (showAdjustment) {
    const isFormValid = adjContainer.length > 0 && adjAmount.length > 0 && adjReason.length > 0;

    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full">
          <button onClick={() => setShowAdjustment(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity w-20">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
          <h1 className="text-[17px] font-semibold text-center text-black flex-1 px-2 whitespace-nowrap">Stock Adjustment</h1>
          <div className="w-20"></div>{/* Spacer */}
        </div>
        
        <div className="px-6 pb-32 w-full flex-1 flex flex-col pt-4">
          
          {/* Container */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">Container</label>
            <div className="relative">
              <select 
                value={adjContainer}
                onChange={(e) => setAdjContainer(e.target.value)}
                className="w-full bg-white text-black text-[17px] rounded-xl py-3.5 pl-4 pr-10 appearance-none outline-none shadow-sm"
              >
                <option value="" disabled className="text-[var(--color-ios-gray-2)]">Search</option>
                {item?.activeStock?.containers.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name} ({c.amount}{item.unit})</option>
                ))}
                {item?.reserveStock?.cabinets.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name} ({c.amount}{item.unit})</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="text-[var(--color-ios-gray-3)]" size={20} />
              </div>
            </div>
          </div>

          {/* Add / Subtract Segmented */}
          <div className="bg-[#E5E5EA] rounded-[10px] p-1 flex mb-6 shadow-sm">
            <button
              onClick={() => setAdjType("add")}
              className={`flex-1 py-1.5 text-[15px] font-semibold rounded-md transition-all ${
                adjType === "add" ? "bg-white text-black shadow-sm" : "text-black"
              }`}
            >
              + Add
            </button>
            <button
              onClick={() => setAdjType("subtract")}
              className={`flex-1 py-1.5 text-[15px] font-semibold rounded-md transition-all ${
                adjType === "subtract" ? "bg-white text-black shadow-sm" : "text-black"
              }`}
            >
              - Subtract
            </button>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">Amount</label>
            <div className="relative flex items-center bg-white rounded-xl shadow-sm">
              <input
                type="number"
                placeholder="Enter Amount..."
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
                className="w-full bg-transparent text-black placeholder:text-[var(--color-ios-gray-2)] text-[17px] py-3.5 pl-4 pr-10 outline-none rounded-xl"
              />
              {adjAmount && (
                <button onClick={() => setAdjAmount("")} className="absolute right-3 text-[var(--color-ios-gray-3)] active:text-[var(--color-ios-gray-2)] transition-colors">
                  <XCircle size={20} className="fill-[var(--color-ios-gray-3)] text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">Reason</label>
            <div className="relative">
              <select 
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                className="w-full bg-white text-black text-[17px] rounded-xl py-3.5 pl-4 pr-10 appearance-none outline-none shadow-sm"
              >
                <option value="" disabled className="text-[var(--color-ios-gray-2)]">Search</option>
                {adjType === "subtract" && (
                  <>
                    <option value="waste">Waste</option>
                    <option value="spoiled">Spoiled</option>
                    <option value="expired">Expired</option>
                    <option value="broken">Broken</option>
                  </>
                )}
                <option value="miscount_correction">Miscount Correction</option>
                <option value="other">Other reasons</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="text-[var(--color-ios-gray-3)]" size={20} />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">Additional Notes</label>
            <div className="relative flex items-center bg-white rounded-xl shadow-sm">
              <input
                type="text"
                placeholder="Enter Additional Notes..."
                value={adjNotes}
                onChange={(e) => setAdjNotes(e.target.value)}
                className="w-full bg-transparent text-black placeholder:text-[var(--color-ios-gray-2)] text-[17px] py-3.5 pl-4 pr-10 outline-none rounded-xl"
              />
              {adjNotes && (
                <button onClick={() => setAdjNotes("")} className="absolute right-3 text-[var(--color-ios-gray-3)] active:text-[var(--color-ios-gray-2)] transition-colors">
                  <XCircle size={20} className="fill-[var(--color-ios-gray-3)] text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-6 pb-12 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none z-10">
           <div className="pointer-events-auto shadow-[0_-20px_20px_-10px_rgba(245,245,247,0.9)]">
             <button 
                onClick={handleConfirmAdjustment} 
                disabled={!isFormValid} 
                className={`w-full py-4 rounded-[14px] font-semibold text-[17px] transition-colors ${
                  isFormValid ? 'bg-[var(--color-ios-blue)] text-white active:opacity-80' : 'bg-[#AEAEB2] text-[#E5E5EA] cursor-not-allowed'
                }`}
             >
               Confirm Adjustment
             </button>
           </div>
        </div>
      </div>
    );
  }

  // ------- MOVE OVERLAY -------
  if (showMove) {
    const isFormValid = moveFrom.length > 0 && moveTo.length > 0 && moveAmount.length > 0 && moveFrom !== moveTo;
    
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-32 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full max-w-md mx-auto">
          <button onClick={() => setShowMove(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity w-20">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
          <h1 className="text-[17px] font-semibold text-center text-black flex-1 px-2 whitespace-nowrap">Move Stock</h1>
          <div className="w-20"></div>
        </div>

        <div className="px-6 pb-32 w-full flex-1 flex flex-col pt-4">
          {/* From Container */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">From Container</label>
            <div className="relative">
              <select 
                value={moveFrom}
                onChange={(e) => setMoveFrom(e.target.value)}
                className="w-full bg-white text-black text-[17px] rounded-xl py-3.5 pl-4 pr-10 appearance-none outline-none shadow-sm"
              >
                <option value="" disabled className="text-[var(--color-ios-gray-2)]">Search</option>
                {item?.activeStock?.containers.map((c: any) => <option key={`f-${c.id}`} value={c.name}>{c.name} ({c.amount}{item.unit})</option>)}
                {item?.reserveStock?.cabinets.map((c: any) => <option key={`f-${c.id}`} value={c.name}>{c.name} ({c.amount}{item.unit})</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="text-[var(--color-ios-gray-3)]" size={20} />
              </div>
            </div>
          </div>

          {/* To Container */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">To Container</label>
            <div className="relative">
              <select 
                value={moveTo}
                onChange={(e) => setMoveTo(e.target.value)}
                className="w-full bg-white text-black text-[17px] rounded-xl py-3.5 pl-4 pr-10 appearance-none outline-none shadow-sm"
              >
                <option value="" disabled className="text-[var(--color-ios-gray-2)]">Search</option>
                {item?.activeStock?.containers.map((c: any) => <option key={`t-${c.id}`} value={c.name}>{c.name} ({c.amount}{item.unit})</option>)}
                {item?.reserveStock?.cabinets.map((c: any) => <option key={`t-${c.id}`} value={c.name}>{c.name} ({c.amount}{item.unit})</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="text-[var(--color-ios-gray-3)]" size={20} />
              </div>
            </div>
            {moveFrom && moveTo && moveFrom === moveTo && (
              <p className="text-[#FF3B30] text-[12px] mt-2 ml-1">Cannot move stock to the same container.</p>
            )}
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">Amount</label>
            <div className="relative flex items-center bg-white rounded-xl shadow-sm">
              <input
                type="number"
                placeholder="Enter Amount..."
                value={moveAmount}
                onChange={(e) => setMoveAmount(e.target.value)}
                className="w-full bg-transparent text-black placeholder:text-[var(--color-ios-gray-2)] text-[17px] py-3.5 pl-4 pr-10 outline-none rounded-xl"
              />
              {moveAmount && (
                <button onClick={() => setMoveAmount("")} className="absolute right-3 text-[var(--color-ios-gray-3)] active:text-[var(--color-ios-gray-2)] transition-colors">
                  <XCircle size={20} className="fill-[var(--color-ios-gray-3)] text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-6 pb-12 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none z-10">
           <div className="pointer-events-auto">
             <button 
                onClick={handleMoveStock} 
                disabled={!isFormValid} 
                className={`w-full py-4 rounded-[14px] font-semibold text-[17px] transition-colors shadow-sm ${
                  isFormValid ? 'bg-[var(--color-ios-blue)] text-white active:opacity-80' : 'bg-[#AEAEB2] text-[#E5E5EA] cursor-not-allowed'
                }`}
             >
               Move Stock
             </button>
           </div>
        </div>
      </div>
    );
  }

  // ------- BUY OVERLAY -------
  if (showBuy) {
    const isFormValid = buyAmount.length > 0 && buyPrice.length > 0 && buyTo.length > 0;
    
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-32 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full max-w-md mx-auto">
          <button onClick={() => setShowBuy(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity w-20">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
          <h1 className="text-[17px] font-semibold text-center text-black flex-1 px-2 whitespace-nowrap">Buy Stock</h1>
          <div className="w-20"></div>
        </div>

        <div className="px-6 pb-32 w-full flex-1 flex flex-col pt-4">
          {/* Amount */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">Amount</label>
            <div className="relative flex items-center bg-white rounded-xl shadow-sm">
              <input
                type="number"
                placeholder="Enter Amount..."
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-full bg-transparent text-black placeholder:text-[var(--color-ios-gray-2)] text-[17px] py-3.5 pl-4 pr-10 outline-none rounded-xl"
              />
              {buyAmount && (
                <button onClick={() => setBuyAmount("")} className="absolute right-3 text-[var(--color-ios-gray-3)] active:text-[var(--color-ios-gray-2)] transition-colors">
                  <XCircle size={20} className="fill-[var(--color-ios-gray-3)] text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Price Paid */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">Price Paid</label>
            <div className="relative flex items-center bg-white rounded-xl shadow-sm">
              <input
                type="number"
                placeholder="Enter Amount (Rp)..."
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full bg-transparent text-black placeholder:text-[var(--color-ios-gray-2)] text-[17px] py-3.5 pl-4 pr-10 outline-none rounded-xl"
              />
              {buyPrice && (
                <button onClick={() => setBuyPrice("")} className="absolute right-3 text-[var(--color-ios-gray-3)] active:text-[var(--color-ios-gray-2)] transition-colors">
                  <XCircle size={20} className="fill-[var(--color-ios-gray-3)] text-white" />
                </button>
              )}
            </div>
          </div>

          {/* To Container */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">To Container</label>
            <div className="relative">
              <select 
                value={buyTo}
                onChange={(e) => setBuyTo(e.target.value)}
                className="w-full bg-white text-black text-[17px] rounded-xl py-3.5 pl-4 pr-10 appearance-none outline-none shadow-sm"
              >
                <option value="" disabled className="text-[var(--color-ios-gray-2)]">Search</option>
                {item?.activeStock?.containers.map((c: any) => <option key={`b-${c.id}`} value={c.name}>{c.name} ({c.amount}{item.unit})</option>)}
                {item?.reserveStock?.cabinets.map((c: any) => <option key={`b-${c.id}`} value={c.name}>{c.name} ({c.amount}{item.unit})</option>)}
                <option value="unassigned">Unassigned</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="text-[var(--color-ios-gray-3)]" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-6 pb-12 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none z-10">
           <div className="pointer-events-auto">
             <button 
                onClick={handleBuyStock} 
                disabled={!isFormValid} 
                className={`w-full py-4 rounded-[14px] font-semibold text-[17px] transition-colors shadow-sm ${
                  isFormValid ? 'bg-[var(--color-ios-blue)] text-white active:opacity-80' : 'bg-[#AEAEB2] text-[#E5E5EA] cursor-not-allowed'
                }`}
             >
               Buy Stock
             </button>
           </div>
        </div>
      </div>
    );
  }

  // ------- ASSIGN OVERLAY -------
  if (showAssign) {
    if (assignSelectedId) {
      // Container Selection View (image6.1)
      const isFormValid = assignToContainer.length > 0;
      return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-32 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full max-w-md mx-auto">
            <button onClick={() => setAssignSelectedId(null)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity w-20">
              <ChevronLeft size={24} className="-ml-1" />
              <span>Back</span>
            </button>
            <h1 className="text-[17px] font-semibold text-center text-black flex-1 px-2 whitespace-nowrap">Assign Stock</h1>
            <div className="w-20"></div>
          </div>

          <div className="px-6 pb-32 w-full flex-1 flex flex-col pt-4">
            <div className="mb-6">
              <label className="block text-[15px] font-semibold text-black mb-2">To Container</label>
              <div className="relative">
                <select 
                  value={assignToContainer}
                  onChange={(e) => setAssignToContainer(e.target.value)}
                  className="w-full bg-white text-black text-[17px] rounded-xl py-3.5 pl-4 pr-10 appearance-none outline-none shadow-sm"
                >
                  <option value="" disabled className="text-[var(--color-ios-gray-2)]">Search</option>
                  {item?.activeStock?.containers.map((c: any) => <option key={`a-${c.id}`} value={c.name}>{c.name} ({c.amount}{item.unit})</option>)}
                  {item?.reserveStock?.cabinets.map((c: any) => <option key={`a-${c.id}`} value={c.name}>{c.name} ({c.amount}{item.unit})</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="text-[var(--color-ios-gray-3)]" size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-6 pb-12 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none z-10">
             <div className="pointer-events-auto">
               <button 
                  onClick={handleAssignStock} 
                  disabled={!isFormValid} 
                  className={`w-full py-4 rounded-[14px] font-semibold text-[17px] transition-colors shadow-sm ${
                    isFormValid ? 'bg-[var(--color-ios-blue)] text-white active:opacity-80' : 'bg-[#AEAEB2] text-[#E5E5EA] cursor-not-allowed'
                  }`}
               >
                 Assign Stock
               </button>
             </div>
          </div>
        </div>
      );
    }

    // List View (image6)
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-32 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full max-w-md mx-auto">
          <button onClick={() => setShowAssign(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity w-20">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
          <h1 className="text-[17px] font-semibold text-center text-black flex-1 px-2 whitespace-nowrap">Assign Stock</h1>
          <div className="w-20"></div>
        </div>

        <div className="px-6 w-full flex-1 flex flex-col pt-4">
          <div className="flex flex-col">
            {item?.unassignedContainers.length === 0 && (
              <div className="text-center py-6 text-[var(--color-ios-gray-2)] italic text-[15px]">No unassigned stock</div>
            )}
            {item?.unassignedContainers.map((u: any, idx: number) => (
              <div key={u.id}>
                <div className="flex py-4">
                  <div className="w-10 h-10 border-[1.5px] border-[var(--color-ios-blue)] rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <HelpCircle size={22} className="text-[var(--color-ios-blue)]" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[17px] font-medium text-black mb-1">{u.name}</span>
                    <span className="text-[13px] text-[var(--color-ios-gray-2)] mb-[2px]">Pending Assignment</span>
                    <button 
                      onClick={() => setAssignSelectedId(u.id)}
                      className="self-start mt-2 px-5 py-1.5 rounded-full border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] text-[14px] font-semibold flex items-center gap-1.5 active:bg-[var(--color-ios-blue)]/10 transition-colors"
                    >
                      <Tag size={16} /> Assign
                    </button>
                  </div>
                </div>
                {idx < item.unassignedContainers.length - 1 && (
                  <div className="w-full h-px bg-[var(--color-ios-gray-5)]"></div>
                )}
              </div>
            ))}
            {item?.unassignedContainers.length > 0 && (
               <div className="w-full h-px bg-[var(--color-ios-gray-5)] mt-4 mb-4"></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ------- LOG OVERLAY -------
  if (showLog) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-32 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full max-w-md mx-auto">
          <button onClick={() => setShowLog(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity w-20">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
          <h1 className="text-[17px] font-semibold text-center text-black flex-1 px-2 whitespace-nowrap">Stock Log</h1>
          <div className="w-20"></div>
        </div>

        <div className="px-6 w-full flex-1 flex flex-col pt-4">
          <div className="flex flex-col">
            {item?.logs.length === 0 && (
              <div className="text-center py-6 text-[var(--color-ios-gray-2)] italic text-[15px]">No logs recorded</div>
            )}
            {item?.logs.map((log: any, idx: number) => (
              <div key={log.id}>
                <div className="flex py-4">
                  <div className="w-10 h-10 border-[1.5px] border-[var(--color-ios-blue)] rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <ClipboardList size={22} className="text-[var(--color-ios-blue)]" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[17px] font-medium text-black mb-1 leading-tight">{log.title}</span>
                    <span className="text-[13px] text-[var(--color-ios-gray-2)] mb-[2px]">
                      {new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                    </span>
                    <span className="text-[13px] text-[var(--color-ios-gray-2)] mb-[2px]">{log.locationInfo}</span>
                    <span className="text-[13px] text-[var(--color-ios-gray-2)]">{log.referenceInfo}</span>
                  </div>
                </div>
                {idx < item.logs.length - 1 && (
                  <div className="w-full h-px bg-[var(--color-ios-gray-4)]"></div>
                )}
              </div>
            ))}
            {item?.logs.length > 0 && (
              <div className="w-full h-px bg-[var(--color-ios-gray-4)] mt-navbar mb-4"></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ------- SETTINGS OVERLAY -------
  if (showSettings) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-32 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full max-w-md mx-auto">
          <button onClick={() => setShowSettings(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity w-20">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
          <h1 className="text-[17px] font-semibold text-center text-black flex-1 px-2 whitespace-nowrap">Item Settings</h1>
          <div className="w-20"></div>
        </div>

        <div className="px-6 pb-32 w-full flex-1 flex flex-col pt-4">
          {/* Name */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">Item Name</label>
            <div className="relative flex items-center bg-white rounded-xl shadow-sm">
              <input
                type="text"
                placeholder="Enter Name..."
                value={settingName}
                onChange={(e) => setSettingName(e.target.value)}
                className="w-full bg-transparent text-black placeholder:text-[var(--color-ios-gray-2)] text-[17px] py-3.5 pl-4 pr-10 outline-none rounded-xl"
              />
              {settingName && (
                <button onClick={() => setSettingName("")} className="absolute right-4 w-5 h-5 bg-[#8E8E93] rounded-full flex items-center justify-center active:opacity-70 transition-opacity">
                   <X size={14} className="text-white" strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

          {/* Unit */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">Unit</label>
            <div className="relative flex items-center bg-white rounded-xl shadow-sm">
              <input
                type="text"
                placeholder="Enter Unit..."
                value={settingUnit}
                onChange={(e) => setSettingUnit(e.target.value)}
                className="w-full bg-transparent text-black placeholder:text-[var(--color-ios-gray-2)] text-[17px] py-3.5 pl-4 pr-10 outline-none rounded-xl"
              />
              {settingUnit && (
                <button onClick={() => setSettingUnit("")} className="absolute right-4 w-5 h-5 bg-[#8E8E93] rounded-full flex items-center justify-center active:opacity-70 transition-opacity">
                   <X size={14} className="text-white" strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-[var(--color-ios-gray-4)] mb-6"></div>

          {/* Container section */}
          <div>
            <label className="block text-[17px] font-semibold text-black mb-4">Container</label>
            
            <label className="block text-[13px] font-medium text-[var(--color-ios-gray-1)] mb-2 ml-1">Active</label>
            <div className="flex flex-col gap-3 mb-6">
              {item?.activeStock?.containers.map((c: any) => (
                <div key={`act-${c.id}`} className="bg-white rounded-xl flex items-center justify-between p-3.5 shadow-sm">
                  <span className="text-[17px] text-[var(--color-ios-gray-1)] font-medium">{c.name} - {c.amount}{item.unit}</span>
                  <button onClick={() => handleDeleteContainer(c.id)} className="text-[#FF3B30] active:opacity-70 transition-opacity p-1">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <label className="block text-[13px] font-medium text-[var(--color-ios-gray-1)] mb-2 ml-1">Reserve</label>
            <div className="flex flex-col gap-3 mb-4">
              {item?.reserveStock?.cabinets.map((c: any) => (
                <div key={`res-${c.id}`} className="bg-white rounded-xl flex items-center justify-between p-3.5 shadow-sm">
                  <span className="text-[17px] text-[var(--color-ios-gray-1)] font-medium">{c.name} - {c.amount}{item.unit}</span>
                  <button onClick={() => handleDeleteContainer(c.id)} className="text-[#FF3B30] active:opacity-70 transition-opacity p-1">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add new container input row */}
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="New Container Name" 
                value={settingNewContainerName}
                onChange={(e) => setSettingNewContainerName(e.target.value)}
                className="flex-1 min-w-0 bg-transparent text-black placeholder:text-[var(--color-ios-gray-2)] text-[16px] py-3 px-4 outline-none rounded-xl border border-[var(--color-ios-gray-4)] bg-white"
              />
              <div className="relative w-28 shrink-0">
                <select 
                  value={settingNewContainerType} 
                  onChange={(e) => setSettingNewContainerType(e.target.value as "ACTIVE"|"RESERVE")}
                  className="w-full h-full bg-white text-[var(--color-ios-gray-1)] text-[16px] font-medium rounded-xl pl-3 pr-8 appearance-none outline-none border border-[var(--color-ios-gray-4)]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="RESERVE">Reserve</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="text-[var(--color-ios-gray-3)]" size={16} />
                </div>
              </div>
              <button onClick={handleAddContainer} className="w-12 shrink-0 border border-[var(--color-ios-gray-4)] rounded-xl flex items-center justify-center bg-white active:bg-gray-50 transition-colors">
                <Plus size={20} className="text-[var(--color-ios-gray-1)]" />
              </button>
            </div>

          </div>

          <div className="w-full h-px bg-[var(--color-ios-gray-4)] my-8"></div>

          {/* Delete Item Button */}
          <button 
            onClick={() => { setShowSettings(false); setShowDeleteConfirm(true); }}
            className="w-full py-4 rounded-full border border-[#FF3B30] text-[#FF3B30] font-semibold text-[17px] active:bg-[#FF3B30]/10 transition-colors bg-transparent"
          >
            Delete Item
          </button>
          
          <div className="h-12"></div> {/* Spacer for scroll */}
        </div>

        <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-6 pb-12 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none z-10">
          <div className="pointer-events-auto">
            <button 
              onClick={handleSaveSettings}
              className="w-full py-4 rounded-[14px] font-semibold text-[17px] transition-colors bg-[var(--color-ios-blue)] text-white active:opacity-80 shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------- DELETE CONFIRM OVERLAY -------
  if (showDeleteConfirm) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full max-w-md mx-auto">
          <button onClick={() => setShowDeleteConfirm(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity w-20">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
          <div className="w-20"></div>
        </div>

        <div className="px-6 w-full max-w-md mx-auto flex-1 flex flex-col justify-center items-center pb-32">
          <div className="w-16 h-16 bg-[#FF3B30]/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-[#FF3B30]" />
          </div>
          <h2 className="text-[22px] font-bold text-black mb-3 text-center">Delete "{item.name}"?</h2>
          <p className="text-[15px] text-[var(--color-ios-gray-1)] text-center mb-10 leading-relaxed px-4">
            This action cannot be undone. All active stock, reserve stock, and history logs associated with this item will be permanently deleted.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={handleDeleteItem}
              className="w-full py-4 rounded-xl bg-[#FF3B30] text-white font-semibold text-[17px] active:opacity-80 transition-opacity"
            >
              Confirm Delete
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full py-4 rounded-xl bg-[#E5E5EA] text-black font-semibold text-[17px] active:bg-[#D1D1D6] transition-opacity"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !item) {
    return (
       <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-32 overflow-y-auto">
         <div className="flex items-center px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full">
            <button onClick={onBack} className="flex items-center text-[var(--color-ios-blue)] flex-1 text-[17px] font-medium active:opacity-70 transition-opacity">
              <ChevronLeft size={24} className="-ml-1" />
              <span>Inventory</span>
            </button>
         </div>
         <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[var(--color-ios-gray-3)]" size={40} />
         </div>
       </div>
    );
  }

  // ------- MAIN INVENTORY DETAIL VIEW -------
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-32 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full">
        <button onClick={onBack} className="flex items-center text-[var(--color-ios-blue)] flex-1 text-[17px] font-medium active:opacity-70 transition-opacity">
          <ChevronLeft size={24} className="-ml-1" />
          <span>Inventory</span>
        </button>
      </div>

      <div className="px-6 mt-2 w-full max-w-md mx-auto flex flex-col items-center">
        <h1 className="text-[18px] font-bold text-black mb-1">{item.name}</h1>
        <div className="text-[40px] font-bold text-black leading-none mb-1">
          {item.totalStock}
          <span className="text-[32px] font-bold">{item.unit}</span>
        </div>
        <div className="text-[13px] text-[var(--color-ios-gray-2)] mb-8">Total Stock</div>

        {/* Stock Columns Header */}
        <div className="flex w-full gap-3 mb-6">
          <div className="flex-1 bg-[#E5E5EA] text-black font-semibold text-[14px] py-3 rounded-xl text-center">
            Active Stock
          </div>
          <div className="flex-1 bg-[#E5E5EA] text-black font-semibold text-[14px] py-3 rounded-xl text-center">
            Reserve Stock
          </div>
        </div>

        {/* Stock Columns Data */}
        <div className="flex w-full gap-6 mb-10">
          {/* Active Side */}
          <div className="flex-1 flex flex-col">
            <div className="text-[10px] text-[var(--color-ios-gray-2)] mb-1 uppercase tracking-wider">Total Active Stock</div>
            <div className="text-[18px] text-black mb-2">{item.activeStock.total}{item.unit}</div>
            <div className="w-full h-px bg-[var(--color-ios-gray-4)] mb-4"></div>
            
            <div className="flex flex-col gap-3">
              {item.activeStock.containers.map((c: any) => (
                <div key={c.id}>
                  <div className="text-[10px] text-[var(--color-ios-gray-2)] mb-[2px]">{c.name}</div>
                  <div className="text-[15px] text-black">{c.amount}{item.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reserve Side */}
          <div className="flex-1 flex flex-col items-end text-right">
            <div className="text-[10px] text-[var(--color-ios-gray-2)] mb-1 uppercase tracking-wider">Total Reserve Stock</div>
            <div className="text-[18px] text-black mb-2">{item.reserveStock.total}{item.unit}</div>
            <div className="w-full h-px bg-[var(--color-ios-gray-4)] mb-4"></div>
            
            <div className="flex flex-col gap-3 items-end text-right">
              {item.reserveStock.cabinets.map((c: any) => (
                <div key={c.id}>
                  <div className="text-[10px] text-[var(--color-ios-gray-2)] mb-[2px]">{c.name}</div>
                  <div className="text-[15px] text-black">{c.amount}{item.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {actionButtons.map(btn => (
            <button 
              key={btn.id}
              onClick={() => {
                if (btn.id === "adjustment") setShowAdjustment(true);
                else if (btn.id === "move") setShowMove(true);
                else if (btn.id === "buy") setShowBuy(true);
                else if (btn.id === "assign") setShowAssign(true);
                else if (btn.id === "log") setShowLog(true);
                else if (btn.id === "setting") setShowSettings(true);
              }}
              className="bg-white rounded-2xl aspect-[4/3] flex flex-col items-center justify-center p-4 relative shadow-sm border border-[var(--color-ios-gray-5)] active:opacity-70 transition-opacity"
            >
              {btn.badge && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-[#FFCC00] rounded-full"></div>
              )}
              <btn.icon size={32} strokeWidth={1.5} className="text-[var(--color-ios-blue)] mb-3" />
              <span className="text-[13px] text-black font-medium">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
