"use client";

import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { TopBar } from "../layout/TopBar";
import { BottomNav } from "../layout/BottomNav";

interface BatchesScreenProps {
  onViewBatch?: (batchId: number) => void;
}

export default function BatchesScreen({ onViewBatch }: BatchesScreenProps) {
  const [activeTab, setActiveTab] = useState<'batches' | 'inventory' | 'schedules'>('batches');

  // Hardcoded mock data based on the Figma design
  const toMakeBatches = [
    { id: 1, title: 'Ayam Suwir Cabe Ijo', qty: 50, deadline: '22/03/2026' },
    { id: 2, title: 'Sapi Lada Hitam', qty: 100, deadline: '25/03/2026' },
    { id: 3, title: 'Sapi Teriyaki', qty: 20, deadline: '18/03/2026' },
  ];

  const completedBatches = [
    { id: 4, title: 'Ayam Suwir Kemangi', qty: 10, deadline: '02/03/2026' },
  ];

  // Helper component for the Batch List Items
  const BatchCard = ({ id, title, qty, deadline }: { id: number, title: string, qty: number, deadline: string }) => (
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
      <ChevronRight size={20} className="text-[var(--color-ios-gray-2)]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-24">
      <TopBar />
      
      <main className="px-6 flex-1 max-w-xl mx-auto w-full">
        {/* Header */}
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">Batches</h1>

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
          <h2 className="text-[17px] font-semibold text-black mb-4">To Make</h2>
          <div className="flex flex-col gap-3">
            {toMakeBatches.map(batch => (
              <BatchCard key={batch.id} id={batch.id} title={batch.title} qty={batch.qty} deadline={batch.deadline} />
            ))}
          </div>
        </div>

        {/* Completed List */}
        <div>
          <h2 className="text-[17px] font-semibold text-black mb-4">Completed</h2>
          <div className="flex flex-col gap-3">
             {completedBatches.map(batch => (
              <BatchCard key={batch.id} id={batch.id} title={batch.title} qty={batch.qty} deadline={batch.deadline} />
            ))}
          </div>
        </div>

      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
