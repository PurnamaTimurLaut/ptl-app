import { useState, useEffect } from "react";
import { TopBar } from "../layout/TopBar";
import { BottomNav } from "../layout/BottomNav";
import { Search, ChevronRight, AlertTriangle, Plus, ChevronLeft, XCircle, Loader2 } from "lucide-react";
import { getInventory, addInventoryItem } from "@/app/actions/inventory";

interface InventoryScreenProps {
  onProfileClick: () => void;
  onViewItem: (itemId: string) => void;
  onNavTabChange: (tab: any) => void;
}

export default function InventoryScreen({ onProfileClick, onViewItem, onNavTabChange }: InventoryScreenProps) {
  const [activeTab, setActiveTab] = useState<"ingredients" | "finished">("ingredients");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddNewItem = async () => {
    try {
      await addInventoryItem(newItemName);
      setNewItemName("");
      setShowAddItem(false);
      await loadData();
    } catch (e) {
      alert("Error adding item");
    }
  };

  if (showAddItem) {
    const isFormValid = newItemName.length > 0;
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-32 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full max-w-md mx-auto">
          <button onClick={() => setShowAddItem(false)} className="flex items-center text-[var(--color-ios-blue)] text-[17px] font-medium active:opacity-70 transition-opacity w-20">
            <ChevronLeft size={24} className="-ml-1" />
            <span>Back</span>
          </button>
          <h1 className="text-[17px] font-semibold text-center text-black flex-1 px-2 whitespace-nowrap">Add New Item</h1>
          <div className="w-20"></div>{/* Spacer */}
        </div>

        <div className="px-6 w-full max-w-md mx-auto flex-1 flex flex-col pt-6">
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-black mb-2">Item Name</label>
            <div className="relative flex items-center bg-white rounded-xl shadow-sm">
              <input
                type="text"
                placeholder="Item Name (e.g. Daun Kemangi)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-transparent text-black placeholder:text-[var(--color-ios-gray-2)] text-[17px] py-3.5 pl-4 pr-10 outline-none rounded-xl border border-[var(--color-ios-gray-5)]"
              />
              {newItemName && (
                <button onClick={() => setNewItemName("")} className="absolute right-3 text-[var(--color-ios-gray-3)] active:text-[var(--color-ios-gray-2)] transition-colors">
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
                onClick={handleAddNewItem} 
                disabled={!isFormValid} 
                className={`w-full py-4 rounded-[14px] font-semibold text-[17px] transition-colors shadow-sm ${
                  isFormValid ? 'bg-[var(--color-ios-blue)] text-white active:opacity-80' : 'bg-[var(--color-ios-blue)]/50 text-white cursor-not-allowed'
                }`}
             >
               Add New Item
             </button>
           </div>
        </div>
      </div>
    );
  }

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
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-[var(--color-ios-gray-3)]" size={32} />
            </div>
          ) : (
            items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
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
            ))
          )}
          
          <button 
            onClick={() => setShowAddItem(true)}
            className="w-full py-4 mt-2 rounded-[24px] border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] text-[17px] font-semibold flex items-center justify-center gap-2 active:bg-[var(--color-ios-blue)]/10 transition-colors"
          >
            <Plus size={20} /> Add New Item
          </button>
        </div>
      </div>

      <BottomNav activeTab="inventory" onTabChange={onNavTabChange} />
    </div>
  );
}
