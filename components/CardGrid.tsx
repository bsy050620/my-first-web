"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Post } from "@/lib/posts";
import { getDisplayName } from "@/lib/posts";

export default function CardGrid() {
  const [list, setList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/posts?limit=3", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setList((data?.data || []).slice(0, 3));
        }
      } catch (err) {
        console.error("[CardGrid] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">로딩 중...</div>;
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((p) => (
        <Link
          key={p.id}
          href={`/posts/${p.id}`}
          className="block rounded-lg border border-border p-6 bg-card transition hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-card-foreground mb-2">{p.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.content}</p>
          <div className="text-xs text-muted-foreground">
            {getDisplayName(p)} · {new Date(p.created_at).toISOString().slice(0, 10)}
          </div>
        </Link>
      ))}
    </section>
  );
}
