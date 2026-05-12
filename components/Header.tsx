"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export default function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserEmail(data?.user?.email ?? null);
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setMessage(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(error.message);
      return;
    }
    setUserEmail(null);
    // 로그인 페이지로 이동하면서 로그아웃 메시지 표시를 위해 쿼리 파라미터 전달
    router.push("/login?logged_out=1");
  }

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-foreground">
          로고
        </Link>

        <div className="hidden md:flex gap-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition">
            메뉴
          </Link>
          <Link href="/posts" className="text-muted-foreground hover:text-foreground transition">
            게시글
          </Link>
          <Link href="/posts/new" className="text-muted-foreground hover:text-foreground transition">
            새 글
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {userEmail ? (
            <>
              <span className="text-sm text-muted-foreground">{userEmail}</span>
              <Button onClick={handleSignOut} variant="ghost">로그아웃</Button>
            </>
          ) : (
            <>
              {message && <span className="text-sm text-muted-foreground mr-2">{message}</span>}
              <Button asChild variant="ghost">
                <Link href="/login">로그인</Link>
              </Button>

              <Button asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </>
          )}

          <div className="w-8 h-8 rounded-full bg-muted" aria-hidden />
        </div>
      </div>
    </nav>
  );
}
