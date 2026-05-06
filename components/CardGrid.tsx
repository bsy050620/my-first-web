import Link from "next/link";
import { posts } from "@/lib/posts";

export default function CardGrid() {
  const list = posts.slice(0, 3);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {list.map((p) => (
        <Link
          key={p.id}
          href={`/posts/${p.id}`}
          className="block rounded-lg border border-gray-200 p-6 bg-white hover:shadow transition"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{p.title}</h3>
          <p className="text-sm text-gray-500 mb-4">{p.content.slice(0, 100)}...</p>
          <div className="text-xs text-gray-400">{p.author} · {p.date}</div>
        </Link>
      ))}
    </section>
  );
}
