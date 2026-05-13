import { posts as localPosts, type Post } from "@/lib/posts";
import NewPostButton from "@/components/NewPostButton";
import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  let initialPosts: Post[] = localPosts;

  try {
    const supabase = createServerComponentClient({ cookies });
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase select error:", error);
    } else if (data) {
      initialPosts = data.map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        author: p.user_id ?? "",
        date: p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : "",
      }));
    }
  } catch (e) {
    console.error("Failed to fetch posts:", e);
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">블로그</h1>
        <NewPostButton />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialPosts.map((post) => (
          <article key={post.id}>
            <Card className="p-0">
              <CardHeader>
                <CardTitle className="px-4 py-4">{post.title}</CardTitle>
                <CardDescription className="px-4 pb-2">{post.author} · {post.date}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="px-4 pb-4 text-sm text-muted-foreground line-clamp-3">
                  {post.content}
                </div>
              </CardContent>

              <CardFooter>
                <div className="px-4 w-full flex items-center justify-between">
                  <Link href={`/posts/${post.id}`}>
                    <Button variant="ghost">상세</Button>
                  </Link>
                  <span className="text-xs text-muted-foreground">{post.author}</span>
                </div>
              </CardFooter>
            </Card>
          </article>
        ))}
      </section>
    </div>
  );
}
