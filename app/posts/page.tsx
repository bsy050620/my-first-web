import { posts as localPosts, type Post } from "@/lib/posts";
import NewPostButton from "@/components/NewPostButton";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PostsPage() {
  const url = "https://jsonplaceholder.typicode.com/posts?_limit=10";

  let initialPosts: Post[] = localPosts;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      // map JSONPlaceholder shape to local Post type
      initialPosts = data.map((p: any, idx: number) => ({
        id: p.id,
        title: p.title,
        content: p.body,
        author: `User ${p.userId ?? idx + 1}`,
        date: new Date().toISOString().slice(0, 10),
      }));
    }
  } catch (e) {
    // fetch 실패 시 로컬 더미를 사용
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
