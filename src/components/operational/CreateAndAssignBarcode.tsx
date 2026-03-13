"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CreateAndAssignBarcodeProps {
  onBackToBatch: (completed: boolean) => void;
  isCompleted?: boolean;
  productName: string;
  plannedQuantity: string;
  finishedQuantity: string;
  projectName: string;
}

export default function CreateAndAssignBarcode({
  onBackToBatch,
  isCompleted,
  productName,
  plannedQuantity,
  finishedQuantity,
  projectName
}: CreateAndAssignBarcodeProps) {
  const [isGenerated, setIsGenerated] = useState(false);
  const [view, setView] = useState<'form' | 'success'>('form');

  // Convert quantity string to number
  const quantityNum = parseInt(finishedQuantity?.replace(/[^0-9]/g, '') || "0");

  const barcodes = useMemo(() => {
    if (!isGenerated) return null;

    // Helper: Map product name to code (Mock logic)
    const getProductCode = (name: string) => {
      if (name.includes("Ayam Suwir Cabe Ijo")) return "ASCI";
      return name.substring(0, 4).toUpperCase();
    };

    // Helper: Map project name to code (Mock logic)
    const getProjectCode = (name: string) => {
      const match = name.match(/#(\d+)/);
      if (match) return `P${match[1].padStart(3, '0')}`;
      return "P001";
    };

    const prefix = getProductCode(productName);
    const pCode = getProjectCode(projectName);
    
    const start = `${prefix}${pCode}00001`;
    const end = `${prefix}${pCode}${String(quantityNum).padStart(5, '0')}`;

    return { start, end };
  }, [isGenerated, productName, projectName, quantityNum]);

  const handleGenerate = () => {
    setIsGenerated(true);
  };

  const handleComplete = () => {
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
           <Button variant="primary" fullWidth onClick={() => onBackToBatch(true)}>
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
          onClick={() => onBackToBatch(false)}
          className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
        >
          <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
          <span className="text-[17px] font-medium">Back</span>
        </button>
        <span className="text-[17px] font-semibold text-black">Create and Assign Barcode {">"} View</span>
      </div>

      <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4">
        {/* Product Info Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm mb-6">
          <h2 className="text-[24px] font-bold text-black mb-1">{productName}</h2>
          <div className="space-y-0.5">
            <p className="text-[14px] text-[var(--color-ios-gray-3)]">Quantity: {plannedQuantity}</p>
            <p className="text-[14px] text-[var(--color-ios-gray-3)]">Finished Quantity: {finishedQuantity}</p>
            <p className="text-[14px] text-[var(--color-ios-gray-3)]">Belongs to: {projectName}</p>
          </div>
        </div>

        {/* Generate Button */}
        <button 
          onClick={handleGenerate}
          disabled={isGenerated}
          className={`w-full py-4 rounded-full font-bold text-[17px] transition-all mb-8 ${
            isGenerated 
              ? 'bg-[#B4B4B8] text-white/50 cursor-default' 
              : 'bg-[var(--color-ios-blue)] text-white active:scale-[0.98]'
          }`}
        >
          Generate Barcode
        </button>

        {/* Barcode Display Area */}
        <div className={`rounded-[24px] p-8 mb-8 transition-all ${isGenerated ? 'bg-white shadow-sm' : 'bg-[#B4B4B8] opacity-80'}`}>
          <div className="mb-8">
            <h3 className="text-[20px] font-bold text-black mb-4">Barcode Starts with:</h3>
            <div className={`flex justify-center gap-2 text-[18px] font-medium tracking-[0.2em] ${isGenerated ? 'text-[var(--color-ios-blue)]' : 'text-black/20'}`}>
              {isGenerated ? (
                barcodes?.start.split('').map((char, i) => <span key={i}>{char}</span>)
              ) : (
                "X X X X X 0 0 0 0 0 0 0 0".split(' ').map((char, i) => <span key={i}>{char}</span>)
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[20px] font-bold text-black mb-4">Ends with:</h3>
            <div className={`flex justify-center gap-2 text-[18px] font-medium tracking-[0.2em] ${isGenerated ? 'text-[var(--color-ios-blue)]' : 'text-black/20'}`}>
              {isGenerated ? (
                barcodes?.end.split('').map((char, i) => <span key={i}>{char}</span>)
              ) : (
                "X X X X X 0 0 0 0 0 0 0 0".split(' ').map((char, i) => <span key={i}>{char}</span>)
              )}
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <Button 
          variant="primary" 
          fullWidth 
          disabled={!isGenerated}
          className={!isGenerated ? "bg-[var(--color-ios-gray-4)] text-[var(--color-ios-gray-2)] cursor-not-allowed" : ""}
          onClick={handleComplete}
        >
          Complete Task
        </Button>
      </main>
    </div>
  );
}
