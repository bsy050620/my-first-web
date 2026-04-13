"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { Post } from "@/lib/posts";

type Props = {
  posts: Post[];
};

export default function SearchBar({ posts }: Props) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Post[]>(posts);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
    );
  }, [query, items]);

  function handleDelete(id: number) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="게시글 검색"
        className="w-full mb-4 border rounded-md px-3 py-2"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((post) => (
          <div key={post.id} className="p-4 border rounded-lg">
            <Link href={`/posts/${post.id}`} className="block">
              <h2 className="font-bold">{post.title}</h2>
              <p className="text-sm text-gray-500">
                {post.author} · {post.date}
              </p>
            </Link>

            <div className="mt-2 flex items-center space-x-2">
              <button
                onClick={() => handleDelete(post.id)}
                className="text-red-600 hover:underline"
              >
                삭제
              </button>
              <Link href={`/posts/${post.id}`} className="text-blue-600 hover:underline">
                상세
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
