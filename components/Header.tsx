"use client";

import { LogOut, Menu, X } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { toggleVisibility, isHidden, isOverlay } = useSidebar();
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 z-50 w-full h-16 bg-slate-900 text-white border-b border-slate-700">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleVisibility}
            className="mr-4 text-slate-300 hover:text-white transition-colors"
          >
            {isOverlay && !isHidden ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <h1 className="text-xl font-semibold">ALSALAM Verwaltung</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300 hidden sm:inline">
              {user.firstName} {user.lastName}
            </span>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
