import { type Post } from "@/lib/posts";
import NewPostButton from "@/components/NewPostButton";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import PostListItem from "@/components/PostListItem";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  let initialPosts: Post[] = [];
  let errorMessage = "";

  try {
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase select error:", error);
      errorMessage = "게시글을 불러오는 중 오류가 발생했습니다.";
    } else if (data) {
      initialPosts = data.map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        user_id: p.user_id ?? "",
        created_at: p.created_at ?? "",
      }));
    }
  } catch (e) {
    console.error("Failed to fetch posts:", e);
    errorMessage = "서버 오류가 발생했습니다.";
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">블로그</h1>
        <NewPostButton />
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded bg-red-50 text-red-600 text-sm">
          {errorMessage}
        </div>
      )}

      {initialPosts.length === 0 && !errorMessage && (
        <div className="text-center py-12 text-muted-foreground">
          게시글이 없습니다.
        </div>
      )}

      {initialPosts.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialPosts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </section>
      )}
    </div>
  );
}
