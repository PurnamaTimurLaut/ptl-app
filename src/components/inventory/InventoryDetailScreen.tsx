import { useState } from "react";
import { ChevronLeft, FileEdit, ArrowRightLeft, ShoppingBasket, HelpCircle, ClipboardList, Settings, Search, AlertTriangle, ChevronDown, XCircle, Tag } from "lucide-react";

interface InventoryDetailScreenProps {
  itemId: string;
  onBack: () => void;
}

export default function InventoryDetailScreen({ itemId, onBack }: InventoryDetailScreenProps) {
  // Mock data for demonstration
  const mockItem = {
    id: itemId,
    name: itemId === "garam" ? "Garam" : "Sample Item",
    totalStock: 3192,
    unit: "gr",
    activeStock: {
      total: 1192,
      containers: [
        { id: "c1", name: "Container 1", amount: 692 },
        { id: "c2", name: "Container 2", amount: 400 },
        { id: "c3", name: "Container 3", amount: 100 },
      ]
    },
    reserveStock: {
      total: 2000,
      cabinets: [
        { id: "r1", name: "Cabinet 1", amount: 1500 },
        { id: "r2", name: "Cabinet 2", amount: 500 },
      ]
    }
  };

  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjContainer, setAdjContainer] = useState("");
  const [adjType, setAdjType] = useState<"add" | "subtract">("add");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [adjNotes, setAdjNotes] = useState("");

  const handleConfirmAdjustment = () => {
    alert(`Adjusted: ${adjType} ${adjAmount} on ${adjContainer} for ${adjReason}`);
    setShowAdjustment(false);
    setAdjContainer(""); setAdjAmount(""); setAdjReason(""); setAdjNotes("");
  };

  const [showMove, setShowMove] = useState(false);
  const [moveFrom, setMoveFrom] = useState("");
  const [moveTo, setMoveTo] = useState("");
  const [moveAmount, setMoveAmount] = useState("");
  
  const handleMoveStock = () => {
    alert(`Moved ${moveAmount} from ${moveFrom} to ${moveTo}`);
    setShowMove(false);
    setMoveFrom(""); setMoveTo(""); setMoveAmount("");
  };

  const [showBuy, setShowBuy] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyTo, setBuyTo] = useState("");

  const handleBuyStock = () => {
    alert(`Bought ${buyAmount} for ${buyPrice} -> ${buyTo}`);
    setShowBuy(false);
    setBuyAmount(""); setBuyPrice(""); setBuyTo("");
  };

  const [showAssign, setShowAssign] = useState(false);
  const [assignSelectedId, setAssignSelectedId] = useState<string | null>(null);
  const [assignToContainer, setAssignToContainer] = useState("");

  const handleAssignStock = () => {
    alert(`Assigned item ${assignSelectedId} to ${assignToContainer}`);
    setAssignSelectedId(null);
    setAssignToContainer("");
    setShowAssign(false);
  };

  // Mock list for unassigned items (image6)
  const mockUnassignedItems = [
    { id: "u1", name: "Purchased 100gr:", source: "From Production: ASCIB00001", date: "06/03/2026, 09:02:08" },
    { id: "u2", name: "Purchased 100gr:", source: "From Buy Stock: BSI00100001", date: "06/03/2026, 09:01:55" },
  ];

  const actionButtons = [
    { id: "adjustment", label: "Stock Adjustment", icon: FileEdit, badge: false },
    { id: "move", label: "Move Stock", icon: ArrowRightLeft, badge: false },
    { id: "buy", label: "Buy Stock", icon: ShoppingBasket, badge: false },
    { id: "assign", label: "Assign Stock", icon: HelpCircle, badge: true }, // The yellow dot badge
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
        
        <div className="px-6 pb-32 w-full flex-1 flex flex-col pt-4 max-w-md mx-auto">
          
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
                {mockItem.activeStock.containers.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.amount}{mockItem.unit})</option>
                ))}
                {mockItem.reserveStock.cabinets.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.amount}{mockItem.unit})</option>
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
                <option value="waste">Waste</option>
                <option value="spoiled">Spoiled</option>
                <option value="expired">Expired</option>
                <option value="broken">Broken</option>
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
    const isFormValid = moveFrom.length > 0 && moveTo.length > 0 && moveAmount.length > 0;
    
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

        <div className="px-6 pb-32 w-full flex-1 flex flex-col pt-4 max-w-md mx-auto">
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
                {mockItem.activeStock.containers.map(c => <option key={`f-${c.id}`} value={c.name}>{c.name} ({c.amount}{mockItem.unit})</option>)}
                {mockItem.reserveStock.cabinets.map(c => <option key={`f-${c.id}`} value={c.name}>{c.name} ({c.amount}{mockItem.unit})</option>)}
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
                {mockItem.activeStock.containers.map(c => <option key={`t-${c.id}`} value={c.name}>{c.name} ({c.amount}{mockItem.unit})</option>)}
                {mockItem.reserveStock.cabinets.map(c => <option key={`t-${c.id}`} value={c.name}>{c.name} ({c.amount}{mockItem.unit})</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="text-[var(--color-ios-gray-3)]" size={20} />
              </div>
            </div>
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

        <div className="px-6 pb-32 w-full flex-1 flex flex-col pt-4 max-w-md mx-auto">
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
                {mockItem.activeStock.containers.map(c => <option key={`b-${c.id}`} value={c.name}>{c.name} ({c.amount}{mockItem.unit})</option>)}
                {mockItem.reserveStock.cabinets.map(c => <option key={`b-${c.id}`} value={c.name}>{c.name} ({c.amount}{mockItem.unit})</option>)}
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

          <div className="px-6 pb-32 w-full flex-1 flex flex-col pt-4 max-w-md mx-auto">
            <div className="mb-6">
              <label className="block text-[15px] font-semibold text-black mb-2">To Container</label>
              <div className="relative">
                <select 
                  value={assignToContainer}
                  onChange={(e) => setAssignToContainer(e.target.value)}
                  className="w-full bg-white text-black text-[17px] rounded-xl py-3.5 pl-4 pr-10 appearance-none outline-none shadow-sm"
                >
                  <option value="" disabled className="text-[var(--color-ios-gray-2)]">Search</option>
                  {mockItem.activeStock.containers.map(c => <option key={`a-${c.id}`} value={c.name}>{c.name} ({c.amount}{mockItem.unit})</option>)}
                  {mockItem.reserveStock.cabinets.map(c => <option key={`a-${c.id}`} value={c.name}>{c.name} ({c.amount}{mockItem.unit})</option>)}
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

        <div className="px-6 w-full max-w-md mx-auto flex-1 flex flex-col pt-4">
          <div className="flex flex-col">
            {mockUnassignedItems.map((item, idx) => (
              <div key={item.id}>
                <div className="flex py-4">
                  <div className="w-10 h-10 border-[1.5px] border-[var(--color-ios-blue)] rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <HelpCircle size={22} className="text-[var(--color-ios-blue)]" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[17px] font-medium text-black mb-1">{item.name}</span>
                    <span className="text-[13px] text-[var(--color-ios-gray-2)] mb-[2px]">{item.source}</span>
                    <span className="text-[13px] text-[var(--color-ios-gray-2)] mb-3">{item.date}</span>
                    <button 
                      onClick={() => setAssignSelectedId(item.id)}
                      className="self-start px-5 py-1.5 rounded-full border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] text-[14px] font-semibold flex items-center gap-1.5 active:bg-[var(--color-ios-blue)]/10 transition-colors"
                    >
                      <Tag size={16} /> Assign
                    </button>
                  </div>
                </div>
                {idx < mockUnassignedItems.length - 1 && (
                  <div className="w-full h-px bg-[var(--color-ios-gray-5)]"></div>
                )}
              </div>
            ))}
            <div className="w-full h-px bg-[var(--color-ios-gray-5)] mt-4 mb-4"></div>
          </div>
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
        <h1 className="text-[18px] font-bold text-black mb-1">{mockItem.name}</h1>
        <div className="text-[40px] font-bold text-black leading-none mb-1">
          {mockItem.totalStock}
          <span className="text-[32px] font-bold">{mockItem.unit}</span>
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
            <div className="text-[18px] text-black mb-2">{mockItem.activeStock.total}{mockItem.unit}</div>
            <div className="w-full h-px bg-[var(--color-ios-gray-4)] mb-4"></div>
            
            <div className="flex flex-col gap-3">
              {mockItem.activeStock.containers.map(c => (
                <div key={c.id}>
                  <div className="text-[10px] text-[var(--color-ios-gray-2)] mb-[2px]">{c.name}</div>
                  <div className="text-[15px] text-black">{c.amount}{mockItem.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reserve Side */}
          <div className="flex-1 flex flex-col items-end text-right">
            <div className="text-[10px] text-[var(--color-ios-gray-2)] mb-1 uppercase tracking-wider">Total Reserve Stock</div>
            <div className="text-[18px] text-black mb-2">{mockItem.reserveStock.total}{mockItem.unit}</div>
            <div className="w-full h-px bg-[var(--color-ios-gray-4)] mb-4"></div>
            
            <div className="flex flex-col gap-3 items-end text-right">
              {mockItem.reserveStock.cabinets.map(c => (
                <div key={c.id}>
                  <div className="text-[10px] text-[var(--color-ios-gray-2)] mb-[2px]">{c.name}</div>
                  <div className="text-[15px] text-black">{c.amount}{mockItem.unit}</div>
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
                else alert(`${btn.label} Action Coming Soon!`);
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
