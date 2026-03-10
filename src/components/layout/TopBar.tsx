import { User } from "lucide-react";

interface TopBarProps {
  onProfileClick?: () => void;
}

export function TopBar({ onProfileClick }: TopBarProps) {
  return (
    <div className="w-full flex justify-end items-center px-6 py-4 sticky top-0 bg-[var(--color-ios-gray-6)]/80 backdrop-blur-md z-10">
      <button onClick={onProfileClick} className="w-10 h-10 rounded-full bg-[var(--color-ios-gray-5)] flex items-center justify-center text-[var(--color-ios-gray-2)]">
        <User size={24} />
      </button>
    </div>
  );
}
