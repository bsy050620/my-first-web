import React from "react";
import PostForm from "@/components/PostForm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";

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

  const { data, error } = await supabase
    .from("posts")
    .select("id,title,content,user_id,created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-4">게시글을 불러오는 중 오류가 발생했습니다.</h1>
        <Link href="/posts" className="text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>
      <PostForm initialData={{ title: data.title, content: data.content }} postId={String(id)} />
    </div>
  );
}
