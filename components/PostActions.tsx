"use client"

import { useRouter } from "next/navigation";
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
  postId: number;
};

export default function PostActions({ postId }: Props) {
  const router = useRouter();

  function confirmDelete() {
    // TODO: 실제 삭제 로직(서버 호출)을 여기에 넣으세요.
    router.push("/posts");
  }

  return (
    <div className="mt-6">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">삭제</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시글 삭제</DialogTitle>
            <DialogDescription>게시글을 정말 삭제하시겠습니까?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {}}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
