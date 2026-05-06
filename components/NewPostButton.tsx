"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewPostButton() {
  return (
    <div className="mt-4">
      <Button asChild>
        <Link href="/posts/new">글쓰기</Link>
      </Button>
    </div>
  );
}
