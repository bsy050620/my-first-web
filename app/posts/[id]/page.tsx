import Link from "next/link";
import PostActions from "@/components/PostActions";
import ErrorState from "@/components/ErrorState";
import { getDisplayName, type Post } from "@/lib/posts";
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

  // profiles 테이블과 조인하여 사용자명 포함
  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `id,
      title,
      content,
      user_id,
      created_at,
      profiles:user_id(
        username
      )`
    )
    .eq("id", id)
    .single();

  if (error || !post) {
    console.error("Failed to fetch post:", error);
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <ErrorState
          title="게시글을 찾을 수 없습니다"
          message="요청하신 게시글이 존재하지 않거나 삭제되었을 수 있습니다."
          action={
            <Link href="/posts" className="inline-block text-blue-600 hover:underline text-sm font-medium">
              목록으로 돌아가기
            </Link>
          }
        />
      </div>
    );
  }

  const createdDate = new Date(post.created_at).toISOString().slice(0, 10);
  const displayName = getDisplayName(post as unknown as Post);

  return (
    <article className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-extrabold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {displayName} · {createdDate}
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
