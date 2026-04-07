import Link from "next/link";
import { posts } from "@/lib/posts";

export default function PostsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">블로그</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="block p-4 border rounded-lg hover:shadow-lg transition"
          >
            <h2 className="font-bold">{post.title}</h2>
            <p className="text-sm text-gray-500">
              {post.author} · {post.date}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
