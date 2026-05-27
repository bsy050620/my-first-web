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
        console.error(
          "[PostActions DELETE] API error:",
          res.status,
          res.statusText
        );
        const responseText = await res.text();
        let err;
        try {
          err = JSON.parse(responseText);
        } catch {
          console.error(
            "[PostActions] JSON parse error. Response:",
            responseText.substring(0, 200)
          );
          throw new Error("서버 응답 형식이 올바르지 않습니다");
        }
        const errorMsg = err?.error?.message ?? err?.error ?? "게시글 삭제에 실패했습니다";
        throw new Error(errorMsg);
      }
      router.push("/posts");
    } catch (err: any) {
      const errorMessage = err?.message ?? String(err);
      setError(errorMessage);
      console.error("[PostActions Delete Error]", errorMessage, err);
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
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="min-w-[100px]"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  삭제 중...
                </span>
              ) : (
                "삭제"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
