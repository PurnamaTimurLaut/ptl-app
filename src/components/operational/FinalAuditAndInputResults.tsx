"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, Info, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FinalAuditItem {
  id: string;
  name: string;
  unit: string;
  amountAfterInitialAudit: number;
  amountBought: number;
  amountUsed: number;
  actualEndAmount?: number;
}

interface FinalAuditAndInputResultsProps {
  onBackToProduction: (completed: boolean, results?: { quantity: string, time: string }) => void;
  isCompleted?: boolean;
  initialAuditData?: any[] | null;
  shoppingData?: any[] | null;
}

export default function FinalAuditAndInputResults({ 
  onBackToProduction, 
  isCompleted, 
  initialAuditData, 
  shoppingData 
}: FinalAuditAndInputResultsProps) {
  const [view, setView] = useState<'form' | 'success'>('form');

  // Logic to calculate ingredients data
  const [ingredients, setIngredients] = useState<FinalAuditItem[]>(() => {
    // Mock recipe usage values (would normally come from DB)
    const mockRecipeUsage: Record<string, number> = {
      "Dada Ayam": 980,
      "Cabe Hijau": 500
    };

    const baseIngredients = [
      { id: "1", name: "Dada Ayam", unit: "gr" },
      { id: "2", name: "Cabe Hijau", unit: "gr" },
    ];

    return baseIngredients.map(ing => {
      // 1. Get Initial Audit Amount
      const initial = initialAuditData?.find(a => a.name === ing.name)?.actualAmount || 0;
      
      // 2. Get Amount Bought (aggregate from all shopping transactions)
      let bought = 0;
      if (shoppingData) {
        shoppingData.forEach(tx => {
          tx.items?.forEach((item: any) => {
            if (item.name === ing.name) {
              const amount = parseInt(item.amountBought?.replace(/[^0-9]/g, '')) || 0;
              bought += amount;
            }
          });
        });
      }

      // 3. Get Amount Used from Recipe Template
      const used = mockRecipeUsage[ing.name] || 0;

      return {
        ...ing,
        amountAfterInitialAudit: initial,
        amountBought: bought,
        amountUsed: used,
        actualEndAmount: undefined
      };
    });
  });

  const [finishedQuantity, setFinishedQuantity] = useState("");
  const [finishedDateTime, setFinishedDateTime] = useState("");

  const handleAuditChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, actualEndAmount: isNaN(numValue) ? undefined : numValue } : ing
    ));
  };

  const isAllFilled = useMemo(() => {
    const auditFilled = ingredients.every(ing => ing.actualEndAmount !== undefined);
    const resultsFilled = finishedQuantity.trim() !== "" && finishedDateTime.trim() !== "";
    return auditFilled && resultsFilled;
  }, [ingredients, finishedQuantity, finishedDateTime]);

  const handleCompleteTask = () => {
    setView('success');
  };

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col items-center justify-center px-6 font-sans text-center">
        <div className="w-32 h-32 rounded-full border-[6px] border-[var(--color-ios-blue)] flex items-center justify-center mb-8">
          <Check size={64} className="text-[var(--color-ios-blue)]" strokeWidth={3} />
        </div>
        <h1 className="text-[28px] font-bold text-black mb-12 max-w-[280px] leading-tight mx-auto">
          You Have Successfully Completed the Task
        </h1>
        <div className="w-full max-w-sm mt-auto pb-12">
           <Button variant="primary" fullWidth onClick={() => onBackToProduction(true, { quantity: finishedQuantity, time: finishedDateTime })}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-12">
      {/* Header */}
      <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
        <button 
          onClick={() => onBackToProduction(false)}
          className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
        >
          <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
          <span className="text-[17px] font-medium">Back</span>
        </button>
      </div>

      <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-2">
        <h1 className="text-[22px] font-bold text-center text-black mb-8 px-4">
          Final Audit and Input Results
        </h1>

        {/* Section 1: Final Audit */}
        <div className="flex flex-col gap-4 mb-4">
          {ingredients.map((ing) => {
            const expectedEnd = ing.amountAfterInitialAudit + ing.amountBought - ing.amountUsed;
            return (
              <div key={ing.id} className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-2xl font-bold text-black mb-6">{ing.name}</h3>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Amount After Initial Audit</label>
                      <Info size={12} className="text-[var(--color-ios-blue)]" />
                    </div>
                    <p className="text-[24px] font-light text-[var(--color-ios-gray-3)]">{ing.amountAfterInitialAudit}{ing.unit}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Amount Bought</label>
                      <Info size={12} className="text-[var(--color-ios-blue)]" />
                    </div>
                    <p className="text-[24px] font-light text-[var(--color-ios-gray-3)]">{ing.amountBought}{ing.unit}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Amount Used</label>
                      <Info size={12} className="text-[var(--color-ios-blue)]" />
                    </div>
                    <p className="text-[24px] font-light text-[var(--color-ios-gray-3)]">{ing.amountUsed}{ing.unit}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Expected End Amount</label>
                      <Info size={12} className="text-[var(--color-ios-blue)]" />
                    </div>
                    <p className="text-[24px] font-light text-[var(--color-ios-gray-3)]">{expectedEnd}{ing.unit}</p>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Actual End Amount</label>
                      <Info size={12} className="text-[var(--color-ios-blue)]" />
                    </div>
                    <div className="flex items-center mt-1 border-b border-[var(--color-ios-gray-5)] focus-within:border-[var(--color-ios-blue)] transition-colors">
                      <input 
                        type="number"
                        placeholder="Enter Amount..."
                        className="w-full py-1 text-[20px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-5)]"
                        value={ing.actualEndAmount ?? ""}
                        onChange={(e) => handleAuditChange(ing.id, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-[1px] bg-black/40 w-full my-6"></div>

        {/* Section 2: Input Results */}
        <div className="space-y-6 mb-12">
          <div>
            <h3 className="text-[18px] font-bold text-black mb-3">Finished Quantity</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="... pcs" 
                className="w-full bg-white rounded-2xl py-4 px-5 text-[18px] text-black outline-none placeholder:text-[var(--color-ios-gray-4)] shadow-sm"
                value={finishedQuantity}
                onChange={(e) => setFinishedQuantity(e.target.value)}
              />
              {finishedQuantity && (
                <button 
                  onClick={() => setFinishedQuantity("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-[var(--color-ios-gray-3)] rounded-full flex items-center justify-center text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[18px] font-bold text-black mb-3">Finished Time and Date</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="HH:MM, DD/MM/YYYY" 
                className="w-full bg-white rounded-2xl py-4 px-5 text-[18px] text-black outline-none placeholder:text-[var(--color-ios-gray-4)] shadow-sm"
                value={finishedDateTime}
                onChange={(e) => setFinishedDateTime(e.target.value)}
              />
              {finishedDateTime && (
                <button 
                  onClick={() => setFinishedDateTime("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-[var(--color-ios-gray-3)] rounded-full flex items-center justify-center text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <Button 
          variant="primary" 
          fullWidth 
          disabled={!isAllFilled}
          className={!isAllFilled ? "bg-[var(--color-ios-gray-4)] text-[var(--color-ios-gray-2)]" : ""}
          onClick={handleCompleteTask}
        >
          Complete Task
        </Button>
      </main>
    </div>
  );
}
