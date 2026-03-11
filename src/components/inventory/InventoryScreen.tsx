import { useState } from "react";
import { TopBar } from "../layout/TopBar";
import { BottomNav } from "../layout/BottomNav";
import { Search, ChevronRight, AlertTriangle } from "lucide-react";

interface InventoryScreenProps {
  onProfileClick: () => void;
  onViewItem: (itemId: string) => void;
  onNavTabChange: (tab: any) => void;
}

export default function InventoryScreen({ onProfileClick, onViewItem, onNavTabChange }: InventoryScreenProps) {
  const [activeTab, setActiveTab] = useState<"ingredients" | "finished">("ingredients");
  const [searchQuery, setSearchQuery] = useState("");

  const mockIngredients = [
    { id: "garam", name: "Garam", stock: 3192, unit: "gr", lastAudit: "14/02/2026", status: "needs_assignment" },
    { id: "gula", name: "Gula", stock: 0, unit: "gr", lastAudit: "01/02/2026", status: "finished" },
    { id: "kemangi", name: "Daun Kemangi", stock: 150, unit: "gr", lastAudit: "26/02/2026", status: "ok" },
    { id: "tomat", name: "Tomat", stock: 6, unit: "buah", lastAudit: "01/03/2026", status: "ok" },
    { id: "sapi", name: "Daging Sapi Sirloin", stock: 4000, unit: "gr", lastAudit: "01/03/2026", status: "ok" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-32">
      <TopBar onProfileClick={onProfileClick} />

      <div className="px-6 mt-2 mb-6 w-full max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-black tracking-tight mb-6">Inventory</h1>

        {/* Segmented Control */}
        <div className="bg-[#E5E5EA] rounded-xl p-1 flex mb-6">
          <button
            onClick={() => setActiveTab("ingredients")}
            className={`flex-1 py-1.5 text-[14px] font-semibold rounded-lg transition-all ${
              activeTab === "ingredients" ? "bg-white text-black shadow-sm" : "text-[var(--color-ios-gray-1)]"
            }`}
          >
            Ingredients
          </button>
          <button
            onClick={() => setActiveTab("finished")}
            className={`flex-1 py-1.5 text-[14px] font-semibold rounded-lg transition-all ${
              activeTab === "finished" ? "bg-white text-black shadow-sm" : "text-[var(--color-ios-gray-1)]"
            }`}
          >
            Finished Products
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="text-[var(--color-ios-gray-2)]" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#E5E5EA] text-black placeholder:text-[var(--color-ios-gray-2)] text-[17px] rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-ios-blue)]/50"
          />
        </div>

        {/* Item List */}
        <div className="flex flex-col gap-3">
          {mockIngredients.map(item => (
            <div 
               key={item.id} 
               onClick={() => onViewItem(item.id)}
               className="bg-white rounded-[20px] p-5 shadow-sm border border-[var(--color-ios-gray-6)] flex items-center justify-between cursor-pointer active:opacity-70 transition-opacity"
            >
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[19px] font-bold text-black">{item.name}</span>
                  {item.status === "needs_assignment" && (
                     <div className="flex items-center gap-1 text-[#FFCC00]">
                       <AlertTriangle size={14} />
                       <span className="text-[10px] font-medium leading-none">New Stock Needs Assignment</span>
                     </div>
                  )}
                  {item.status === "finished" && (
                     <div className="flex items-center gap-1 text-[#FF3B30]">
                       <AlertTriangle size={14} />
                       <span className="text-[10px] font-medium leading-none">Stock is Finished</span>
                     </div>
                  )}
                </div>
                <div className="text-[14px] text-[var(--color-ios-gray-2)] mb-[2px]">
                  Current Total Stock: {item.stock}{item.unit}
                </div>
                <div className="text-[14px] text-[var(--color-ios-gray-2)]">
                  Last Audit: {item.lastAudit}
                </div>
              </div>
              <ChevronRight className="text-[var(--color-ios-gray-3)] ml-2 flex-shrink-0" size={20} />
            </div>
          ))}
        </div>
      </div>

      <BottomNav activeTab="inventory" onTabChange={onNavTabChange} />
    </div>
  );
}
