"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
  } | null;
};

type Props = {
  postId: string;
};

// 사용자 이름에 따른 고유한 아바타 그라데이션 백그라운드 색상 생성
function getAvatarGradient(username: string): string {
  const gradients = [
    "bg-gradient-to-br from-blue-500 to-indigo-500 text-white",
    "bg-gradient-to-br from-purple-500 to-pink-500 text-white",
    "bg-gradient-to-br from-emerald-500 to-teal-500 text-white",
    "bg-gradient-to-br from-orange-500 to-amber-500 text-white",
    "bg-gradient-to-br from-rose-500 to-red-500 text-white",
    "bg-gradient-to-br from-violet-500 to-purple-500 text-white",
  ];
  if (!username) return gradients[0];
  let sum = 0;
  for (let i = 0; i < username.length; i++) {
    sum += username.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
}

export default function PostComments({ postId }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

  // 수정 관련 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 삭제 더블체크 상태 (Premium UX: 3초 후 초기화)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 댓글 불러오기
  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true);
        setError("");
        const { data, error: fetchErr } = await supabase
          .from("comments")
          .select(`
            id,
            post_id,
            user_id,
            content,
            created_at,
            profiles:user_id (
              username
            )
          `)
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (fetchErr) {
          console.error("[PostComments] Fetch error:", JSON.stringify(fetchErr, null, 2));
          // 테이블 미존재 (42P01) 또는 relation 에러 감지
          const code = fetchErr.code;
          const msg = fetchErr.message || "";
          if (code === "42P01" || msg.includes("does not exist")) {
            setError("댓글 기능에 필요한 데이터베이스 설정이 완료되지 않았습니다. (comments 테이블 없음)");
          } else {
            setError(`댓글을 불러오는 데 실패했습니다. (${code || "UNKNOWN"})`);
          }
          return;
        }
        setComments((data as any[]) || []);
      } catch (err: any) {
        console.error("[PostComments] Unexpected fetch error:", String(err?.message || err));
        setError("댓글을 불러오는 중 예기치 않은 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    if (postId) {
      fetchComments();
    }
  }, [postId]);

  // 타이머 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  // 댓글 작성
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // 1. 댓글 추가
      const { data: insertData, error: insertErr } = await supabase
        .from("comments")
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: newComment.trim(),
          },
        ])
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at,
          profiles:user_id (
            username
          )
        `)
        .single();

      if (insertErr) {
        console.error("[PostComments] Insert error:", JSON.stringify(insertErr, null, 2));
        setError(insertErr.message || "댓글 등록에 실패했습니다.");
        return;
      }

      // 2. 상태 업데이트
      if (insertData) {
        setComments((prev) => [...prev, insertData as any]);
      }
      setNewComment("");
    } catch (err: any) {
      console.error("[PostComments] Unexpected insert error:", String(err?.message || err));
      setError("댓글 등록 중 예기치 않은 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  // 댓글 수정 모드 진입
  function startEdit(comment: Comment) {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  }

  // 댓글 수정 취소
  function cancelEdit() {
    setEditingId(null);
    setEditingContent("");
  }

  // 댓글 수정 저장
  async function handleUpdate(commentId: string) {
    if (!editingContent.trim() || updatingId) return;

    setUpdatingId(commentId);
    setError("");

    try {
      const { error: updateErr } = await supabase
        .from("comments")
        .update({ content: editingContent.trim() })
        .eq("id", commentId);

      if (updateErr) {
        console.error("[PostComments] Update error:", JSON.stringify(updateErr, null, 2));
        setError(updateErr.message || "댓글 수정에 실패했습니다.");
        return;
      }

      // 상태 반영
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: editingContent.trim() } : c
        )
      );
      setEditingId(null);
      setEditingContent("");
    } catch (err: any) {
      console.error("[PostComments] Unexpected update error:", String(err?.message || err));
      setError("댓글 수정 중 예기치 않은 오류가 발생했습니다.");
    } finally {
      setUpdatingId(null);
    }
  }

  // 댓글 삭제 클릭
  function clickDelete(commentId: string) {
    // 이미 해당 댓글이 확인 단계라면 삭제 실행
    if (confirmDeleteId === commentId) {
      executeDelete(commentId);
    } else {
      // 1차 확인 활성화 & 3초 타이머 시작
      setConfirmDeleteId(commentId);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = setTimeout(() => {
        setConfirmDeleteId(null);
      }, 3000);
    }
  }

  // 댓글 삭제 실행
  async function executeDelete(commentId: string) {
    setDeletingId(commentId);
    setError("");

    try {
      const { error: deleteErr } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (deleteErr) {
        console.error("[PostComments] Delete error:", JSON.stringify(deleteErr, null, 2));
        setError(deleteErr.message || "댓글 삭제에 실패했습니다.");
        return;
      }

      // 상태 반영
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error("[PostComments] Unexpected delete error:", String(err?.message || err));
      setError("댓글 삭제 중 예기치 않은 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  // 시간 표시 포맷 헬퍼
  function formatTime(timeStr: string) {
    const d = new Date(timeStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    const hour = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${date} ${hour}:${min}`;
  }

  return (
    <div className="mt-12 border-t border-border pt-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        댓글
        <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {comments.length}
        </span>
      </h2>

      {/* 에러 피드백 */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 댓글 목록 */}
      {loading ? (
        <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
          <span className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span>댓글을 불러오는 중...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 border border-dashed border-border rounded-xl text-center text-muted-foreground mb-8">
          등록된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => {
            const isOwner = user && comment.user_id === user.id;
            const displayName = comment.profiles?.username || "Unknown User";
            const firstChar = displayName.charAt(0).toUpperCase();
            const avatarStyle = getAvatarGradient(displayName);
            const isEditing = editingId === comment.id;
            const isConfirmingDelete = confirmDeleteId === comment.id;

            return (
              <div
                key={comment.id}
                className="flex gap-4 group/comment border-b border-border/50 pb-6 last:border-0"
              >
                {/* 아바타 */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${avatarStyle}`}>
                  {firstChar}
                </div>

                {/* 댓글 본체 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-foreground">
                      {displayName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(comment.created_at)}
                    </span>
                  </div>

                  {/* 댓글 내용 (수정 모드에 따른 조건부 렌더링) */}
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                        rows={3}
                        maxLength={1000}
                        disabled={updatingId !== null}
                      />
                      <div className="flex justify-end gap-2 text-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={updatingId !== null}
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(comment.id)}
                          disabled={updatingId !== null || !editingContent.trim()}
                        >
                          {updatingId === comment.id ? "저장 중..." : "저장"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap break-all mt-1 leading-relaxed">
                      {comment.content}
                    </p>
                  )}

                  {/* 액션 버튼 (본인 소유이고 수정 중이 아닐 때 노출) */}
                  {isOwner && !isEditing && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground opacity-80 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(comment)}
                        className="hover:text-primary transition"
                        disabled={deletingId !== null}
                      >
                        수정
                      </button>
                      <span className="text-border/80">|</span>
                      <button
                        onClick={() => clickDelete(comment.id)}
                        className={`transition font-medium ${
                          isConfirmingDelete
                            ? "text-destructive font-bold animate-pulse"
                            : "hover:text-destructive"
                        }`}
                        disabled={deletingId !== null}
                      >
                        {deletingId === comment.id
                          ? "삭제 중..."
                          : isConfirmingDelete
                          ? "정말 삭제?"
                          : "삭제"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 댓글 입력 폼 */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="따뜻한 댓글을 남겨보세요."
              className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none min-h-[90px]"
              maxLength={1000}
              disabled={submitting}
              required
            />
            <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
              {newComment.length}/1000
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-6"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  등록 중...
                </span>
              ) : (
                "등록"
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 bg-muted/30 border border-border rounded-xl text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            댓글을 작성하려면 로그인이 필요합니다.
          </p>
          <Link href="/login" className="inline-block">
            <Button variant="outline" size="sm">
              로그인하기
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
