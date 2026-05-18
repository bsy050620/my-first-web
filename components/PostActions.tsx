"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useState } from "react";
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
  postId: number | string;
  postUserId?: string;
};

export default function PostActions({ postId, postUserId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  // UX: 권한 확인 (실제 보안은 Ch11 RLS에서 처리됨)
  const isOwner = user && postUserId && user.id === postUserId;

  async function confirmDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message ?? err?.error ?? "삭제 실패");
      }
      router.push("/posts");
    } catch (err: any) {
      setError(err?.message ?? String(err));
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      {/* 수정 버튼 */}
      <Link href={`/posts/${postId}/edit`}>
        <Button variant="outline">수정</Button>
      </Link>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">삭제</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시글 삭제</DialogTitle>
            <DialogDescription>게시글을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
