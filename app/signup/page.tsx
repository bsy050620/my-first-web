"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ErrorState from "@/components/ErrorState";
import { signUpWithEmail } from "@/lib/auth";
import { convertErrorToUserMessage } from "@/lib/error-message";

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다");
      return;
    }

    setLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await signUpWithEmail(email, password);
      if (signUpError) {
        const userMessage = convertErrorToUserMessage(signUpError);
        console.error("[SignupPage] Auth error:", signUpError);
        setError(userMessage);
      } else {
        router.push("/login");
      }
    } catch (e: any) {
      const userMessage = convertErrorToUserMessage(e);
      console.error("[SignupPage] Unexpected error:", e);
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>
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
            placeholder="최소 6자 이상"
            disabled={loading || !isSupabaseConfigured}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">비밀번호 확인</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            disabled={loading || !isSupabaseConfigured}
            required
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading || !isSupabaseConfigured || !email.trim() || !password.trim() || !confirmPassword.trim()}
            className="min-w-[140px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                회원가입 중...
              </span>
            ) : isSupabaseConfigured ? (
              "회원가입"
            ) : (
              "환경설정 필요"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
