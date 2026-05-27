"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { signInWithEmail, signUpWithEmail, signOut as authSignOut } from "@/lib/auth";

type User = any;

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<any>;
  signOut: () => Promise<any>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!mounted) return;
        
        if (error) {
          // "Failed to fetch" 에러 감지
          if (error.message?.includes("Failed to fetch")) {
            console.warn(
              "[AuthContext] Supabase connection failed.",
              "해결 방법:",
              "1. npm run dev로 개발 서버 재시작",
              "2. 브라우저 새로고침 (Ctrl+F5)",
              "3. .env.local 파일 확인"
            );
          } else {
            console.warn("[AuthContext] Auth init warning:", error.message ?? error);
          }
          setUser(null);
        } else {
          setUser(data?.user ?? null);
        }
      } catch (err: any) {
        console.error("[AuthContext] Auth init error:", err?.message);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      try {
        sub.subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signInWithEmail: (email: string, password: string) => signInWithEmail(email, password),
    signUpWithEmail: (email: string, password: string, name?: string) => signUpWithEmail(email, password, name),
    signOut: () => authSignOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
