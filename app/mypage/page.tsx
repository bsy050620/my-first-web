import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function MyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">마이 페이지</h1>
        <p className="text-sm text-muted-foreground">내 프로필과 작성한 글을 관리합니다.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="px-4 py-4">프로필</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-3">프로필 정보가 이곳에 표시됩니다.</p>
            <div className="flex gap-3">
              <Link href="/posts/new" className="">
                <button className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-2">새 글 작성</button>
              </Link>
              <Link href="/posts" className="inline-flex items-center rounded-md border border-border px-3 py-2 text-muted-foreground">내 글 보기</Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
