"use client";

import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { TopBar } from "../layout/TopBar";
import { BottomNav } from "../layout/BottomNav";

interface BatchesScreenProps {
  onViewBatch?: (batchId: number) => void;
  onProfileClick?: () => void;
  onNavTabChange?: (tab: 'production' | 'inventory' | 'schedules' | 'recipes') => void;
}

export default function BatchesScreen({ onViewBatch, onProfileClick, onNavTabChange }: BatchesScreenProps) {
  const [activeTab, setActiveTab] = useState<'production' | 'inventory' | 'schedules' | 'recipes'>('production');

  // Updated mock data with status
  const batches = [
    { id: 1, title: 'Ayam Suwir Cabe Ijo', qty: 50, deadline: '22/03/2026', status: 'to_make' as const },
    { id: 2, title: 'Sapi Lada Hitam', qty: 100, deadline: '25/03/2026', status: 'to_make' as const },
    { id: 3, title: 'Sapi Teriyaki', qty: 20, deadline: '18/03/2026', status: 'to_make' as const },
    { id: 4, title: 'Ayam Suwir Kemangi', qty: 10, deadline: '02/03/2026', status: 'completed' as const },
    { id: 5, title: 'Gulai Ayam', qty: 30, deadline: '15/03/2026', status: 'cancelled' as const },
  ];

  const toMakeBatches = batches.filter(b => b.status === 'to_make');
  const completedBatches = batches.filter(b => b.status === 'completed');
  const cancelledBatches = batches.filter(b => b.status === 'cancelled');

  // Helper component for the Batch List Items
  const BatchCard = ({ id, title, qty, deadline, status }: { id: number, title: string, qty: number, deadline: string, status: string }) => (
    <div 
      onClick={() => onViewBatch && onViewBatch(id)}
      className="bg-white rounded-2xl p-4 flex justify-between items-center shadow-sm cursor-pointer active:opacity-80 transition-opacity"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-[17px] text-black">{title}</h3>
        <p className="text-[13px] text-[var(--color-ios-gray-1)]">
          Quantity: {qty} pcs
          <br/>
          Deadline Date: {deadline}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {status === 'cancelled' && (
          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase leading-none">Cancelled</span>
        )}
        <ChevronRight size={20} className="text-[var(--color-ios-gray-2)]" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-24">
      <TopBar onProfileClick={onProfileClick} />
      
      <main className="px-6 flex-1 max-w-xl mx-auto w-full">
        {/* Header */}
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">Production</h1>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={20} className="text-[var(--color-ios-gray-2)]" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[var(--color-ios-gray-5)] rounded-xl py-2 pl-10 pr-4 text-[17px] text-black placeholder:text-[var(--color-ios-gray-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ios-blue)]"
          />
        </div>

        {/* To Make List */}
        <div className="mb-8">
          <h2 className="text-[17px] font-semibold text-black mb-4 px-1">To Make</h2>
          <div className="flex flex-col gap-3">
            {toMakeBatches.map(batch => (
              <BatchCard key={batch.id} id={batch.id} title={batch.title} qty={batch.qty} deadline={batch.deadline} status={batch.status} />
            ))}
          </div>
        </div>

        {/* Completed List */}
        <div className="mb-8">
          <h2 className="text-[17px] font-semibold text-black mb-4 px-1">Completed</h2>
          <div className="flex flex-col gap-3 opacity-70">
             {completedBatches.map(batch => (
              <BatchCard key={batch.id} id={batch.id} title={batch.title} qty={batch.qty} deadline={batch.deadline} status={batch.status} />
            ))}
          </div>
        </div>

        {/* Cancelled List */}
        <div>
          <h2 className="text-[17px] font-semibold text-black mb-4 px-1">Cancelled</h2>
          <div className="flex flex-col gap-3 opacity-50 grayscale">
             {cancelledBatches.map(batch => (
              <BatchCard key={batch.id} id={batch.id} title={batch.title} qty={batch.qty} deadline={batch.deadline} status={batch.status} />
            ))}
          </div>
        </div>

      </main>

      <BottomNav activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if(onNavTabChange) onNavTabChange(tab); }} />
    </div>
  );
}
