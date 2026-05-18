import Link from "next/link";
import PostActions from "@/components/PostActions";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function PostPage({ params }: Props) {
  const { id } = await Promise.resolve(params);

  const cookieJar = await cookies();
  const cookieStore = {
    getAll: () => cookieJar.getAll().map((c) => ({ name: c.name, value: c.value })),
    setAll: (newCookies: Array<any>) => newCookies.forEach((c) => cookieJar.set(c)),
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore },
  );

  const { data: post, error } = await supabase
    .from("posts")
    .select("id,title,content,user_id,created_at")
    .eq("id", id)
    .single();

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다</h1>
        <p className="mb-6 text-gray-600">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
        <Link href="/posts" className="inline-block text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const createdDate = post.created_at
    ? new Date(post.created_at).toISOString().slice(0, 10)
    : "";

  return (
    <article className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-extrabold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {post.user_id} · {createdDate}
      </p>

      <div className="prose prose-lg mb-8">{post.content}</div>

      <div className="flex items-center gap-4">
        <Link href="/posts" className="text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
        {/* PostActions: 권한 확인 (UX용, 실제 보안은 Ch11 RLS) */}
        <PostActions postId={post.id} postUserId={post.user_id} />
      </div>
    </article>
  );
}
