"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams?.get("logged_out") === "1") {
      setInfoMessage("로그아웃 되었습니다.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
      } else {
        router.push("/");
      }
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">로그인</h1>
      {infoMessage && <p className="text-sm text-muted-foreground">{infoMessage}</p>}
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
          <Button type="submit" disabled={loading || !isSupabaseConfigured}>{loading ? "로딩..." : isSupabaseConfigured ? "로그인" : "환경설정 필요"}</Button>
        </div>
      </form>
    </div>
  );
}
