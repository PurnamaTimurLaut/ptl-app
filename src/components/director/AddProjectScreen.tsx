"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, X } from "lucide-react";
import { createProject } from "@/app/lib/projectActions";

interface AddProjectScreenProps {
  onBack: () => void;
  onCreate: (data: any) => void;
}

interface ProductionBlock {
  id: number;
  menu: string;
  quantity: string;
  assignedTime: string;
  assignedDate: string;
  deadlineTime: string;
  deadlineDate: string;
}

export default function AddProjectScreen({ onBack, onCreate }: AddProjectScreenProps) {
  const [projectName, setProjectName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [productions, setProductions] = useState<ProductionBlock[]>([{
    id: 1,
    menu: "",
    quantity: "",
    assignedTime: "",
    assignedDate: "",
    deadlineTime: "",
    deadlineDate: ""
  }]);

  const addProduction = () => {
    setProductions(prev => [...prev, {
      id: prev.length + 1,
      menu: "",
      quantity: "",
      assignedTime: "",
      assignedDate: "",
      deadlineTime: "",
      deadlineDate: ""
    }]);
  };

  const updateProduction = (id: number, key: keyof ProductionBlock, value: string) => {
    setProductions(prev => prev.map(p => p.id === id ? { ...p, [key]: value } : p));
  };

  const isProjectDetailsValid = useMemo(() => {
    if (!projectName || !startTime || !startDate || !endTime || !endDate || !budget) return false;
    const globalStart = new Date(`${startDate}T${startTime}`).getTime();
    const globalEnd = new Date(`${endDate}T${endTime}`).getTime();
    return globalStart < globalEnd;
  }, [projectName, startTime, startDate, endTime, endDate, budget]);

  const isFormValid = useMemo(() => {
    if (!isProjectDetailsValid) return false;
    
    const globalStart = new Date(`${startDate}T${startTime}`).getTime();
    const globalEnd = new Date(`${endDate}T${endTime}`).getTime();

    if (globalStart >= globalEnd) return false;

    for (const p of productions) {
      if (!p.menu || !p.quantity || !p.assignedTime || !p.assignedDate || !p.deadlineTime || !p.deadlineDate) {
        return false;
      }

      const pStart = new Date(`${p.assignedDate}T${p.assignedTime}`).getTime();
      const pEnd = new Date(`${p.deadlineDate}T${p.deadlineTime}`).getTime();

      if (pStart >= pEnd) return false;
      if (pStart < globalStart || pEnd > globalEnd) return false;
    }
    return true;
  }, [projectName, startTime, startDate, endTime, endDate, budget, productions]);

  const handleCreate = async () => {
    setIsSubmitting(true);
    
    // Combine date and time for Prisma (if needed) or just format it as string.
    // We are trusting the action to parse ISO dates, so let's format them properly:
    const startIso = new Date(`${startDate}T${startTime}`).toISOString();
    const endIso = new Date(`${endDate}T${endTime}`).toISOString();

    const formattedProductions = productions.map(p => ({
      menuId: p.menu,
      quantity: parseInt(p.quantity, 10),
      assignedDate: new Date(`${p.assignedDate}T${p.assignedTime}`).toISOString(),
      deadlineDate: new Date(`${p.deadlineDate}T${p.deadlineTime}`).toISOString(),
    }));

    const result = await createProject({
      name: projectName,
      startDate: startIso,
      endDate: endIso,
      budget: parseFloat(budget),
      productions: formattedProductions
    });

    setIsSubmitting(false);

    if (result.success) {
      onCreate(result.project);
    } else {
      alert("Failed to create project");
    }
  };

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  // Helper functions for dynamic time limits
  const getMinTime = (dateToCheck: string, limitDate: string, limitTime: string) => {
    return dateToCheck && dateToCheck === limitDate ? limitTime : undefined;
  };
  const getMaxTime = (dateToCheck: string, limitDate: string, limitTime: string) => {
    return dateToCheck && dateToCheck === limitDate ? limitTime : undefined;
  };

  const isProjectDateInvalid = useMemo(() => {
    if (startDate && startTime && endDate && endTime) {
      return new Date(`${startDate}T${startTime}`).getTime() >= new Date(`${endDate}T${endTime}`).getTime();
    }
    return false;
  }, [startDate, startTime, endDate, endTime]);

  const getProductionError = (p: ProductionBlock) => {
    if (!startDate || !startTime || !endDate || !endTime) return null;
    if (!p.assignedDate || !p.assignedTime || !p.deadlineDate || !p.deadlineTime) return null;

    const globalStart = new Date(`${startDate}T${startTime}`).getTime();
    const globalEnd = new Date(`${endDate}T${endTime}`).getTime();
    const pStart = new Date(`${p.assignedDate}T${p.assignedTime}`).getTime();
    const pEnd = new Date(`${p.deadlineDate}T${p.deadlineTime}`).getTime();

    if (pStart >= pEnd) {
      return "Assignment Date must be before Deadline Date.";
    }
    if (pStart < globalStart || pEnd > globalEnd) {
      return "Production dates must fall within the project's overall date range.";
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-ios-gray-6)] font-sans pb-12">
      {/* Header */}
      <div className="bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md sticky top-0 z-20 px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-[var(--color-ios-blue)]">
          <ChevronLeft size={24} />
          <span className="text-[17px] -ml-1">Back</span>
        </button>
        <span className="font-semibold text-black text-[17px]">Add New Project</span>
        <div className="w-[60px]" /> {/* spacer */}
      </div>

      <div className="px-5 mt-2 space-y-5">
        
        {/* Project Details */}
        <div>
          <label className="block text-[15px] font-semibold text-black mb-1.5">Project Name</label>
          <div className="relative border border-[var(--color-ios-gray-5)] rounded-xl bg-white shadow-sm overflow-hidden">
            <input 
              type="text" placeholder="Enter Title..." 
              value={projectName} onChange={e => setProjectName(e.target.value)}
              className="w-full bg-transparent py-3 pl-4 pr-10 text-[15px] text-black outline-none placeholder:text-[var(--color-ios-gray-3)]" 
            />
            {projectName && <button onClick={() => setProjectName('')} className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--color-ios-gray-3)] text-white rounded-full p-0.5"><X size={14}/></button>}
          </div>
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-black mb-1.5">Start Date</label>
          <div className="flex gap-3">
             <div className="relative flex-1 border border-[var(--color-ios-gray-5)] rounded-xl bg-white shadow-sm overflow-hidden">
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none" />
             </div>
             <div className="relative flex-1 border border-[var(--color-ios-gray-5)] rounded-xl bg-white shadow-sm overflow-hidden">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none" />
             </div>
          </div>
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-black mb-1.5">End Date</label>
          <div className="flex gap-3">
             <div className="relative flex-1 border border-[var(--color-ios-gray-5)] rounded-xl bg-white shadow-sm overflow-hidden">
                <input 
                   type="time" 
                   min={getMinTime(endDate, startDate, startTime)}
                   value={endTime} onChange={e => setEndTime(e.target.value)} 
                   className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none" 
                />
             </div>
             <div className="relative flex-1 border border-[var(--color-ios-gray-5)] rounded-xl bg-white shadow-sm overflow-hidden">
                <input type="date" min={startDate} value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none" />
             </div>
          </div>
          {isProjectDateInvalid && (
             <p className="text-[13px] text-red-500 mt-2 ml-1">
                Please make sure the End Date and Time is after the Start Date and Time.
             </p>
          )}
        </div>

        <div>
           <label className="block text-[15px] font-semibold text-black mb-1.5">Budget (Rp)</label>
           <div className="relative border border-[var(--color-ios-gray-5)] rounded-xl bg-white shadow-sm overflow-hidden">
             <input type="number" placeholder="Enter Budget..." value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-transparent py-3 pl-4 pr-10 text-[15px] text-black outline-none placeholder:text-[var(--color-ios-gray-3)]" />
             {budget && <button onClick={() => setBudget('')} className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--color-ios-gray-3)] text-white rounded-full p-0.5"><X size={14}/></button>}
           </div>
        </div>

        <hr className="border-[var(--color-ios-gray-3)]/30 my-6" />

        {/* Productions */}
        {productions.map((p, index) => (
           <div key={p.id} className={`space-y-4 mb-8 transition-opacity duration-300 ${!isProjectDetailsValid ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="text-center font-bold text-black text-[16px] mb-2">Production {romanNumerals[index] || index + 1}</h3>
              
              <div className={`flex gap-3`}>
                 <div className="flex-1">
                    <label className="block text-[15px] font-semibold text-black mb-1.5">Menu</label>
                    <div className={`relative border border-[var(--color-ios-gray-5)] rounded-xl shadow-sm overflow-hidden ${!isProjectDetailsValid ? 'bg-gray-100' : 'bg-white'}`}>
                      <select disabled={!isProjectDetailsValid} value={p.menu} onChange={e => updateProduction(p.id, 'menu', e.target.value)} className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none appearance-none">
                         <option value="" disabled>Search</option>
                         <option value="Ayam Suwir Cabe Ijo">Ayam Suwir Cabe Ijo</option>
                         <option value="Dendeng Balado">Dendeng Balado</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-ios-gray-3)]">
                         <ChevronLeft className="-rotate-90" size={16} />
                      </div>
                    </div>
                 </div>
                 <div className="flex-1">
                    <label className="block text-[15px] font-semibold text-black mb-1.5">Quantity</label>
                    <div className={`relative border border-[var(--color-ios-gray-5)] rounded-xl shadow-sm overflow-hidden ${!isProjectDetailsValid ? 'bg-gray-100' : 'bg-white'}`}>
                       <input disabled={!isProjectDetailsValid} type="number" placeholder="Enter Quantity" value={p.quantity} onChange={e => updateProduction(p.id, 'quantity', e.target.value)} className="w-full bg-transparent py-3 pl-4 pr-10 text-[15px] text-black outline-none placeholder:text-[var(--color-ios-gray-3)]" />
                       {p.quantity && <button onClick={() => updateProduction(p.id, 'quantity', '')} className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--color-ios-gray-3)] text-white rounded-full p-0.5"><X size={14}/></button>}
                    </div>
                 </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-black mb-1.5">Assignment Date</label>
                <div className="flex gap-3">
                   <div className={`flex-1 border border-[var(--color-ios-gray-5)] rounded-xl shadow-sm overflow-hidden ${!isProjectDetailsValid ? 'bg-gray-100' : 'bg-white'}`}>
                      <input 
                         disabled={!isProjectDetailsValid}
                         type="time" 
                         min={getMinTime(p.assignedDate, startDate, startTime)}
                         max={getMaxTime(p.assignedDate, endDate, endTime)}
                         value={p.assignedTime} onChange={e => updateProduction(p.id, 'assignedTime', e.target.value)} 
                         className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none" 
                      />
                   </div>
                   <div className={`flex-1 border border-[var(--color-ios-gray-5)] rounded-xl shadow-sm overflow-hidden ${!isProjectDetailsValid ? 'bg-gray-100' : 'bg-white'}`}>
                      <input disabled={!isProjectDetailsValid} type="date" min={startDate} max={endDate} value={p.assignedDate} onChange={e => updateProduction(p.id, 'assignedDate', e.target.value)} className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none" />
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-black mb-1.5">Deadline Date</label>
                <div className="flex gap-3">
                   <div className={`flex-1 border border-[var(--color-ios-gray-5)] rounded-xl shadow-sm overflow-hidden ${!isProjectDetailsValid ? 'bg-gray-100' : 'bg-white'}`}>
                      <input 
                         disabled={!isProjectDetailsValid}
                         type="time" 
                         min={getMinTime(p.deadlineDate, p.assignedDate, p.assignedTime) || getMinTime(p.deadlineDate, startDate, startTime)}
                         max={getMaxTime(p.deadlineDate, endDate, endTime)}
                         value={p.deadlineTime} onChange={e => updateProduction(p.id, 'deadlineTime', e.target.value)} 
                         className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none" 
                      />
                   </div>
                   <div className={`flex-1 border border-[var(--color-ios-gray-5)] rounded-xl shadow-sm overflow-hidden ${!isProjectDetailsValid ? 'bg-gray-100' : 'bg-white'}`}>
                      <input disabled={!isProjectDetailsValid} type="date" min={p.assignedDate || startDate} max={endDate} value={p.deadlineDate} onChange={e => updateProduction(p.id, 'deadlineDate', e.target.value)} className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none" />
                   </div>
                </div>
                {getProductionError(p) && (
                   <p className="text-[13px] text-red-500 mt-2 ml-1">
                      {getProductionError(p)}
                   </p>
                )}
              </div>
           </div>
        ))}
        
        {!isProjectDetailsValid && (
           <p className="text-center text-[13px] text-[var(--color-ios-gray-2)] -mt-4 mb-4">
               Please complete the Project Details above first.
           </p>
        )}

        <div className="space-y-3 pt-2">
           <button disabled={!isProjectDetailsValid} onClick={addProduction} className={`w-full py-3 border border-[var(--color-ios-blue)] rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors ${!isProjectDetailsValid ? 'text-[var(--color-ios-blue)]/50 border-[var(--color-ios-blue)]/50 cursor-not-allowed' : 'text-[var(--color-ios-blue)] hover:bg-[var(--color-ios-blue)]/5'}`}>
              + Add Production
           </button>
           <button 
             disabled={!isFormValid || isSubmitting}
             onClick={handleCreate} 
             className={`w-full py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center transition-colors
                ${isFormValid ? 'bg-[var(--color-ios-blue)] text-white shadow-sm' : 'bg-black/10 text-black/40 cursor-not-allowed'}
             `}>
              {isSubmitting ? "Creating..." : "Create New Project"}
           </button>
        </div>

      </div>
    </div>
  );
}
