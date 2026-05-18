import { supabase } from "./supabase/client";

export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, name?: string) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export type AuthResult<T> = Promise<T>;
