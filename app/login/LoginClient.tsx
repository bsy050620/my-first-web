"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ErrorState from "@/components/ErrorState";
import { signInWithEmail } from "@/lib/auth";
import { convertErrorToUserMessage } from "@/lib/error-message";

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
      const { data, error: authError } = await signInWithEmail(email, password);
      if (authError) {
        const userMessage = convertErrorToUserMessage(authError);
        console.error("[LoginClient] Auth error:", authError);
        setError(userMessage);
      } else {
        router.push("/posts");
      }
    } catch (e: any) {
      const userMessage = convertErrorToUserMessage(e);
      console.error("[LoginClient] Unexpected error:", e);
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">로그인</h1>

      {infoMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-800">{infoMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isSupabaseConfigured && (
          <ErrorState
            title="설정이 필요합니다"
            message="Supabase 환경변수가 설정되어 있지 않습니다. .env.local의 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 입력하고 서버를 재시작하세요."
          />
        )}

        {error && <ErrorState message={error} />}

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">이메일</label>
          <Input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading || !isSupabaseConfigured}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">비밀번호</label>
          <Input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            disabled={loading || !isSupabaseConfigured}
            required
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading || !isSupabaseConfigured || !email.trim() || !password.trim()}
            className="min-w-[120px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                로그인 중...
              </span>
            ) : isSupabaseConfigured ? (
              "로그인"
            ) : (
              "환경설정 필요"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
