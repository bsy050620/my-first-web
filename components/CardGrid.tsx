import Link from "next/link";
import { posts } from "@/lib/posts";

export default function CardGrid() {
  const list = posts.slice(0, 3);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((p) => (
        <Link
          key={p.id}
          href={`/posts/${p.id}`}
          className="block rounded-lg border border-border p-6 bg-card transition"
        >
          <h3 className="text-lg font-semibold text-card-foreground mb-2">{p.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{p.content.slice(0, 100)}...</p>
          <div className="text-xs text-muted-foreground">{p.author} · {p.date}</div>
        </Link>
      ))}
    </section>
  );
}
