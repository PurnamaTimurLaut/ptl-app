"use client";

import { useState } from "react";
import { ChevronLeft, Bot, Fingerprint, Check, Circle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ExecutionStep {
  id: string;
  name: string;
  pic: string;
  startDate: string;
  endDate: string;
  isAuto: boolean;
  isDone?: boolean;
}

interface DoExecutionFlowProps {
  onBackToBatch: (completed: boolean) => void;
  isCompleted?: boolean;
}

function formatDateTimeDisplay(dtString: string) {
  if (!dtString) return "";
  const [datePart, timePart] = dtString.split('T');
  if (!datePart || !timePart) return dtString;
  const splitDate = datePart.split('-');
  if (splitDate.length !== 3) return dtString;
  const [year, month, day] = splitDate;
  return `${timePart}, ${day}/${month}/${year}`;
}

export default function DoExecutionFlow({ onBackToBatch, isCompleted }: DoExecutionFlowProps) {
  // Mock items - in real app would come from props or db
  const [items, setItems] = useState<ExecutionStep[]>([
    {
      id: "1",
      name: "Potong Cabe-cabean",
      pic: "Sebastian",
      startDate: "2026-03-06T08:00",
      endDate: "2026-03-06T09:30",
      isAuto: true,
      isDone: isCompleted,
    },
    {
      id: "2",
      name: "Rebus Cabe-cabean",
      pic: "Sebastian",
      startDate: "2026-03-06T09:45",
      endDate: "2026-03-06T10:05",
      isAuto: true,
      isDone: isCompleted,
    },
    {
      id: "3",
      name: "Chopper Cabe-cabean",
      pic: "Sebastian",
      startDate: "2026-03-06T10:10",
      endDate: "2026-03-06T10:15",
      isAuto: true,
      isDone: isCompleted,
    }
  ]);

  const toggleDone = (id: string) => {
    if (isCompleted) return;
    setItems(items.map(item => 
      item.id === id ? { ...item, isDone: !item.isDone } : item
    ));
  };

  const allDone = items.every(item => item.isDone);

  return (
    <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex flex-col font-sans pb-12">
      {/* Top Navigation */}
      <div className="w-full flex items-center justify-center px-4 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/90 backdrop-blur-md z-10 relative">
        <button 
          onClick={() => onBackToBatch(false)}
          className="absolute left-4 flex items-center text-[var(--color-ios-blue)] active:opacity-70 transition-opacity"
        >
          <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
          <span className="text-[17px] font-medium">Back</span>
        </button>
        <span className="text-[17px] font-semibold text-black">Do Execution Flow &gt; View</span>
      </div>

      <main className="px-6 flex-1 max-w-xl mx-auto w-full pt-4">
        <div className="flex flex-col gap-4 mb-8">
          {items.map((item) => (
            <div 
              key={item.id} 
              className={`rounded-2xl p-5 shadow-sm border transition-all ${
                isCompleted 
                  ? 'bg-[var(--color-ios-gray-4)] border-transparent opacity-60' 
                  : 'bg-white border-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <h3 className={`text-[19px] font-bold ${isCompleted ? 'text-[var(--color-ios-gray-2)]' : 'text-black'}`}>
                    {item.name}
                  </h3>
                  {item.isAuto ? (
                    <Bot size={20} className={isCompleted ? 'text-[var(--color-ios-gray-2)]' : 'text-[var(--color-ios-blue)]'} />
                  ) : (
                    <Fingerprint size={20} className={isCompleted ? 'text-[var(--color-ios-gray-2)]' : 'text-[var(--color-ios-blue)]'} />
                  )}
                </div>
                
                <button 
                  onClick={() => toggleDone(item.id)}
                  disabled={isCompleted}
                  className={`transition-colors ${isCompleted ? 'cursor-not-allowed' : 'active:scale-95'}`}
                >
                  {item.isDone ? (
                    <CheckCircle size={28} className={isCompleted ? 'text-[var(--color-ios-gray-2)]' : 'text-[var(--color-ios-blue)]'} fill="currentColor" fillOpacity={isCompleted ? 0.1 : 0.1} />
                  ) : (
                    <Circle size={28} className="text-[var(--color-ios-gray-3)]" />
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)] uppercase">PIC</label>
                  <p className={`text-[17px] font-medium mt-0.5 ${isCompleted ? 'text-[var(--color-ios-gray-2)]' : 'text-black'}`}>
                    {item.pic}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)] uppercase">Start Date</label>
                    <p className={`text-[15px] font-medium mt-0.5 ${isCompleted ? 'text-[var(--color-ios-gray-2)]' : 'text-black'}`}>
                      {formatDateTimeDisplay(item.startDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[var(--color-ios-gray-2)] uppercase">End Date</label>
                    <p className={`text-[15px] font-medium mt-0.5 ${isCompleted ? 'text-[var(--color-ios-gray-2)]' : 'text-black'}`}>
                      {formatDateTimeDisplay(item.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <button 
             className={`w-full border py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors border-[var(--color-ios-blue)] text-[var(--color-ios-blue)] hover:bg-[var(--color-ios-blue)]/5 active:bg-[var(--color-ios-blue)]/10`}
          >
            Check Recipe
          </button>
          
          <button 
            disabled={!allDone || isCompleted}
            onClick={() => onBackToBatch(true)}
            className={`w-full py-4 rounded-full font-bold text-[17px] shadow-lg transition-all ${
              isCompleted
                ? 'bg-[var(--color-ios-gray-4)] text-[var(--color-ios-gray-2)] cursor-not-allowed shadow-none'
                : allDone
                  ? 'bg-[var(--color-ios-blue)] text-white active:scale-[0.98] active:shadow-md'
                  : 'bg-[var(--color-ios-gray-4)] text-[var(--color-ios-gray-2)] cursor-not-allowed shadow-none'
            }`}
          >
            Complete Task
          </button>
        </div>
      </main>
    </div>
  );
}
