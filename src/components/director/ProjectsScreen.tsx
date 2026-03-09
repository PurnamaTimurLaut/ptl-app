"use client";

import { useState, useEffect } from "react";
import { Search, ChevronRight, Inbox } from "lucide-react";
import { getProjects } from "@/app/lib/projectActions";

interface ProjectsScreenProps {
  onAddProject: () => void;
  onViewProject: (id: string) => void;
}

export default function ProjectsScreen({ onAddProject, onViewProject }: ProjectsScreenProps) {
  const [runningProjects, setRunningProjects] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [cancelledProjects, setCancelledProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const result = await getProjects();
      if (result.success && result.projects) {
        setRunningProjects(result.projects.filter((p: any) => p.status === "RUNNING"));
        setCompletedProjects(result.projects.filter((p: any) => p.status === "COMPLETED"));
        setCancelledProjects(result.projects.filter((p: any) => p.status === "CANCELLED"));
      }
      setIsLoading(false);
    }
    fetchProjects();
  }, []);

  const formatDate = (date: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-ios-gray-6)] font-sans pb-24 relative">
      <div className="px-5 pt-16 flex items-center justify-between">
         <h1 className="text-[34px] font-bold text-black tracking-tight">Projects</h1>
         {/* User icon placeholder */}
         <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
             {/* Using a generic user icon */}
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white bg-gray-300 w-full h-full pt-2">
                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
             </svg>
         </div>
      </div>

      <div className="px-5 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ios-gray-3)]" size={18} />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-[var(--color-ios-gray-5)] rounded-xl py-2 pl-10 pr-4 text-[17px] text-black placeholder:text-[var(--color-ios-gray-3)] outline-none"
          />
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">
         <div>
            <h2 className="text-[17px] font-semibold text-black mb-3">Running</h2>
            <div className="space-y-3">
               {isLoading ? (
                  <p className="text-[15px] text-[var(--color-ios-gray-2)]">Loading...</p>
               ) : runningProjects.length > 0 ? (
                  runningProjects.map(p => (
                     <div key={p.id} className="bg-white rounded-xl p-4 flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md transition-shadow" onClick={() => onViewProject(p.id)}>
                        <div>
                           <h3 className="text-[17px] font-semibold text-black">{p.name || p.id}</h3>
                           <p className="text-[13px] text-[var(--color-ios-gray-2)]">Quantity: {p._count?.productions || 0} batches</p>
                           <p className="text-[13px] text-[var(--color-ios-gray-2)]">Start Date: {formatDate(p.startDate)}</p>
                        </div>
                        <ChevronRight className="text-[var(--color-ios-gray-3)]" size={20} />
                     </div>
                  ))
               ) : (
                  <p className="text-[15px] text-[var(--color-ios-gray-2)] pb-2">Nothing to show here.</p>
               )}
               
               <button onClick={onAddProject} className="w-full py-3 border border-[var(--color-ios-blue)] rounded-full text-[var(--color-ios-blue)] font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[var(--color-ios-blue)]/5 transition-colors">
                  + Add New Project
               </button>
            </div>
         </div>

         <div>
            <h2 className="text-[17px] font-semibold text-black mb-3">Completed</h2>
            {isLoading ? <p className="text-[15px] text-[var(--color-ios-gray-2)]">Loading...</p> : completedProjects.length > 0 ? (
               <div className="space-y-3">
                  {completedProjects.map(p => (
                     <div key={p.id} className="bg-white rounded-xl p-4 flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md transition-shadow" onClick={() => onViewProject(p.id)}>
                        <div>
                           <h3 className="text-[17px] font-semibold text-black">{p.name || p.id}</h3>
                           <p className="text-[13px] text-[var(--color-ios-gray-2)]">Start Date: {formatDate(p.startDate)}</p>
                        </div>
                        <ChevronRight className="text-[var(--color-ios-gray-3)]" size={20} />
                     </div>
                  ))}
               </div>
            ) : (
               <p className="text-[15px] text-[var(--color-ios-gray-2)]">Nothing to show here.</p>
            )}
         </div>

         <div>
            <h2 className="text-[17px] font-semibold text-black mb-3">Cancelled</h2>
            {isLoading ? <p className="text-[15px] text-[var(--color-ios-gray-2)]">Loading...</p> : cancelledProjects.length > 0 ? (
               <div className="space-y-3">
                  {cancelledProjects.map(p => (
                     <div key={p.id} className="bg-white/50 rounded-xl p-4 flex items-center justify-between shadow-sm opacity-60">
                        <div>
                           <h3 className="text-[17px] font-semibold text-black line-through">{p.name || p.id}</h3>
                           <p className="text-[13px] text-[var(--color-ios-gray-2)]">Start Date: {formatDate(p.startDate)}</p>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <p className="text-[15px] text-[var(--color-ios-gray-2)]">Nothing to show here.</p>
            )}
         </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md border-t border-[var(--color-ios-gray-4)] pb-safe pt-2 px-6 flex justify-around items-center z-50">
        <button className="flex flex-col items-center gap-1 min-w-[64px] pb-2">
          <Inbox size={26} className="text-[var(--color-ios-blue)]" strokeWidth={1.5} />
          <span className="text-[10px] font-medium text-[var(--color-ios-blue)]">Projects</span>
        </button>
      </div>

    </div>
  );
}
