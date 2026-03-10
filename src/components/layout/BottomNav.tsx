"use client";

import { Layers, Archive, Calendar as CalendarIcon, BookOpen } from "lucide-react";

type Tab = 'production' | 'inventory' | 'schedules' | 'recipes';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'production', label: 'Production', icon: Layers },
    { id: 'inventory', label: 'Inventory', icon: Archive },
    { id: 'schedules', label: 'Schedules', icon: CalendarIcon },
    { id: 'recipes', label: 'Databases', icon: BookOpen },
  ] as const;

  return (
    <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 bg-white border-t border-[var(--color-ios-gray-5)] pb-safe-area z-20">
      <div className="flex justify-around items-center h-20 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 w-20 cursor-pointer"
            >
              <Icon 
                size={28} 
                strokeWidth={isActive ? 2 : 1.5}
                className={isActive ? "text-[var(--color-ios-blue)]" : "text-[var(--color-ios-gray-2)]"} 
              />
              <span 
                className={`text-[11px] font-medium ${
                  isActive ? "text-[var(--color-ios-blue)]" : "text-[var(--color-ios-gray-2)]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
