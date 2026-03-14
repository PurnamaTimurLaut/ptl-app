"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CompleteProcessFlowProps {
  onBackToProduction: (completed: boolean) => void;
  isCompleted?: boolean;
}

export default function CompleteProcessFlow({ onBackToProduction, isCompleted }: CompleteProcessFlowProps) {
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

      <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-2 flex flex-col">
        <h1 className="text-[22px] font-bold text-center text-black mb-8 px-4">
          Complete Process
        </h1>

        <div className="bg-white rounded-[24px] p-8 shadow-sm mb-10">
          <p className="text-[15px] text-[var(--color-ios-gray-3)] leading-relaxed text-center italic">
            "I confirm that I have completed all required tasks and provided the information honestly and accurately. I take full responsibility for the information submitted and acknowledge that this action is irreversible."
          </p>
        </div>

        <div className="mt-auto">
          <Button 
            variant="primary" 
            fullWidth 
            onClick={() => onBackToProduction(true)}
          >
            Agree and Complete Task
          </Button>
        </div>
      </main>
    </div>
  );
}
