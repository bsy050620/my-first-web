import Link from "next/link";

export default function Header() {
  return (
    <nav className="bg-gray-100 border-b">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-800">
          로고
        </Link>

        <div className="hidden md:flex gap-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
            메뉴
          </Link>
          <Link href="/posts" className="text-gray-600 hover:text-gray-900 transition">
            게시글
          </Link>
          <Link href="/posts/new" className="text-gray-600 hover:text-gray-900 transition">
            새 글
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-gray-600 hover:text-gray-900 transition">로그인</button>
          <div className="w-8 h-8 rounded-full bg-gray-300" aria-hidden />
        </div>
      </div>
    </nav>
  );
}
