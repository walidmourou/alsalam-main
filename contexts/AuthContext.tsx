"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};

type Permission = {
  topicName: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

type AuthContextType = {
  user: User | null;
  permissions: Permission[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasTopic: (topic: string) => boolean;
  canAccess: (topic: string, action: "create" | "read" | "update" | "delete") => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setPermissions(data.permissions);
      } else {
        setUser(null);
        setPermissions([]);
      }
    } catch {
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      setUser(data.user);
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (meRes.ok) {
        const meData = await meRes.json();
        setPermissions(meData.permissions);
      }
      router.push("/");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setPermissions([]);
    router.push("/login");
  }, [router]);

  const hasTopic = useCallback(
    (topic: string) => permissions.some((p) => p.topicName === topic),
    [permissions],
  );

  const canAccess = useCallback(
    (topic: string, action: "create" | "read" | "update" | "delete") => {
      const perm = permissions.find((p) => p.topicName === topic);
      if (!perm) return false;
      switch (action) {
        case "create": return perm.canCreate;
        case "read": return perm.canRead;
        case "update": return perm.canUpdate;
        case "delete": return perm.canDelete;
      }
    },
    [permissions],
  );

  return (
    <AuthContext.Provider
      value={{ user, permissions, isLoading, login, logout, hasTopic, canAccess }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
