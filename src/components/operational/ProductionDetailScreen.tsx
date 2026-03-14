"use client";

import { useState } from "react";
import { ChevronLeft, ChevronDown, ChevronUp, Lock, Clock, MoreHorizontal, Search, Download, CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { getProductionById } from "@/app/lib/projectActions";
import ReviewShoppingListFlow from "./ReviewShoppingListFlow";
import ReviewExecutionFlow from "./ReviewExecutionFlow";
import ReceiveShoppingGoodsFlow from "./ReceiveShoppingGoodsFlow";
import DoExecutionFlow from "./DoExecutionFlow";
import InitialAuditFlow from "./InitialAuditFlow";
import FinalAuditAndInputResults from "./FinalAuditAndInputResults";
import CreateAndAssignBarcode from "./CreateAndAssignBarcode";
import CompleteProcessFlow from "./CompleteProcessFlow";
import confetti from "canvas-confetti";

interface ProductionDetailScreenProps {
  productionId: string;
  onBack: () => void;
}

export default function ProductionDetailScreen({ productionId, onBack }: ProductionDetailScreenProps) {
  const [production, setProduction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<string | null>('initial_audit');
  
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getProductionById(productionId);
      if (res.success) setProduction(res.production);
      setIsLoading(false);
    }
    load();
  }, [productionId]);
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
  const [isProductionCompleted, setIsProductionCompleted] = useState(false);

  const toggleStep = (stepId: string, isActive: boolean) => {
    if (!isActive) return;
    setExpandedStep(prev => prev === stepId ? null : stepId);
  };

  const handleInitialAuditClose = (completed: boolean, data?: any[]) => {
    setIsInitialAuditOpen(false);
    if (completed) {
      setIsInitialAuditDone(true);
      if (data) setAuditData(data);
      setExpandedStep('review_shopping');
    }
  };

  const handleShoppingListClose = (completed: boolean) => {
    setIsShoppingListOpen(false);
    if (completed) {
      setIsShoppingListDone(true);
      setExpandedStep('review_execution');
    }
  };

  const handleExecutionFlowClose = (completed: boolean) => {
    setIsExecutionFlowOpen(false);
    if (completed) {
      setIsExecutionFlowDone(true);
      setExpandedStep('receive_goods');
    }
  };

  const handleShoppingGoodsClose = (completed: boolean, transactions?: any[]) => {
    setIsShoppingGoodsOpen(false);
    if (completed) {
      setIsShoppingGoodsDone(true);
      if (transactions) setShoppingData(transactions);
      setExpandedStep('do_execution');
    }
  };

  const handleFinalAuditClose = (completed: boolean, results?: { quantity: string, time: string }) => {
    setIsFinalAuditOpen(false);
    if (completed) {
      setIsFinalAuditDone(true);
      if (results) setFinalResults(results);
      setExpandedStep('barcode');
    }
  };

  const handleBarcodeClose = (completed: boolean) => {
    setIsBarcodeOpen(false);
    if (completed) {
      setIsBarcodeDone(true);
      setExpandedStep('complete');
    }
  };

  const handleCompleteProcessClose = (completed: boolean) => {
    setIsCompleteProcessOpen(false);
    if (completed) {
      setIsProductionCompleted(true);
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
      setExpandedStep('final_audit_results');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex items-center justify-center">
        <p className="text-[var(--color-ios-gray-2)]">Loading Details...</p>
      </div>
    );
  }

  if (!production) {
    return (
      <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col p-6">
         <button onClick={onBack} className="text-[var(--color-ios-blue)] flex items-center mb-10"><ChevronLeft/> Back</button>
         <p>Production not found.</p>
      </div>
    );
  }

  if (isInitialAuditOpen) {
    return <InitialAuditFlow isCompleted={isInitialAuditDone} onBackToProduction={handleInitialAuditClose} />;
  }

  if (isShoppingListOpen) {
    return <ReviewShoppingListFlow isCompleted={isShoppingListDone} onBackToProduction={handleShoppingListClose} auditData={auditData} />;
  }

  if (isExecutionFlowOpen) {
    return <ReviewExecutionFlow isCompleted={isExecutionFlowDone} onBackToProduction={handleExecutionFlowClose} />;
  }

  if (isShoppingGoodsOpen) {
    return <ReceiveShoppingGoodsFlow isCompleted={isShoppingGoodsDone} onBackToProduction={handleShoppingGoodsClose} />;
  }

  if (isDoExecutionFlowOpen) {
    return <DoExecutionFlow isCompleted={isDoExecutionFlowDone} onBackToProduction={handleDoExecutionFlowClose} />;
  }

  if (isFinalAuditOpen) {
    return (
      <FinalAuditAndInputResults 
        isCompleted={isFinalAuditDone} 
        onBackToProduction={handleFinalAuditClose} 
        initialAuditData={auditData}
        shoppingData={shoppingData}
      />
    );
  }

  if (isBarcodeOpen) {
    return (
      <CreateAndAssignBarcode 
        isCompleted={isBarcodeDone} 
        onBackToProduction={handleBarcodeClose}
        productName={production.ProductionTemplate?.name || "Unknown"}
        plannedQuantity={`${production.quantity} pcs`}
        finishedQuantity={finalResults?.quantity || "0 pcs"}
        projectName={production.Project?.name || "Unknown"}
      />
    );
  }

  if (isCompleteProcessOpen) {
    return <CompleteProcessFlow isCompleted={isProductionCompleted} onBackToProduction={handleCompleteProcessClose} />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-12">
      <div className="w-full flex items-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10">
        <button 
          onClick={onBack}
          className="flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
        >
          <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
          <span className="text-[17px] font-medium">Production</span>
        </button>
      </div>

      <main className="px-6 flex-1 w-full">
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-8">
          <h1 className="text-2xl font-bold text-black mb-1">{production.ProductionTemplate?.name || "Unknown"}</h1>
          <div className="mt-3 text-[14px] text-[var(--color-ios-gray-1)] space-y-1">
            <p className="flex justify-between"><span>Production ID:</span> <span className="font-medium text-black">{production.productionCode}</span></p>
            <p className="flex justify-between"><span>Quantity:</span> <span className="font-medium text-black">{production.quantity} pcs</span></p>
            <p className="flex justify-between"><span>Assigned:</span> <span className="text-black">{new Date(production.assignedDate).toLocaleString('en-GB')}</span></p>
            <p className="flex justify-between font-semibold"><span>Deadline:</span> <span className="text-orange-600">{new Date(production.deadlineDate).toLocaleString('en-GB')}</span></p>
            <p className="flex justify-between"><span>Project:</span> <span className="font-medium text-black">{production.project?.projectCode}</span></p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-[17px] font-semibold text-black mb-4">Plan and Preparation Stage</h2>
          <div className="flex flex-col gap-3">
            {/* Steps would follow here, similar to before... shortened for clarity but they are correct */}
            <StepItem id="initial_audit" title="Initial Audit" isDone={isInitialAuditDone} expanded={expandedStep === 'initial_audit'} toggle={() => toggleStep('initial_audit', true)} onView={() => setIsInitialAuditOpen(true)} />
            <StepItem id="review_shopping" title="Review Shopping Lists" isDone={isShoppingListDone} expanded={expandedStep === 'review_shopping'} toggle={() => toggleStep('review_shopping', isInitialAuditDone)} onView={() => setIsShoppingListOpen(true)} disabled={!isInitialAuditDone} />
            <StepItem id="review_execution" title="Review Execution Flow" isDone={isExecutionFlowDone} expanded={expandedStep === 'review_execution'} toggle={() => toggleStep('review_execution', isShoppingListDone)} onView={() => setIsExecutionFlowOpen(true)} disabled={!isShoppingListDone} />
            <StepItem id="receive_goods" title="Receive Shopping Goods" isDone={isShoppingGoodsDone} expanded={expandedStep === 'receive_goods'} toggle={() => toggleStep('receive_goods', isExecutionFlowDone)} onView={() => setIsShoppingGoodsOpen(true)} disabled={!isExecutionFlowDone} />
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-[17px] font-semibold text-black mb-4 flex items-center gap-2">
            Action Stage {isShoppingGoodsDone ? <span className="text-[var(--color-ios-blue)]">🔓</span> : <Lock size={16} className="text-black" />}
          </h2>
          <div className="flex flex-col gap-3">
            <StepItem id="do_execution" title="Do Execution Flow" isDone={isDoExecutionFlowDone} expanded={expandedStep === 'do_execution'} toggle={() => toggleStep('do_execution', isShoppingGoodsDone)} onView={() => setIsDoExecutionFlowOpen(true)} disabled={!isShoppingGoodsDone} />
            <StepItem id="final_audit_results" title="Final Audit and Input Results" isDone={isFinalAuditDone} expanded={expandedStep === 'final_audit_results'} toggle={() => toggleStep('final_audit_results', isDoExecutionFlowDone)} onView={() => setIsFinalAuditOpen(true)} disabled={!isDoExecutionFlowDone} />
            <StepItem id="barcode" title="Create and Assign Barcode" isDone={isBarcodeDone} expanded={expandedStep === 'barcode'} toggle={() => toggleStep('barcode', isFinalAuditDone)} onView={() => setIsBarcodeOpen(true)} disabled={!isFinalAuditDone} />
            <StepItem id="complete" title="Complete Process" isDone={isProductionCompleted} expanded={expandedStep === 'complete'} toggle={() => toggleStep('complete', isBarcodeDone)} onView={() => setIsCompleteProcessOpen(true)} disabled={!isBarcodeDone} />
          </div>
        </div>
      </main>
    </div>
  );
}

function StepItem({ id, title, isDone, expanded, toggle, onView, disabled }: any) {
  return (
    <div className={`rounded-2xl shadow-sm overflow-hidden transition-all ${disabled ? 'bg-[#B4B4B8] opacity-80 cursor-not-allowed' : isDone ? 'bg-white/80' : 'bg-white'}`}>
      <div onClick={toggle} className="p-4 flex justify-between items-center cursor-pointer select-none">
        <div className="flex items-center gap-3">
          {isDone ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-ios-blue)] text-white"><CheckCircle size={20} /></div>
          ) : (
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${disabled ? 'border-[var(--color-ios-gray-2)]' : 'border-[var(--color-ios-yellow)]'}`}>
              <Clock size={18} className={disabled ? 'text-[var(--color-ios-gray-2)]' : 'text-[var(--color-ios-yellow)]'} strokeWidth={2.5} />
            </div>
          )}
          <span className={`font-semibold text-[16px] ${disabled ? 'text-black/30' : isDone ? 'text-black/60' : 'text-black'}`}>{title}</span>
        </div>
        {expanded ? <ChevronUp size={20} className="text-[var(--color-ios-gray-2)]" /> : <ChevronDown size={20} className="text-[var(--color-ios-gray-2)]" />}
      </div>
      {!disabled && expanded && (
        <div className="px-4 pb-4 pt-4 flex gap-3 border-t border-[var(--color-ios-gray-6)]">
          <button onClick={onView} className="flex-1 border border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] py-2.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 active:bg-[var(--color-ios-blue)]/10">
            <Search size={18} /> View
          </button>
        </div>
      )}
    </div>
  );
}
