"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { Post } from "@/lib/posts";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  posts: Post[];
};

export default function SearchBar({ posts }: Props) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Post[]>(posts);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

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
    setSelectedId(id);
    setOpen(true);
  }

  function confirmDelete() {
    if (selectedId == null) return;
    setItems((prev) => prev.filter((p) => p.id !== selectedId));
    setSelectedId(null);
    setOpen(false);
  }

  return (
    <div>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="게시글 검색"
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((post) => (
          <Card key={post.id} className="p-0">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                {post.author} · {post.date}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {post.content}
              </p>
            </CardContent>

            <CardFooter>
              <div className="flex items-center gap-2">
                <Dialog open={open && selectedId === post.id} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                      <Button variant="destructive" onClick={() => handleDelete(post.id)}>
                        삭제
                      </Button>
                    </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>게시글 삭제</DialogTitle>
                      <DialogDescription>선택한 게시글을 정말 삭제하시겠습니까?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        취소
                      </Button>
                      <Button variant="destructive" onClick={confirmDelete}>
                        삭제
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Link href={`/posts/${post.id}`} className="">
                  <Button variant="ghost">상세</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
