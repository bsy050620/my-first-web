import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "내 블로그",
  description: "웹 개발 블로그",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="flex flex-col min-h-screen">
        <nav className="bg-gray-800 text-white">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white">
              내 블로그
            </Link>

            <div className="space-x-4">
              <Link href="/" className="text-gray-200 hover:text-white transition">
                홈
              </Link>
              <Link href="/posts" className="text-gray-200 hover:text-white transition">
                게시글
              </Link>
              <Link
                href="/posts/new"
                className="text-gray-200 hover:text-white transition"
              >
                새 글 쓰기
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto p-6 flex-1">{children}</main>

        <footer className="text-center text-gray-500 py-4">© 2026 내 블로그</footer>
      </body>
    </html>
  );
}
