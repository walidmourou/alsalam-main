"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isHidden: boolean;
  isOverlay: boolean;
  toggleSidebar: () => void;
  toggleVisibility: () => void;
  closeOverlay: () => void;
  setOverlay: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsOverlay(e.matches);
      if (e.matches) setIsHidden(true);
    };
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsHidden((prev) => !prev);
  }, []);

  const closeOverlay = useCallback(() => {
    if (isOverlay) setIsHidden(true);
  }, [isOverlay]);

  const setOverlay = useCallback((open: boolean) => {
    setIsHidden(!open);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isHidden,
        isOverlay,
        toggleSidebar,
        toggleVisibility,
        closeOverlay,
        setOverlay,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
