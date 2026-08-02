"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Users,
  Settings,
  School,
  UserCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  topic: string;
}

export function Sidebar({ className }: { className?: string }) {
  const { isCollapsed, isHidden, isOverlay, toggleVisibility, closeOverlay, setOverlay } = useSidebar();
  const { hasTopic, logout } = useAuth();
  const pathname = usePathname();

  const allMenuItems: MenuItem[] = [
    { label: "Dashboard", icon: <Home className="h-5 w-5" />, href: "/", topic: "dashboard" },
    { label: "Memberships", icon: <UserCheck className="h-5 w-5" />, href: "/memberships", topic: "memberships" },
    { label: "Education", icon: <School className="h-5 w-5" />, href: "/education", topic: "education" },
    { label: "Users", icon: <Users className="h-5 w-5" />, href: "/users", topic: "users" },
    { label: "Settings", icon: <Settings className="h-5 w-5" />, href: "/settings", topic: "settings" },
  ];

  const menuItems = allMenuItems.filter((item) => hasTopic(item.topic));

  const handleLinkClick = useCallback(() => {
    if (isOverlay) closeOverlay();
  }, [isOverlay, closeOverlay]);

  return (
    <>
      {isOverlay && !isHidden && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={closeOverlay}
        />
      )}

      <aside
        className={cn(
          "flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ease-in-out",
          isOverlay
            ? "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)]"
            : "relative",
          isOverlay
            ? isHidden
              ? "-translate-x-full"
              : "translate-x-0"
            : isHidden
              ? "w-0 border-r-0"
              : isCollapsed
                ? "w-18"
                : "w-70",
          className,
        )}
      >
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      isActive
                        ? "bg-slate-900 text-white hover:bg-slate-900/95 dark:bg-slate-700 dark:text-white font-semibold border-l-4 border-primary"
                        : "text-gray-700 dark:text-gray-300 border-l-4 border-transparent",
                      isCollapsed ? "justify-center" : "space-x-3",
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!isCollapsed && <span>{item.label}</span>}
                    {isActive && !isCollapsed && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4 shrink-0">
          <button
            type="button"
            onClick={() => { logout(); if (isOverlay) closeOverlay(); }}
            className={cn(
              "flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
              isCollapsed ? "justify-center" : "space-x-3",
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
