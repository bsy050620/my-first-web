import React from "react";
import PostForm from "@/components/PostForm";
import ErrorState from "@/components/ErrorState";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function EditPage({ params }: Props) {
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

  // 1. 현재 사용자 인증 확인
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    console.warn("[EditPage] Unauthenticated access attempt");
    redirect("/login");
  }
  const currentUserId = authData.user.id;

  // 2. 포스트 조회
  const { data: post, error } = await supabase
    .from("posts")
    .select("id,title,content,user_id,created_at,image_url")
    .eq("id", id)
    .single();

  if (error || !post) {
    console.error("Failed to fetch post for edit:", error);
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <ErrorState
          title="게시글을 불러올 수 없습니다"
          message="요청하신 게시글이 존재하지 않습니다."
          action={
            <Link href="/posts" className="inline-block text-blue-600 hover:underline text-sm font-medium">
              목록으로 돌아가기
            </Link>
          }
        />
      </div>
    );
  }

  // 3. 권한 확인: 포스트 작성자만 수정 가능
  if (post.user_id !== currentUserId) {
    console.warn(
      `[EditPage] Permission denied: user ${currentUserId} attempted to edit post by ${post.user_id}`
    );
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <ErrorState
          title="수정 권한이 없습니다"
          message="본인이 작성한 게시글만 수정할 수 있습니다."
          action={
            <Link href="/posts" className="inline-block text-blue-600 hover:underline text-sm font-medium">
              목록으로 돌아가기
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>
      <PostForm initialData={{ title: post.title, content: post.content, image_url: post.image_url }} postId={String(id)} />
    </div>
  );
}
