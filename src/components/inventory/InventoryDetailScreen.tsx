import { useState } from "react";
import { ChevronLeft, FileEdit, ArrowRightLeft, ShoppingBasket, HelpCircle, ClipboardList, Settings, Search, AlertTriangle } from "lucide-react";

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

  const actionButtons = [
    { id: "adjustment", label: "Stock Adjustment", icon: FileEdit, badge: false },
    { id: "move", label: "Move Stock", icon: ArrowRightLeft, badge: false },
    { id: "buy", label: "Buy Stock", icon: ShoppingBasket, badge: false },
    { id: "assign", label: "Assign Stock", icon: HelpCircle, badge: true }, // The yellow dot badge
    { id: "log", label: "Stock Log", icon: ClipboardList, badge: false },
    { id: "setting", label: "Item Setting", icon: Settings, badge: false },
  ];

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
