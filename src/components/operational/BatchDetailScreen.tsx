"use client";

import { useState } from "react";
import { ChevronLeft, ChevronDown, ChevronUp, Lock, Clock, MoreHorizontal, Search, Download, CheckCircle } from "lucide-react";
import ReviewShoppingListFlow from "./ReviewShoppingListFlow";
import ReviewExecutionFlow from "./ReviewExecutionFlow";
import ReceiveShoppingGoodsFlow from "./ReceiveShoppingGoodsFlow";
import DoExecutionFlow from "./DoExecutionFlow";

interface BatchDetailScreenProps {
  batchId: number;
  onBack: () => void;
}

export default function BatchDetailScreen({ batchId, onBack }: BatchDetailScreenProps) {
  // Mock active step logic for the progressive disclosure
  // In a real app, this state would come from the database
  const [expandedStep, setExpandedStep] = useState<string | null>('review_shopping');
  
  // Navigation states within this Batch Work Order
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isShoppingListDone, setIsShoppingListDone] = useState(false);

  const [isExecutionFlowOpen, setIsExecutionFlowOpen] = useState(false);
  const [isExecutionFlowDone, setIsExecutionFlowDone] = useState(false);

  const [isShoppingGoodsOpen, setIsShoppingGoodsOpen] = useState(false);
  const [isShoppingGoodsDone, setIsShoppingGoodsDone] = useState(false);

  const [isDoExecutionFlowOpen, setIsDoExecutionFlowOpen] = useState(false);
  const [isDoExecutionFlowDone, setIsDoExecutionFlowDone] = useState(false);

  const [isInputResultsDone, setIsInputResultsDone] = useState(false);

  const toggleStep = (stepId: string, isActive: boolean) => {
    if (!isActive) return; // Cannot toggle disabled steps
    setExpandedStep(prev => prev === stepId ? null : stepId);
  };

  const handleShoppingListClose = (completed: boolean) => {
    setIsShoppingListOpen(false);
    if (completed) {
      setIsShoppingListDone(true);
      // Auto-expand next step when completed
      setExpandedStep('review_execution');
    }
  };

  const handleExecutionFlowClose = (completed: boolean) => {
    setIsExecutionFlowOpen(false);
    if (completed) {
      setIsExecutionFlowDone(true);
      // Auto-expand next step when completed
      setExpandedStep('receive_goods');
    }
  };

  const handleShoppingGoodsClose = (completed: boolean) => {
    setIsShoppingGoodsOpen(false);
    if (completed) {
      setIsShoppingGoodsDone(true);
      // Unlock action stage automatically
      setExpandedStep('do_execution');
    }
  };

  const handleDoExecutionFlowClose = (completed: boolean) => {
    setIsDoExecutionFlowOpen(false);
    if (completed) {
      setIsDoExecutionFlowDone(true);
      // Auto-expand next action step
      setExpandedStep('input_results');
    }
  };

  if (isShoppingListOpen) {
    return <ReviewShoppingListFlow isCompleted={isShoppingListDone} onBackToBatch={handleShoppingListClose} />;
  }

  if (isExecutionFlowOpen) {
    return <ReviewExecutionFlow isCompleted={isExecutionFlowDone} onBackToBatch={handleExecutionFlowClose} />;
  }

  if (isShoppingGoodsOpen) {
    return <ReceiveShoppingGoodsFlow isCompleted={isShoppingGoodsDone} onBackToBatch={handleShoppingGoodsClose} />;
  }

  if (isDoExecutionFlowOpen) {
    return <DoExecutionFlow isCompleted={isDoExecutionFlowDone} onBackToBatch={handleDoExecutionFlowClose} />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-12">
      
      {/* Top Navigation Back Bar */}
      <div className="w-full flex items-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10">
        <button 
          onClick={onBack}
          className="flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
        >
          <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
          <span className="text-[17px] font-medium">Batches</span>
        </button>
      </div>

      <main className="px-6 flex-1 max-w-xl mx-auto w-full">
        
        {/* Info Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-8">
          <h1 className="text-2xl font-bold text-black mb-1">Ayam Suwir Cabe Ijo</h1>
          <div className="text-[14px] text-[var(--color-ios-gray-1)] leading-relaxed">
            <p>Production Code: ASCIB00001</p>
            <p>Quantity: 50 pcs</p>
            <p>Deadline Date: 22/03/2026</p>
            <p>Assigned at: 04/03/2026</p>
            <p>Belongs to: Batch#0091</p>
          </div>
        </div>

        {/* Plan and Preparation Stage */}
        <div className="mb-8">
          <h2 className="text-[17px] font-semibold text-black mb-4">Plan and Preparation Stage</h2>
          
          <div className="flex flex-col gap-3">
            {/* Step 1: Active Step */}
            <div className={`rounded-2xl shadow-sm overflow-hidden transition-all ${isShoppingListDone ? 'bg-white/80' : 'bg-white'}`}>
              <div 
                onClick={() => toggleStep('review_shopping', true)}
                className="p-4 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {isShoppingListDone ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-ios-blue)] text-white">
                      <CheckCircle size={20} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-yellow)] flex items-center justify-center">
                      <Clock size={18} className="text-[var(--color-ios-yellow)]" strokeWidth={2.5} />
                    </div>
                  )}
                  <span className={`font-semibold text-[16px] ${isShoppingListDone ? 'text-black/60' : 'text-black'}`}>Review Shopping Lists</span>
                </div>
                {expandedStep === 'review_shopping' ? (
                  <ChevronUp size={20} className="text-[var(--color-ios-gray-2)]" />
                ) : (
                  <ChevronDown size={20} className="text-[var(--color-ios-gray-2)]" />
                )}
              </div>
              
              {/* Expanded Content for Active Step */}
              {expandedStep === 'review_shopping' && (
                <div className="px-4 pb-4 pt-1 flex gap-3 border-t border-[var(--color-ios-gray-6)] mt-2 pt-4">
                  <button 
                    onClick={() => setIsShoppingListOpen(true)}
                    className="flex-1 border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors active:bg-[var(--color-ios-blue)]/10"
                  >
                    <Search size={18} /> View
                  </button>
                  <button 
                    disabled={!isShoppingListDone}
                    onClick={() => {
                        // Reopen logic: unmark shopping list, unmark execution flow to wait state.
                        setIsShoppingListDone(false);
                        setIsExecutionFlowDone(false);
                        setIsShoppingGoodsDone(false);
                        setExpandedStep('review_shopping'); // Expand it back
                    }}
                    className={`flex-1 py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors border text-black hover:bg-black/5 ${
                      !isShoppingListDone ? 'opacity-50 cursor-not-allowed border-[var(--color-ios-gray-3)] text-[var(--color-ios-gray-3)]' : 'border-black'
                   }`}
                  >
                    Reopen
                  </button>
                  <button 
                    disabled={!isShoppingListDone}
                    className={`flex-1 py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors ${
                      isShoppingListDone 
                        ? 'border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] active:bg-[var(--color-ios-blue)]/10' 
                        : 'bg-[var(--color-ios-gray-4)] text-[var(--color-ios-gray-2)] cursor-not-allowed'
                    }`}
                  >
                    <Download size={18} /> Export
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Next Step (Unlocks when Step 1 is done) */}
            <div className={`rounded-2xl shadow-sm overflow-hidden transition-all ${
                !isShoppingListDone 
                  ? 'bg-[#B4B4B8] opacity-80 cursor-not-allowed' 
                  : isExecutionFlowDone 
                    ? 'bg-white/80' 
                    : 'bg-white'
              }`}
            >
              <div 
                onClick={() => toggleStep('review_execution', isShoppingListDone)}
                className="p-4 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {!isShoppingListDone ? (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-gray-2)] flex items-center justify-center">
                      <MoreHorizontal size={18} className="text-[var(--color-ios-gray-2)]" />
                    </div>
                  ) : isExecutionFlowDone ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-ios-blue)] text-white">
                      <CheckCircle size={20} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-yellow)] flex items-center justify-center">
                      <Clock size={18} className="text-[var(--color-ios-yellow)]" strokeWidth={2.5} />
                    </div>
                  )}
                  <span className={`font-semibold text-[16px] ${!isShoppingListDone ? 'text-black/30' : isExecutionFlowDone ? 'text-black/60' : 'text-black'}`}>
                    Review Execution Flow
                  </span>
                </div>
                {isShoppingListDone && (
                  expandedStep === 'review_execution' ? (
                    <ChevronUp size={20} className="text-[var(--color-ios-gray-2)]" />
                  ) : (
                    <ChevronDown size={20} className="text-[var(--color-ios-gray-2)]" />
                  )
                )}
                {!isShoppingListDone && (
                  <ChevronDown size={20} className="text-black/20" />
                )}
              </div>
              
              {/* Expanded Content for Active Step */}
              {isShoppingListDone && expandedStep === 'review_execution' && (
                <div className="px-4 pb-4 pt-1 flex gap-3 border-t border-[var(--color-ios-gray-6)] mt-2 pt-4">
                  <button 
                    onClick={() => setIsExecutionFlowOpen(true)}
                    className="flex-1 border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors active:bg-[var(--color-ios-blue)]/10"
                  >
                    <Search size={18} /> View
                  </button>
                  <button 
                    disabled={!isExecutionFlowDone}
                    className={`flex-1 py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors ${
                      isExecutionFlowDone 
                        ? 'border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] active:bg-[var(--color-ios-blue)]/10' 
                        : 'bg-[var(--color-ios-gray-4)] text-[var(--color-ios-gray-2)] cursor-not-allowed'
                    }`}
                  >
                    <Download size={18} /> Export
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Receive Shopping Goods */}
            <div className={`rounded-2xl shadow-sm overflow-hidden transition-all ${
                !isExecutionFlowDone 
                  ? 'bg-[#B4B4B8] opacity-80 cursor-not-allowed' 
                  : isShoppingGoodsDone 
                    ? 'bg-white/80' 
                    : 'bg-white'
              }`}
            >
              <div 
                onClick={() => toggleStep('receive_goods', isExecutionFlowDone)}
                className="p-4 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {!isExecutionFlowDone ? (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-gray-2)] flex items-center justify-center">
                      <MoreHorizontal size={18} className="text-[var(--color-ios-gray-2)]" />
                    </div>
                  ) : isShoppingGoodsDone ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-ios-blue)] text-white">
                      <CheckCircle size={20} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-yellow)] flex items-center justify-center">
                      <Clock size={18} className="text-[var(--color-ios-yellow)]" strokeWidth={2.5} />
                    </div>
                  )}
                  <span className={`font-semibold text-[16px] ${!isExecutionFlowDone ? 'text-black/30' : isShoppingGoodsDone ? 'text-black/60' : 'text-black'}`}>
                    Receive Shopping Goods
                  </span>
                </div>
                {isExecutionFlowDone && (
                  expandedStep === 'receive_goods' ? (
                    <ChevronUp size={20} className="text-[var(--color-ios-gray-2)]" />
                  ) : (
                    <ChevronDown size={20} className="text-[var(--color-ios-gray-2)]" />
                  )
                )}
                {!isExecutionFlowDone && (
                  <ChevronDown size={20} className="text-black/20" />
                )}
              </div>
              
              {/* Expanded Content for Active Step */}
              {isExecutionFlowDone && expandedStep === 'receive_goods' && (
                <div className="px-4 pb-4 pt-1 border-t border-[var(--color-ios-gray-6)] mt-2 pt-4">
                  <button 
                    onClick={() => setIsShoppingGoodsOpen(true)}
                    className="w-full border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors active:bg-[var(--color-ios-blue)]/10"
                  >
                    <Search size={18} /> View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Stage */}
        <div className="mt-4">
          <h2 className="text-[17px] font-semibold text-black mb-4 flex items-center gap-2">
            Action Stage {isShoppingGoodsDone ? <span className="text-[var(--color-ios-blue)]">🔓</span> : <Lock size={16} className="text-black" />}
          </h2>
          
          <div className="flex flex-col gap-3">
            {/* Step 1: Do Execution Flow */}
            <div className={`rounded-2xl shadow-sm overflow-hidden transition-all ${
                !isShoppingGoodsDone 
                  ? 'bg-[#B4B4B8] opacity-80 cursor-not-allowed' 
                  : isDoExecutionFlowDone 
                    ? 'bg-white/80' 
                    : 'bg-white'
              }`}
            >
              <div 
                onClick={() => toggleStep('do_execution', isShoppingGoodsDone)}
                className="p-4 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {!isShoppingGoodsDone ? (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-gray-2)] flex items-center justify-center">
                      <MoreHorizontal size={18} className="text-[var(--color-ios-gray-2)]" />
                    </div>
                  ) : isDoExecutionFlowDone ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-ios-blue)] text-white">
                      <CheckCircle size={20} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-yellow)] flex items-center justify-center">
                      <Clock size={18} className="text-[var(--color-ios-yellow)]" strokeWidth={2.5} />
                    </div>
                  )}
                  <span className={`font-semibold text-[16px] ${!isShoppingGoodsDone ? 'text-black/30' : isDoExecutionFlowDone ? 'text-black/60' : 'text-black'}`}>
                    Do Execution Flow
                  </span>
                </div>
                {isShoppingGoodsDone && (
                  expandedStep === 'do_execution' ? (
                    <ChevronUp size={20} className="text-[var(--color-ios-gray-2)]" />
                  ) : (
                    <ChevronDown size={20} className="text-[var(--color-ios-gray-2)]" />
                  )
                )}
                {!isShoppingGoodsDone && (
                  <ChevronDown size={20} className="text-black/20" />
                )}
              </div>
              
              {isShoppingGoodsDone && expandedStep === 'do_execution' && (
                <div className="px-4 pb-4 pt-1 border-t border-[var(--color-ios-gray-6)] mt-2 pt-4">
                  <button 
                    onClick={() => setIsDoExecutionFlowOpen(true)}
                    className="w-full border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors active:bg-[var(--color-ios-blue)]/10"
                  >
                    <Search size={18} /> View
                  </button>
                </div>
              )}
            </div>

            {/* Other Action Steps */}
            {[
              { name: 'Input Results', id: 'input_results', isAvailable: isDoExecutionFlowDone, isDone: isInputResultsDone },
              { name: 'Create and Assign Barcode', id: 'barcode', isAvailable: isInputResultsDone, isDone: false },
              { name: 'Complete Process', id: 'complete', isAvailable: false, isDone: false }
            ].map((step, idx) => (
              <div key={idx} className={`rounded-2xl shadow-sm overflow-hidden transition-all ${
                  !step.isAvailable 
                    ? 'bg-[#B4B4B8] opacity-80 cursor-not-allowed' 
                    : step.isDone 
                      ? 'bg-white/80' 
                      : 'bg-white'
                }`}
              >
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    {!step.isAvailable ? (
                      <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-gray-2)] flex items-center justify-center">
                        <MoreHorizontal size={18} className="text-[var(--color-ios-gray-2)]" />
                      </div>
                    ) : step.isDone ? (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-ios-blue)] text-white">
                        <CheckCircle size={20} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-yellow)] flex items-center justify-center">
                        <Clock size={18} className="text-[var(--color-ios-yellow)]" strokeWidth={2.5} />
                      </div>
                    )}
                    <span className={`font-semibold text-[16px] ${!step.isAvailable ? 'text-black/30' : step.isDone ? 'text-black/60' : 'text-black'}`}>
                      {step.name}
                    </span>
                  </div>
                  <ChevronDown size={20} className={!step.isAvailable ? "text-black/20" : "text-[var(--color-ios-gray-2)]"} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
