import Link from "next/link";
import PostActions from "@/components/PostActions";
import ErrorState from "@/components/ErrorState";
import { getDisplayName, type Post } from "@/lib/posts";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import PostComments from "@/components/PostComments";

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
  const { data: post, error: queryError } = await supabase
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

  let postData = post;
  let finalError = queryError;

  // 조인 쿼리 실패 시 profiles 없이 조회 (폴백)
  if (queryError) {
    console.warn(
      `[PostPage] Join query failed, attempting fallback query. Code: ${queryError.code}, Message: ${queryError.message}`
    );
    const fallback = await supabase
      .from("posts")
      .select("id, title, content, user_id, created_at")
      .eq("id", id)
      .single();
    
    if (fallback.data) {
      postData = {
        ...fallback.data,
        profiles: null,
      } as any;
    }
    finalError = fallback.error;
  }

  if (finalError || !postData) {
    if (finalError) {
      console.error("Failed to fetch post:", {
        code: finalError.code,
        message: finalError.message,
        details: finalError.details,
        hint: finalError.hint,
      });
    } else {
      console.warn(`Post with ID ${id} not found.`);
    }
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

  const createdDate = new Date(postData.created_at).toISOString().slice(0, 10);
  const displayName = getDisplayName(postData as unknown as Post);

  return (
    <article className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-extrabold mb-2">{postData.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {displayName} · {createdDate}
      </p>

      <div className="prose prose-lg mb-8">{postData.content}</div>

      <div className="flex items-center gap-4">
        <Link href="/posts" className="text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
        {/* PostActions: 권한 확인 (UX용, 실제 보안은 Ch11 RLS) */}
        <PostActions postId={postData.id} postUserId={postData.user_id} />
      </div>

      <PostComments postId={postData.id} />
    </article>
  );
}
