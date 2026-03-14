"use client";

import { useState, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import { TopBar } from "../layout/TopBar";
import { BottomNav } from "../layout/BottomNav";
import { getProjects } from "@/app/lib/projectActions";

interface ProductionScreenProps {
  onViewProduction?: (id: string) => void;
  onProfileClick?: () => void;
  onNavTabChange?: (tab: 'production' | 'inventory' | 'schedules' | 'recipes') => void;
}

export default function ProductionScreen({ onViewProduction, onProfileClick, onNavTabChange }: ProductionScreenProps) {
  const [productions, setProductions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await getProjects();
        if (res.success && res.projects) {
          const all: any[] = [];
          res.projects.forEach((p: any) => {
            if (p.productions) {
              p.productions.forEach((pr: any) => {
                all.push({
                  ...pr,
                  projectName: p.name,
                  projectCode: p.projectCode || "N/A",
                  templateName: pr.ProductionTemplate?.name || "Unknown",
                  productionCode: pr.productionCode || "N/A",
                  qty: pr.quantity,
                  assignedFormatted: new Date(pr.assignedDate).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
                  deadlineFormatted: new Date(pr.deadlineDate).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })
                });
              });
            }
          });
          setProductions(all);
        }
      } catch (err) {
        console.error("Failed to load productions:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const toMake = productions.filter(b => b.status === "ASSIGNED" || b.status === "to_make");
  const completed = productions.filter(b => b.status === "COMPLETED" || b.status === "completed");
  const cancelled = productions.filter(b => b.status === "CANCELLED" || b.status === "cancelled");

  const ProductionCard = ({ item }: { item: any }) => (
    <div 
      onClick={() => {
        if (item.status !== "CANCELLED" && onViewProduction) {
          onViewProduction(item.id);
        }
      }}
      className={`bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-sm transition-opacity ${item.status !== "CANCELLED" ? "cursor-pointer active:opacity-80" : "cursor-default"}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-bold text-[17px] text-black leading-tight mb-2">{item.templateName}</h3>
        </div>
        <div className="flex items-center gap-2">
          {item.status === "CANCELLED" && (
            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase leading-none">Cancelled</span>
          )}
          <ChevronRight size={18} className="text-[var(--color-ios-gray-2)]" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 text-[13px] text-[var(--color-ios-gray-1)] pt-1 border-t border-gray-50">
        <div>
           <p className="text-[11px] uppercase font-semibold text-[var(--color-ios-gray-2)] mb-0.5 tracking-wider">Quantity</p>
           <p className="font-medium text-black">{item.qty} pcs</p>
        </div>
        <div>
           <p className="text-[11px] uppercase font-semibold text-[var(--color-ios-gray-2)] mb-0.5 tracking-wider">Project</p>
           <p className="font-medium text-black truncate">{item.projectCode}</p>
        </div>
        <div>
           <p className="text-[11px] uppercase font-semibold text-[var(--color-ios-gray-2)] mb-0.5 tracking-wider">Assigned</p>
           <p className="text-black">{item.assignedFormatted}</p>
        </div>
        <div>
           <p className="text-[11px] uppercase font-semibold text-[var(--color-ios-gray-2)] mb-0.5 tracking-wider">Deadline</p>
           <p className="text-black font-semibold text-orange-600">{item.deadlineFormatted}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-24">
      <TopBar onProfileClick={onProfileClick} />
      
      <main className="px-6 flex-1 w-full">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">Production</h1>

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

        {isLoading ? (
          <p className="text-center mt-10 text-[var(--color-ios-gray-2)]">Loading Production...</p>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-[17px] font-semibold text-black mb-4 px-1">To Make</h2>
              <div className="flex flex-col gap-3">
                {toMake.length > 0 ? toMake.map(item => (
                  <ProductionCard key={item.id} item={item} />
                )) : (
                  <p className="text-[15px] text-[var(--color-ios-gray-2)] px-1 italic">No productions to make.</p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-[17px] font-semibold text-black mb-4 px-1">Completed</h2>
              <div className="flex flex-col gap-3 opacity-70">
                 {completed.length > 0 ? completed.map(item => (
                  <ProductionCard key={item.id} item={item} />
                )) : (
                  <p className="text-[15px] text-[var(--color-ios-gray-2)] px-1 italic">No completed productions.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-[17px] font-semibold text-black mb-4 px-1">Cancelled</h2>
              <div className="flex flex-col gap-3 opacity-50 grayscale">
                 {cancelled.length > 0 ? cancelled.map(item => (
                  <ProductionCard key={item.id} item={item} />
                )) : (
                  <p className="text-[15px] text-[var(--color-ios-gray-2)] px-1 italic">No cancelled productions.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav activeTab="production" onTabChange={(tab) => { if(onNavTabChange) onNavTabChange(tab); }} />
    </div>
  );
}
