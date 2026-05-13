"use client";

import { createClient } from "@supabase/supabase-js";

// Browser client for Supabase. If env vars are missing, export a safe stub
// so client pages don't crash during module evaluation.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Minimal stub matching the subset of the Supabase client API we use.
  const stub = {
    auth: {
      async signInWithPassword(_: { email: string; password: string }) {
        return { data: null, error: { message: "Supabase not configured (set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)" } };
      },
      async signUp(_: { email: string; password: string }) {
        return { data: null, error: { message: "Supabase not configured (set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)" } };
      },
    },
  } as any;

  export const supabase: any = stub;
} else {
  export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
}
