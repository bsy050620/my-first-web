import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
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
          <Button asChild variant="ghost">
            <Link href="/login">로그인</Link>
          </Button>

          <Button asChild>
            <Link href="/signup">회원가입</Link>
          </Button>

          <div className="w-8 h-8 rounded-full bg-muted" aria-hidden />
        </div>
      </div>
    </nav>
  );
}
