"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save, Edit } from "lucide-react";
import { getProductionTemplateById, deleteProductionTemplate } from "@/app/lib/recipeActionsSingular";

interface TemplateDetailScreenProps {
  templateId: string;
  onBack: () => void;
}

export default function TemplateDetailScreen({ templateId, onBack }: TemplateDetailScreenProps) {
  const [template, setTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const tRes = await getProductionTemplateById(templateId);
    if (tRes.success) setTemplate(tRes.template);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [templateId]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this production template?")) {
      const res = await deleteProductionTemplate(templateId);
      if (res.success) {
        onBack();
      } else {
        alert(res.error);
      }
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans pb-32 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center px-4 py-4 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 w-full">
        <button onClick={onBack} className="flex items-center text-[var(--color-ios-blue)] flex-1 text-[17px] font-medium active:opacity-70 transition-opacity">
          <ChevronLeft size={24} className="-ml-1" />
          <span>Back</span>
        </button>
        <span className="font-bold text-black text-[17px] flex-[2] text-center truncate">{template?.name}</span>
        <div className="flex-1 flex justify-end gap-3 text-[var(--color-ios-gray-2)]">
           <Save size={20} className="hover:text-black cursor-pointer active:opacity-70 transition-opacity" />
           <Edit onClick={() => alert("Edit mode is coming soon!")} size={20} className="text-[var(--color-ios-blue)] cursor-pointer active:opacity-70 transition-opacity" />
        </div>
      </div>

      <div className="px-6 mt-4 space-y-8 w-full">
        {/* Menu Name */}
        <div className="mb-6">
          <h2 className="text-[15px] font-bold text-black mb-3">Menu Name</h2>
          <div className="w-full bg-white rounded-xl py-3.5 px-4 shadow-sm border border-[#E5E5EA]">
             <span className="text-[17px] text-black">{template?.name}</span>
          </div>
        </div>

        <hr className="border-[#E5E5EA] mb-6" />

        {/* Ingredients */}
        <div className="mb-6">
          <h2 className="text-[15px] font-bold text-black mb-3">Ingredients I</h2>
          
          <div className="space-y-3">
             {template?.ingredients?.length > 0 ? template.ingredients.map((ing: any, i: number) => (
                <div key={ing.id} className="flex gap-3 items-center">
                   <div className="flex-[2] bg-white rounded-xl py-3.5 px-4 shadow-sm border border-[#E5E5EA] text-[17px] text-black truncate">{ing.name}</div>
                   <div className="flex-[1] bg-white rounded-xl py-3.5 px-4 shadow-sm border border-[#E5E5EA] text-[17px] text-black truncate">{ing.quantity}{ing.unit}</div>
                </div>
             )) : (
                <p className="text-[#C7C7CC] text-[15px] italic">No ingredients found.</p>
             )}
          </div>
        </div>

        <hr className="border-[#E5E5EA] mb-6" />

        {/* Execution Flows */}
        <div className="mb-6">
          <h2 className="text-[15px] font-bold text-black mb-3">Execution Flow I</h2>
          
          <div className="space-y-3">
             {template?.flows?.length > 0 ? template.flows.map((flow: any, i: number) => (
                <div key={flow.id} className="w-full bg-white rounded-xl py-3.5 px-4 shadow-sm border border-[#E5E5EA] text-[17px] text-black truncate">
                   {flow.name}
                </div>
             )) : (
                <p className="text-[#C7C7CC] text-[15px] italic">No execution flows found.</p>
             )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent pointer-events-none z-10 pb-[env(safe-area-inset-bottom)]">
         <div className="pointer-events-auto shadow-[0_-20px_20px_-10px_rgba(245,245,247,0.9)]">
           <button 
              onClick={handleDelete}
              className="w-full py-4 rounded-full font-semibold text-[17px] transition-colors bg-white text-[#FF3B30] border border-[#FF3B30] active:bg-[#FF3B30]/10"
           >
             Delete Template
           </button>
         </div>
      </div>
    </div>
  );
}
