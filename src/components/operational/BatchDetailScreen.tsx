"use client";

import { useState } from "react";
import { ChevronLeft, ChevronDown, ChevronUp, Lock, Clock, MoreHorizontal, Search, Download, CheckCircle } from "lucide-react";
import ReviewShoppingListFlow from "./ReviewShoppingListFlow";
import ReviewExecutionFlow from "./ReviewExecutionFlow";
import ReceiveShoppingGoodsFlow from "./ReceiveShoppingGoodsFlow";
import DoExecutionFlow from "./DoExecutionFlow";
import InitialAuditFlow from "./InitialAuditFlow";
import FinalAuditAndInputResults from "./FinalAuditAndInputResults";
import CreateAndAssignBarcode from "./CreateAndAssignBarcode";
import CompleteProcessFlow from "./CompleteProcessFlow";
import confetti from "canvas-confetti";

interface BatchDetailScreenProps {
  batchId: number;
  onBack: () => void;
}

export default function BatchDetailScreen({ batchId, onBack }: BatchDetailScreenProps) {
  // Mock active step logic for the progressive disclosure
  const [expandedStep, setExpandedStep] = useState<string | null>('initial_audit');
  
  // Navigation states within this Batch Work Order
  const [isInitialAuditOpen, setIsInitialAuditOpen] = useState(false);
  const [isInitialAuditDone, setIsInitialAuditDone] = useState(false);
  const [auditData, setAuditData] = useState<any[] | null>(null);

  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isShoppingListDone, setIsShoppingListDone] = useState(false);

  const [isExecutionFlowOpen, setIsExecutionFlowOpen] = useState(false);
  const [isExecutionFlowDone, setIsExecutionFlowDone] = useState(false);

  const [isShoppingGoodsOpen, setIsShoppingGoodsOpen] = useState(false);
  const [isShoppingGoodsDone, setIsShoppingGoodsDone] = useState(false);

  const [isDoExecutionFlowOpen, setIsDoExecutionFlowOpen] = useState(false);
  const [isDoExecutionFlowDone, setIsDoExecutionFlowDone] = useState(false);

  const [isFinalAuditOpen, setIsFinalAuditOpen] = useState(false);
  const [isFinalAuditDone, setIsFinalAuditDone] = useState(false);
  const [shoppingData, setShoppingData] = useState<any[] | null>(null);
  const [finalResults, setFinalResults] = useState<{ quantity: string, time: string } | null>(null);

  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isBarcodeDone, setIsBarcodeDone] = useState(false);

  const [isCompleteProcessOpen, setIsCompleteProcessOpen] = useState(false);
  const [isBatchCompleted, setIsBatchCompleted] = useState(false);

  const toggleStep = (stepId: string, isActive: boolean) => {
    if (!isActive) return; // Cannot toggle disabled steps
    setExpandedStep(prev => prev === stepId ? null : stepId);
  };

  const handleInitialAuditClose = (completed: boolean, data?: any[]) => {
    setIsInitialAuditOpen(false);
    if (completed) {
      setIsInitialAuditDone(true);
      if (data) setAuditData(data);
      // Auto-expand next step when completed
      setExpandedStep('review_shopping');
    }
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

  const handleShoppingGoodsClose = (completed: boolean, transactions?: any[]) => {
    setIsShoppingGoodsOpen(false);
    if (completed) {
      setIsShoppingGoodsDone(true);
      if (transactions) setShoppingData(transactions);
      // Unlock action stage automatically
      setExpandedStep('do_execution');
    }
  };

  const handleFinalAuditClose = (completed: boolean, results?: { quantity: string, time: string }) => {
    setIsFinalAuditOpen(false);
    if (completed) {
      setIsFinalAuditDone(true);
      if (results) setFinalResults(results);
      // Auto-expand next action step
      setExpandedStep('barcode');
    }
  };

  const handleBarcodeClose = (completed: boolean) => {
    setIsBarcodeOpen(false);
    if (completed) {
      setIsBarcodeDone(true);
      // Auto-expand next action step
      setExpandedStep('complete');
    }
  };

  const handleCompleteProcessClose = (completed: boolean) => {
    setIsCompleteProcessOpen(false);
    if (completed) {
      setIsBatchCompleted(true);
      // Celebrate!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#007AFF', '#5AC8FA', '#4CD964', '#FFCC00'],
      });
    }
  };

  const handleDoExecutionFlowClose = (completed: boolean) => {
    setIsDoExecutionFlowOpen(false);
    if (completed) {
      setIsDoExecutionFlowDone(true);
      // Auto-expand next action step
      setExpandedStep('final_audit_results');
    }
  };

  if (isInitialAuditOpen) {
    return <InitialAuditFlow isCompleted={isInitialAuditDone} onBackToBatch={handleInitialAuditClose} />;
  }

  if (isShoppingListOpen) {
    return <ReviewShoppingListFlow isCompleted={isShoppingListDone} onBackToBatch={handleShoppingListClose} auditData={auditData} />;
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

  if (isFinalAuditOpen) {
    return (
      <FinalAuditAndInputResults 
        isCompleted={isFinalAuditDone} 
        onBackToBatch={handleFinalAuditClose} 
        initialAuditData={auditData}
        shoppingData={shoppingData}
      />
    );
  }

  if (isBarcodeOpen) {
    return (
      <CreateAndAssignBarcode 
        isCompleted={isBarcodeDone} 
        onBackToBatch={handleBarcodeClose}
        productName="Ayam Suwir Cabe Ijo"
        plannedQuantity="50 pcs"
        finishedQuantity={finalResults?.quantity || "0 pcs"}
        projectName="Project#001"
      />
    );
  }

  if (isCompleteProcessOpen) {
    return <CompleteProcessFlow isCompleted={isBatchCompleted} onBackToBatch={handleCompleteProcessClose} />;
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
            {/* Step 0: Initial Audit */}
            <div className={`rounded-2xl shadow-sm overflow-hidden transition-all ${isInitialAuditDone ? 'bg-white/80' : 'bg-white'}`}>
              <div 
                onClick={() => toggleStep('initial_audit', true)}
                className="p-4 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {isInitialAuditDone ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-ios-blue)] text-white">
                      <CheckCircle size={20} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-yellow)] flex items-center justify-center">
                      <Clock size={18} className="text-[var(--color-ios-yellow)]" strokeWidth={2.5} />
                    </div>
                  )}
                  <span className={`font-semibold text-[16px] ${isInitialAuditDone ? 'text-black/60' : 'text-black'}`}>Initial Audit</span>
                </div>
                {expandedStep === 'initial_audit' ? (
                  <ChevronUp size={20} className="text-[var(--color-ios-gray-2)]" />
                ) : (
                  <ChevronDown size={20} className="text-[var(--color-ios-gray-2)]" />
                )}
              </div>
              
              {expandedStep === 'initial_audit' && (
                <div className="px-4 pb-4 pt-1 flex gap-3 border-t border-[var(--color-ios-gray-6)] mt-2 pt-4">
                  <button 
                    onClick={() => setIsInitialAuditOpen(true)}
                    className="flex-1 border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors active:bg-[var(--color-ios-blue)]/10"
                  >
                    <Search size={18} /> View
                  </button>
                  <button 
                    disabled={!isInitialAuditDone}
                    onClick={() => {
                        setIsInitialAuditDone(false);
                        setIsShoppingListDone(false);
                        setExpandedStep('initial_audit');
                    }}
                    className={`flex-1 py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors border text-black hover:bg-black/5 ${
                      !isInitialAuditDone ? 'opacity-50 cursor-not-allowed border-[var(--color-ios-gray-3)] text-[var(--color-ios-gray-3)]' : 'border-black'
                   }`}
                  >
                    Reopen
                  </button>
                </div>
              )}
            </div>

            {/* Step 1: Review Shopping Lists */}
            <div className={`rounded-2xl shadow-sm overflow-hidden transition-all ${
                !isInitialAuditDone 
                  ? 'bg-[#B4B4B8] opacity-80 cursor-not-allowed' 
                  : isShoppingListDone 
                    ? 'bg-white/80' 
                    : 'bg-white'
              }`}
            >
              <div 
                onClick={() => toggleStep('review_shopping', isInitialAuditDone)}
                className="p-4 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {!isInitialAuditDone ? (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-gray-2)] flex items-center justify-center">
                      <MoreHorizontal size={18} className="text-[var(--color-ios-gray-2)]" />
                    </div>
                  ) : isShoppingListDone ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-ios-blue)] text-white">
                      <CheckCircle size={20} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-yellow)] flex items-center justify-center">
                      <Clock size={18} className="text-[var(--color-ios-yellow)]" strokeWidth={2.5} />
                    </div>
                  )}
                  <span className={`font-semibold text-[16px] ${!isInitialAuditDone ? 'text-black/30' : isShoppingListDone ? 'text-black/60' : 'text-black'}`}>Review Shopping Lists</span>
                </div>
                {isInitialAuditDone && (
                  expandedStep === 'review_shopping' ? (
                    <ChevronUp size={20} className="text-[var(--color-ios-gray-2)]" />
                  ) : (
                    <ChevronDown size={20} className="text-[var(--color-ios-gray-2)]" />
                  )
                )}
                {!isInitialAuditDone && (
                  <ChevronDown size={20} className="text-black/20" />
                )}
              </div>
              
              {/* Expanded Content for Active Step */}
              {isInitialAuditDone && expandedStep === 'review_shopping' && (
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
                        setIsShoppingListDone(false);
                        setIsExecutionFlowDone(false);
                        setIsShoppingGoodsDone(false);
                        setExpandedStep('review_shopping');
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

            {/* Final Audit and Input Results Step */}
            <div className={`rounded-2xl shadow-sm overflow-hidden transition-all ${
                !isDoExecutionFlowDone 
                  ? 'bg-[#B4B4B8] opacity-80 cursor-not-allowed' 
                  : isFinalAuditDone 
                    ? 'bg-white/80' 
                    : 'bg-white'
              }`}
            >
              <div 
                onClick={() => toggleStep('final_audit_results', isDoExecutionFlowDone)}
                className="p-4 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {!isDoExecutionFlowDone ? (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-gray-2)] flex items-center justify-center">
                      <MoreHorizontal size={18} className="text-[var(--color-ios-gray-2)]" />
                    </div>
                  ) : isFinalAuditDone ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-ios-blue)] text-white">
                      <CheckCircle size={20} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-yellow)] flex items-center justify-center">
                      <Clock size={18} className="text-[var(--color-ios-yellow)]" strokeWidth={2.5} />
                    </div>
                  )}
                  <span className={`font-semibold text-[16px] ${!isDoExecutionFlowDone ? 'text-black/30' : isFinalAuditDone ? 'text-black/60' : 'text-black'}`}>
                    Final Audit and Input Results
                  </span>
                </div>
                {isDoExecutionFlowDone && (
                  expandedStep === 'final_audit_results' ? (
                    <ChevronUp size={20} className="text-[var(--color-ios-gray-2)]" />
                  ) : (
                    <ChevronDown size={20} className="text-[var(--color-ios-gray-2)]" />
                  )
                )}
                {!isDoExecutionFlowDone && (
                  <ChevronDown size={20} className="text-black/20" />
                )}
              </div>
              
              {isDoExecutionFlowDone && expandedStep === 'final_audit_results' && (
                <div className="px-4 pb-4 pt-1 border-t border-[var(--color-ios-gray-6)] mt-2 pt-4">
                  <button 
                    onClick={() => setIsFinalAuditOpen(true)}
                    className="w-full border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors active:bg-[var(--color-ios-blue)]/10"
                  >
                    <Search size={18} /> View
                  </button>
                </div>
              )}
            </div>

            {/* Barcode Step */}
            <div className={`rounded-2xl shadow-sm overflow-hidden transition-all ${
                !isFinalAuditDone 
                  ? 'bg-[#B4B4B8] opacity-80 cursor-not-allowed' 
                  : isBarcodeDone 
                    ? 'bg-white/80' 
                    : 'bg-white'
              }`}
            >
              <div 
                onClick={() => toggleStep('barcode', isFinalAuditDone)}
                className="p-4 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {!isFinalAuditDone ? (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-gray-2)] flex items-center justify-center">
                      <MoreHorizontal size={18} className="text-[var(--color-ios-gray-2)]" />
                    </div>
                  ) : isBarcodeDone ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-ios-blue)] text-white">
                      <CheckCircle size={20} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-yellow)] flex items-center justify-center">
                      <Clock size={18} className="text-[var(--color-ios-yellow)]" strokeWidth={2.5} />
                    </div>
                  )}
                  <span className={`font-semibold text-[16px] ${!isFinalAuditDone ? 'text-black/30' : isBarcodeDone ? 'text-black/60' : 'text-black'}`}>
                    Create and Assign Barcode
                  </span>
                </div>
                {isFinalAuditDone && (
                  expandedStep === 'barcode' ? (
                    <ChevronUp size={20} className="text-[var(--color-ios-gray-2)]" />
                  ) : (
                    <ChevronDown size={20} className="text-[var(--color-ios-gray-2)]" />
                  )
                )}
                {!isFinalAuditDone && (
                  <ChevronDown size={20} className="text-black/20" />
                )}
              </div>
              
              {isFinalAuditDone && expandedStep === 'barcode' && (
                <div className="px-4 pb-4 pt-1 border-t border-[var(--color-ios-gray-6)] mt-2 pt-4">
                  <button 
                    onClick={() => setIsBarcodeOpen(true)}
                    className="w-full border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors active:bg-[var(--color-ios-blue)]/10"
                  >
                    <Search size={18} /> View
                  </button>
                </div>
              )}
            </div>

            {/* Complete Process Step */}
            <div className={`rounded-2xl shadow-sm overflow-hidden transition-all ${
                !isBarcodeDone 
                  ? 'bg-[#B4B4B8] opacity-80 cursor-not-allowed' 
                  : isBatchCompleted 
                    ? 'bg-white/80' 
                    : 'bg-white'
              }`}
            >
              <div 
                onClick={() => toggleStep('complete', isBarcodeDone)}
                className="p-4 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {!isBarcodeDone ? (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-gray-2)] flex items-center justify-center">
                      <MoreHorizontal size={18} className="text-[var(--color-ios-gray-2)]" />
                    </div>
                  ) : isBatchCompleted ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-ios-blue)] text-white">
                      <CheckCircle size={20} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ios-yellow)] flex items-center justify-center">
                      <Clock size={18} className="text-[var(--color-ios-yellow)]" strokeWidth={2.5} />
                    </div>
                  )}
                  <span className={`font-semibold text-[16px] ${!isBarcodeDone ? 'text-black/30' : isBatchCompleted ? 'text-black/60' : 'text-black'}`}>
                    Complete Process
                  </span>
                </div>
                {isBarcodeDone && (
                  expandedStep === 'complete' ? (
                    <ChevronUp size={20} className="text-[var(--color-ios-gray-2)]" />
                  ) : (
                    <ChevronDown size={20} className="text-[var(--color-ios-gray-2)]" />
                  )
                )}
                {!isBarcodeDone && (
                  <ChevronDown size={20} className="text-black/20" />
                )}
              </div>
              
              {isBarcodeDone && expandedStep === 'complete' && (
                <div className="px-4 pb-4 pt-1 border-t border-[var(--color-ios-gray-6)] mt-2 pt-4">
                  <button 
                    onClick={() => setIsCompleteProcessOpen(true)}
                    className="w-full border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors active:bg-[var(--color-ios-blue)]/10"
                  >
                    Agree and Complete Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
