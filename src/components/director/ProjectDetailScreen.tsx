"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Edit, Save, AlertTriangle } from "lucide-react";
import { getProjectById, updateProjectDetails, updateProjectStatus } from "@/app/lib/projectActions";

interface ProjectDetailScreenProps {
  projectId: string;
  onBack: () => void;
}

export default function ProjectDetailScreen({ projectId, onBack }: ProjectDetailScreenProps) {
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit State
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

  const [showConfirm, setShowConfirm] = useState<"COMPLETE" | "CANCEL" | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getProjectById(projectId);
      if (res.success && res.project) {
        setProject(res.project);
        setName(res.project.name);
        setBudget(res.project.budget.toString());
        
        // Strip out the time from ISO for the date inputs
        if (res.project.startDate) setStartDate(new Date(res.project.startDate).toISOString().split('T')[0]);
        if (res.project.endDate) setEndDate(new Date(res.project.endDate).toISOString().split('T')[0]);
      }
      setIsLoading(false);
    }
    load();
  }, [projectId]);

  const handleSave = async () => {
    setIsSaving(true);
    // Build ISO dates for the DB (assuming time is not edited here, keeping it generic)
    const res = await updateProjectDetails(projectId, {
      name,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      budget: parseFloat(budget) || 0
    });

    if (res.success) {
      setProject({ ...project, name, startDate: new Date(startDate), endDate: new Date(endDate), budget: parseFloat(budget) });
      setIsEditing(false);
    } else {
      alert("Failed to save project updates.");
    }
    setIsSaving(false);
  };

  const handleStatusChange = async (status: "COMPLETED" | "CANCELLED") => {
    setIsActioning(true);
    const res = await updateProjectStatus(projectId, status);
    setIsActioning(false);
    if (res.success) {
      onBack(); // Go back to projects list after status change
    } else {
      alert(`Failed to ${status.toLowerCase()} project.`);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex items-center justify-center">Loading...</div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col items-center justify-center">
       <p className="text-black mb-4">Project not found.</p>
       <button onClick={onBack} className="text-[var(--color-ios-blue)]">Go Back</button>
    </div>;
  }

  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
  };

  // Cannot edit if it's already completed or cancelled
  const canEdit = project.status === "RUNNING";

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-ios-gray-6)] font-sans pb-12 relative">
      {/* Header */}
      <div className="bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md sticky top-0 z-20 px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-[var(--color-ios-blue)] flex-1">
          <ChevronLeft size={24} />
          <span className="text-[17px] -ml-1">Back</span>
        </button>
        <span className="font-semibold text-black text-[17px] flex-1 text-center">{project.name || project.id}</span>
        
        <div className="flex-1 flex justify-end gap-3">
           {canEdit && (
              <>
                 <button disabled={!isEditing || isSaving} onClick={handleSave} className={`${isEditing ? 'text-[var(--color-ios-blue)]' : 'text-[var(--color-ios-gray-3)]'}`}>
                   {isSaving ? <span className="text-sm">...</span> : <Save size={20} />}
                 </button>
                 <button onClick={() => setIsEditing(!isEditing)} className={`${!isEditing ? 'text-[var(--color-ios-blue)]' : 'text-[var(--color-ios-gray-3)]'}`}>
                   <Edit size={20} />
                 </button>
              </>
           )}
        </div>
      </div>

      <div className="px-5 mt-4 space-y-4">
        
        {/* Project Details */}
        <div>
          <label className="block text-[15px] font-semibold text-black mb-1.5">Project Name</label>
          <div className="border border-[var(--color-ios-gray-5)] rounded-xl bg-white shadow-sm overflow-hidden">
            <input 
              type="text" 
              value={name} onChange={e => setName(e.target.value)}
              disabled={!isEditing}
              className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none disabled:bg-[var(--color-ios-gray-6)] disabled:text-black/60" 
            />
          </div>
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-black mb-1.5">Start Date</label>
          <div className="border border-[var(--color-ios-gray-5)] rounded-xl bg-white shadow-sm overflow-hidden">
            <input 
              type="date" 
              value={startDate} onChange={e => setStartDate(e.target.value)}
              disabled={!isEditing}
              className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none disabled:bg-[var(--color-ios-gray-6)] disabled:text-black/60" 
            />
          </div>
        </div>

        <div>
           <label className="block text-[15px] font-semibold text-black mb-1.5">End Date</label>
           <div className="border border-[var(--color-ios-gray-5)] rounded-xl bg-white shadow-sm overflow-hidden">
             <input 
               type="date" 
               min={startDate} 
               value={endDate} onChange={e => setEndDate(e.target.value)}
               disabled={!isEditing}
               className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none disabled:bg-[var(--color-ios-gray-6)] disabled:text-black/60" 
             />
           </div>
        </div>

        <div>
           <label className="block text-[15px] font-semibold text-black mb-1.5">Budget (Rp)</label>
           <div className="border border-[var(--color-ios-gray-5)] rounded-xl bg-white shadow-sm overflow-hidden">
             {isEditing ? (
                <input 
                  type="number" 
                  value={budget} onChange={e => setBudget(e.target.value)}
                  className="w-full bg-transparent py-3 px-4 text-[15px] text-black outline-none disabled:bg-[var(--color-ios-gray-6)] disabled:text-black/60" 
                />
             ) : (
                <div className="w-full bg-[var(--color-ios-gray-6)] py-3 px-4 text-[15px] text-black/60">
                   {formatRupiah(parseFloat(budget) || 0)}
                </div>
             )}
           </div>
        </div>

        <hr className="border-[var(--color-ios-gray-3)]/30 my-6" />

        {/* Productions Display - Readonly as per constraints */}
        {project.productions?.map((p: any, index: number) => (
           <div key={p.id} className="space-y-4 mb-8">
              <h3 className="text-[17px] font-bold text-black mb-1">Production {index + 1}</h3>
              <p className="text-[13px] text-[var(--color-ios-gray-2)] -mt-2 mb-2">
                 Menu ID: {p.menuId}<br/>
                 Status: {p.status}
              </p>
              
              <div className="flex gap-3">
                 <div className="flex-1">
                    <label className="block text-sm font-semibold text-[var(--color-ios-gray-1)] mb-1">Menu</label>
                    <div className="bg-[var(--color-ios-gray-6)] rounded-xl py-3 px-4 text-[15px] text-black/60 border border-[var(--color-ios-gray-5)]">
                       {p.menuId}
                    </div>
                 </div>
                 <div className="flex-1">
                    <label className="block text-sm font-semibold text-[var(--color-ios-gray-1)] mb-1">Quantity</label>
                    <div className="bg-[var(--color-ios-gray-6)] rounded-xl py-3 px-4 text-[15px] text-black/60 border border-[var(--color-ios-gray-5)]">
                       {p.quantity}
                    </div>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ios-gray-1)] mb-1">Assignment Date</label>
                <div className="bg-[var(--color-ios-gray-6)] rounded-xl py-3 px-4 text-[15px] text-black/60 border border-[var(--color-ios-gray-5)]">
                   {new Date(p.assignedDate).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ios-gray-1)] mb-1">Deadline Date</label>
                <div className="bg-[var(--color-ios-gray-6)] rounded-xl py-3 px-4 text-[15px] text-black/60 border border-[var(--color-ios-gray-5)]">
                   {new Date(p.deadlineDate).toLocaleDateString()}
                </div>
              </div>
           </div>
        ))}

        {canEdit && (
           <div className="space-y-3 pt-6">
              <button 
                onClick={() => setShowConfirm("COMPLETE")}
                className="w-full py-3.5 border border-red-500 rounded-full text-red-500 font-semibold text-[15px]"
              >
                 Declare as Complete
              </button>
              <button 
                onClick={() => setShowConfirm("CANCEL")}
                className="w-full py-3.5 border border-red-500 rounded-full text-red-500 font-semibold text-[15px]"
              >
                 Cancel Project
              </button>
           </div>
        )}

      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
         <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center text-center">
               <AlertTriangle size={36} className="text-red-500 mb-3" />
               <h3 className="text-xl font-bold text-black mb-2">Are you sure?</h3>
               <p className="text-[15px] text-[var(--color-ios-gray-1)] mb-6 leading-tight">
                 This action will mark the project as <strong>{showConfirm}</strong> and remove it from the Running list permanently. This cannot be undone easily.
               </p>
               <div className="flex gap-3 w-full">
                  <button 
                     disabled={isActioning}
                     onClick={() => setShowConfirm(null)} 
                     className="flex-1 py-3 rounded-full bg-[var(--color-ios-gray-6)] text-black font-semibold"
                  >
                     Go Back
                  </button>
                  <button 
                     disabled={isActioning}
                     onClick={() => handleStatusChange(showConfirm === "COMPLETE" ? "COMPLETED" : "CANCELLED")} 
                     className="flex-1 py-3 rounded-full bg-red-500 text-white font-semibold flex items-center justify-center"
                  >
                     {isActioning ? "..." : `Confirm`}
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
