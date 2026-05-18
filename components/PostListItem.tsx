import Link from "next/link";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Post = {
  id: number | string;
  title: string;
  content?: string;
  user_id?: string;
  created_at?: string;
};

export default function PostListItem({ post }: { post: Post }) {
  const createdDate = post.created_at
    ? new Date(post.created_at).toISOString().slice(0, 10)
    : "";

  return (
    <article key={post.id}>
      <Card className="p-0 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="px-4 py-4">{post.title}</CardTitle>
          <CardDescription className="px-4 pb-2">
            {post.user_id} · {createdDate}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="px-4 pb-4 text-sm text-muted-foreground line-clamp-3">
            {post.content}
          </div>
        </CardContent>

        <CardFooter>
          <div className="px-4 w-full">
            <Link href={`/posts/${post.id}`}>
              <Button variant="ghost">상세</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </article>
  );
}
