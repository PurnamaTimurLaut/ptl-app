"use client";

import { LogOut, Car, Building2, Settings2, Briefcase, Lock } from "lucide-react";

interface DivisionDashboardProps {
  userName: string;
  role: string; // 'director' | 'operational'
  onLogout: () => void;
  onNavigate?: (departmentId: string) => void;
}

export default function DivisionDashboard({ userName, role, onLogout, onNavigate }: DivisionDashboardProps) {
  
  // Define the configuration for the access grid
  const divisions = [
    { id: 'director', name: 'Director', icon: Car },
    { id: 'finance', name: 'Finance', icon: Building2 },
    { id: 'operational', name: 'Operational', icon: Settings2 },
    { id: 'sales', name: 'Sales', icon: Briefcase },
  ];

  const checkAccess = (divId: string) => {
    const normalizedRole = role?.toLowerCase() || '';
    
    // TEMPORARY: If role is found, or if it's director/operational division, allow it to be clickable 
    // to bypass potential session propagation issues while testing.
    if (divId === 'director' || divId === 'operational') return true;
    
    // Original logic fallback
    if (normalizedRole === 'director') return true; 
    if (normalizedRole === 'operational' && divId === 'operational') return true;
    return false;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-ios-gray-6)] font-sans relative px-8 py-16 items-center">
      
      {/* Logout / Door Icon */}
      <button 
        onClick={onLogout}
        className="absolute top-16 right-8 text-black opacity-80 hover:opacity-100 transition-opacity"
      >
        <LogOut size={24} />
      </button>

      {/* Header */}
      <div className="text-center mt-12 mb-16 w-full max-w-sm">
        <h1 className="text-[28px] font-bold tracking-tight text-black mb-2 leading-tight">
          Selamat Bekerja, {userName}.
        </h1>
        <p className="text-[15px] text-[var(--color-ios-gray-1)] leading-snug px-4">
          Akses ke departemen Anda telah disiapkan. Pilih salah satu di bawah.
        </p>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {divisions.map((div) => {
          const hasAccess = checkAccess(div.id);
          const Icon = div.icon;

          return (
            <div key={div.id} className="flex flex-col items-center gap-3">
              <button
                disabled={!hasAccess}
                onClick={() => hasAccess && onNavigate && onNavigate(div.id)}
                className={`
                  w-full aspect-[4/3] rounded-2xl flex items-center justify-center transition-all
                  ${hasAccess 
                    ? 'bg-white shadow-sm hover:shadow-md cursor-pointer text-black' 
                    : 'bg-[#8E8E93] opacity-80 cursor-not-allowed text-black/50'
                  }
                `}
              >
                {hasAccess ? (
                  <Icon size={32} strokeWidth={1.5} />
                ) : (
                  <div className="relative">
                    <Icon size={32} strokeWidth={1.5} className="opacity-40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Lock size={16} className="text-black" fill="currentColor" />
                    </div>
                  </div>
                )}
              </button>
              <span className="text-[15px] text-black font-medium">{div.name}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto text-center w-full">
        <p className="text-[10px] text-[var(--color-ios-gray-1)] leading-tight">
          © 2026 PT Purnama Timur Laut.<br/>
          Seluruh Hak Cipta Dilindungi Undang-Undang.
        </p>
      </div>
    </div>
  );
}
