import type { User } from "firebase/auth";
import { LogOut } from "lucide-react";

interface HeaderProps {
  user: User;
  onLogoClick?: () => void;
  onLogout?: () => void;
}

export const Header = ({ user, onLogoClick, onLogout }: HeaderProps) => {
  return (
    <header className="h-16 bg-white flex items-center justify-between px-8 sticky top-0 z-40 border-b border-gray-50">
      {/* App Logo/Brand */}
      <div
        className="flex items-center cursor-pointer group"
        onClick={onLogoClick}
      >
        <h1 className="text-[#2d2d66] font-semibold text-xl tracking-tight group-hover:text-[#6c7df3] transition-colors">
          HoloStudy
        </h1>
      </div>

      {/* User Profile & Sign Out Actions */}
      <div className="flex items-center gap-4">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User profile"}
            className="w-8 h-8 rounded-full border border-gray-100"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#6c7df3] flex items-center justify-center font-bold text-xs">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
          </div>
        )}

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-[#1a1a4b]">
            {user.displayName || "User"}
          </span>
          <span className="text-[10px] text-gray-400 font-medium max-w-30 truncate">
            {user.email}
          </span>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors ml-2"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
