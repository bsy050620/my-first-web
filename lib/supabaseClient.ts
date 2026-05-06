"use client";

// Re-export the single browser Supabase client to avoid multiple client instances
// across the app. The canonical client lives in `lib/supabase/client.ts`.
export { supabase } from "./supabase/client";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);