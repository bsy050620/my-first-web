import Link from "next/link";
import React from "react";
import type { Post } from "@/lib/posts";
import { getDisplayName } from "@/lib/posts";
import LikeButton from "@/components/LikeButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PostListItem({ post }: { post: Post }) {
  const createdDate = new Date(post.created_at).toISOString().slice(0, 10);
  const displayName = getDisplayName(post);

  return (
    <article key={post.id}>
      <Card className="p-0 h-full flex flex-col overflow-hidden border-gray-200/80 transition-all duration-300 hover:shadow-md hover:border-gray-300">
        {post.image_url && (
          <div className="relative w-full h-48 bg-gray-50 border-b border-gray-100 overflow-hidden">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="px-4 py-4 line-clamp-1">{post.title}</CardTitle>
          <CardDescription className="px-4 pb-2">
            {displayName} · {createdDate}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="px-4 pb-4 text-sm text-muted-foreground line-clamp-3">
            {post.content}
          </div>
        </CardContent>

        <CardFooter>
          <div className="px-4 w-full flex items-center justify-between">
            <Link href={`/posts/${post.id}`}>
              <Button variant="ghost">상세</Button>
            </Link>
            <LikeButton postId={post.id} compact />
          </div>
        </CardFooter>
      </Card>
    </article>
  );
}
