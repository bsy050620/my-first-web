import { posts as localPosts, type Post } from "@/lib/posts";
import SearchBar from "./SearchBar";

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
    <div>
      <h1 className="text-2xl font-bold mb-6">블로그</h1>
      <SearchBar posts={initialPosts} />
    </div>
  );
}
