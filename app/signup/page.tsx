"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        // 가입 성공: 이메일 인증 흐름을 따르도록 /login으로 이동
        router.push("/login");
      }
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isSupabaseConfigured && (
          <p className="text-sm text-yellow-600">Supabase 환경변수가 설정되어 있지 않습니다. `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 채우고 서버를 재시작하세요.</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">이메일</label>
          <Input value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">비밀번호</label>
          <Input type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder="Password" />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading || !isSupabaseConfigured}>{loading ? "로딩..." : isSupabaseConfigured ? "회원가입" : "환경설정 필요"}</Button>
        </div>
      </form>
    </div>
  );
}
