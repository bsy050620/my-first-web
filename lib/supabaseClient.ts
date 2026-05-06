"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey
);

const stub = {
  auth: {
    async signInWithPassword(_: { email: string; password: string }) {
      return {
        data: null,
        error: {
          message:
            "Supabase not configured (set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)",
        },
      };
    },
    async signUp(_: { email: string; password: string }) {
      return {
        data: null,
        error: {
          message:
            "Supabase not configured (set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)",
        },
      };
    },
  },
} as any;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : stub;