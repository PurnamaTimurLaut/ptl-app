"use client";

import { LogIn } from "lucide-react";

interface SplashScreenProps {
  onEnter: () => void;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-ios-gray-6)] font-sans items-center justify-center p-8 relative">
      <div className="flex flex-col items-center justify-center text-center mt-auto mb-auto">
        <p className="text-[10px] text-[var(--color-ios-gray-1)] md:text-xs leading-relaxed uppercase tracking-wider">
          Authorized Personnel Only
        </p>
        <p className="text-[10px] text-[var(--color-ios-gray-1)] md:text-xs leading-relaxed mt-4">
          You are accessing a private encrypted company domain.
        </p>
        <p className="text-[10px] text-[var(--color-ios-gray-1)] md:text-xs leading-relaxed mt-4">
          Your IP address and physical location have been logged.
        </p>
        <p className="text-[10px] text-[var(--color-ios-gray-1)] md:text-xs leading-relaxed mt-4">
          Unauthorized entry is a federal offense.
        </p>
        <p className="text-[10px] text-[var(--color-ios-gray-1)] md:text-xs leading-relaxed mt-4">
          Close this website immediately to avoid local law<br />enforcement dispatch.
        </p>

        <button 
          onClick={onEnter} 
          className="mt-16 p-4 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
          aria-label="Enter Login Screen"
        >
          <LogIn className="w-5 h-5 text-black/50" />
        </button>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center">
        <img src="/purnama timur laut 1.png" alt="Purnama Timur Laut" className="h-6 object-contain mb-2" />
        <p className="text-[8px] text-[var(--color-ios-gray-1)] text-center leading-tight">
          © 2026 PT Purnama Timur Laut.<br/>
          Seluruh Hak Cipta Dilindungi Undang-Undang.
        </p>
      </div>
    </div>
  );
}
