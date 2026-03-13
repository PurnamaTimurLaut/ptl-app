"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, Check, Info, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AuditIngredient {
  id: string;
  name: string;
  systemAmount: number; // in gr
  unit: string;
  actualAmount?: number;
}

interface InitialAuditFlowProps {
  onBackToBatch: (completed: boolean, auditData?: AuditIngredient[]) => void;
  isCompleted?: boolean;
}

export default function InitialAuditFlow({ onBackToBatch, isCompleted }: InitialAuditFlowProps) {
  const [view, setView] = useState<'audit' | 'review' | 'success'>('audit');
  
  // Initial ingredients list - typically fetched based on batch/menu
  const [ingredients, setIngredients] = useState<AuditIngredient[]>([
    { id: "1", name: "Dada Ayam", systemAmount: 20, unit: "gr" },
    { id: "2", name: "Cabe Hijau", systemAmount: 600, unit: "gr" },
  ]);

  const handleInputChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, actualAmount: isNaN(numValue) ? undefined : numValue } : ing
    ));
  };

  const isAllFilled = useMemo(() => {
    return ingredients.every(ing => ing.actualAmount !== undefined);
  }, [ingredients]);

  const handleAuditComplete = () => {
    setView('review');
  };

  const handleFinalComplete = () => {
    // In real app: call server action to adjust inventory
    setView('success');
  };

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col items-center justify-center px-6 font-sans">
        <div className="w-32 h-32 rounded-full border-[6px] border-[var(--color-ios-blue)] flex items-center justify-center mb-8">
          <Check size={64} className="text-[var(--color-ios-blue)]" strokeWidth={3} />
        </div>
        <h1 className="text-[28px] font-bold text-black text-center mb-12 max-w-[280px] leading-tight">
          You Have Successfully Completed the Task
        </h1>
        <div className="w-full max-w-sm mt-auto pb-12">
           <Button 
            variant="primary" 
            fullWidth 
            onClick={() => onBackToBatch(true, ingredients)}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans">
      {/* Header */}
      <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
        <button 
          onClick={() => onBackToBatch(false)}
          className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
        >
          <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
          <span className="text-[17px] font-medium">Back</span>
        </button>
        <span className="text-[17px] font-semibold text-black">Initial Audit</span>
      </div>

      <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4">
        {view === 'audit' ? (
          <>
            <div className="flex flex-col gap-4 mb-8">
              {ingredients.map((ing) => (
                <div key={ing.id} className="bg-white rounded-2xl p-5 shadow-sm border border-transparent">
                  <h3 className="text-xl font-bold text-black mb-4">{ing.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Current Inventory (by System)</label>
                      <p className="text-[20px] font-light text-[var(--color-ios-gray-2)] mt-0.5">{ing.systemAmount}{ing.unit}</p>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)]">Actual Amount (Live Audit)</label>
                      <div className="flex items-center mt-0.5 border-b border-[var(--color-ios-gray-4)] focus-within:border-[var(--color-ios-blue)] transition-colors">
                        <input 
                          type="number"
                          placeholder="Enter Amount..."
                          className="w-full py-1 text-[18px] font-medium text-black outline-none placeholder:text-[var(--color-ios-gray-4)] placeholder:font-normal bg-transparent"
                          value={ing.actualAmount ?? ""}
                          onChange={(e) => handleInputChange(ing.id, e.target.value)}
                        />
                        <span className="text-[15px] font-medium text-black ml-1">{ing.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              variant="primary" 
              fullWidth 
              disabled={!isAllFilled}
              className={!isAllFilled ? "bg-[var(--color-ios-gray-4)] text-[var(--color-ios-gray-2)]" : ""}
              onClick={handleAuditComplete}
            >
              Complete Task
            </Button>
          </>
        ) : (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-t-[32px] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="w-12 h-1.5 bg-[var(--color-ios-gray-4)] rounded-full mx-auto mb-8" />
              
              <h2 className="text-[24px] font-bold text-black text-center mb-8">Review Changes</h2>
              
              <div className="flex flex-col gap-4 mb-8">
                {ingredients.map((ing) => {
                  const diff = (ing.actualAmount || 0) - ing.systemAmount;
                  const isPositive = diff > 0;
                  return (
                    <div key={ing.id} className="bg-white rounded-2xl p-5 border border-[var(--color-ios-gray-5)]">
                      <h3 className="text-[18px] font-bold text-black mb-1">{ing.name}</h3>
                      <p className="text-[11px] font-medium text-[var(--color-ios-gray-2)] mb-2">Changes (from the System)</p>
                      <p className={`text-[17px] font-semibold ${isPositive ? 'text-[var(--color-ios-blue)]' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{diff}{ing.unit}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mb-10">
                <p className="text-[12px] text-[var(--color-ios-gray-2)] leading-relaxed text-center px-2">
                  By applying these changes, the data in the inventory will be adjusted, and the amount you need to buy in the shopping list will also be adjusted based on the current inventory you changed.
                </p>
              </div>

              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleFinalComplete}
              >
                Complete Task
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
