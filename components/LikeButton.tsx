"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

/** likes 테이블 미존재 에러 감지 */
function isTableMissingError(err: any): boolean {
  if (!err) return false;
  const code = err.code;
  const msg = err.message || "";
  // 42P01 = relation does not exist
  if (code === "42P01" || msg.includes("does not exist")) return true;
  // code와 message가 모두 없는 에러 = 테이블 미존재 등 알 수 없는 에러
  if (!code && !msg) return true;
  return false;
}

type Props = {
  postId: string;
  /** 컴팩트 모드 (목록 카드용) - 작은 사이즈로 표시 */
  compact?: boolean;
};

export default function LikeButton({ postId, compact = false }: Props) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // 좋아요 상태 및 카운트 조회
  const fetchLikeStatus = useCallback(async () => {
    try {
      // 총 좋아요 수 조회
      const { count: totalCount, error: countErr } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (countErr) {
        // 테이블 미존재 시 조용히 실패 (빈 에러 객체 {} 포함)
        if (isTableMissingError(countErr)) {
          console.warn("[LikeButton] likes 테이블이 아직 존재하지 않습니다. 마이그레이션을 실행해주세요.");
        } else {
          console.error("[LikeButton] Count fetch error:", countErr);
        }
        return;
      }

      setCount(totalCount ?? 0);

      // 로그인한 사용자의 좋아요 여부 확인
      if (user) {
        const { data: likeData, error: likeErr } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (likeErr) {
          if (!isTableMissingError(likeErr)) {
            console.error("[LikeButton] Like check error:", likeErr);
          }
          return;
        }

        setLiked(!!likeData);
      }
    } catch (err: any) {
      console.error("[LikeButton] Unexpected error:", err?.message || err);
    } finally {
      setLoading(false);
    }
  }, [postId, user]);

  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus]);

  // 좋아요 토글
  async function handleToggle() {
    if (!user || toggling) return;

    setToggling(true);

    try {
      if (liked) {
        // 좋아요 취소 (DELETE)
        const { error: deleteErr } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (deleteErr) {
          console.error("[LikeButton] Unlike error:", deleteErr);
          return;
        }

        setLiked(false);
        setCount((prev) => Math.max(0, prev - 1));
      } else {
        // 좋아요 추가 (INSERT)
        const { error: insertErr } = await supabase
          .from("likes")
          .insert([{ post_id: postId, user_id: user.id }]);

        if (insertErr) {
          // 중복 좋아요 (unique violation) 처리
          if (insertErr.code === "23505") {
            setLiked(true);
            return;
          }
          // 테이블 미존재 시 조용히 무시
          if (isTableMissingError(insertErr)) {
            console.warn("[LikeButton] likes 테이블이 아직 존재하지 않습니다.");
            return;
          }
          console.error("[LikeButton] Like error:", insertErr);
          return;
        }

        setLiked(true);
        setCount((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error("[LikeButton] Toggle error:", err?.message || err);
    } finally {
      setToggling(false);
    }
  }

  // 하트 아이콘 SVG
  const HeartIcon = ({ filled, size }: { filled: boolean; size: number }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-all duration-300 ${
        filled ? "scale-110" : "scale-100"
      }`}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  if (loading) {
    return (
      <div
        className={`flex items-center gap-1.5 ${
          compact ? "text-xs" : "text-sm"
        } text-muted-foreground`}
      >
        <div
          className={`${
            compact ? "w-4 h-4" : "w-5 h-5"
          } rounded-full bg-muted animate-pulse`}
        />
        <span className="w-4 h-3 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <button
      id={`like-button-${postId}`}
      type="button"
      onClick={handleToggle}
      disabled={!user || toggling}
      title={
        !user
          ? "로그인 후 좋아요를 누를 수 있습니다"
          : liked
          ? "좋아요 취소"
          : "좋아요"
      }
      className={`
        group/like inline-flex items-center gap-1.5
        rounded-full border transition-all duration-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
        ${
          compact
            ? "px-2.5 py-1 text-xs"
            : "px-3.5 py-1.5 text-sm"
        }
        ${
          liked
            ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
            : "border-border bg-transparent text-muted-foreground hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:border-rose-500/40 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
        }
        ${!user ? "opacity-60 cursor-default" : "cursor-pointer"}
        ${toggling ? "pointer-events-none opacity-70" : ""}
      `}
    >
      <span
        className={`transition-transform duration-300 ${
          toggling ? "animate-ping-once" : ""
        } ${liked ? "text-rose-500 dark:text-rose-400" : ""}`}
      >
        <HeartIcon filled={liked} size={compact ? 14 : 18} />
      </span>
      <span className="font-medium tabular-nums min-w-[1ch]">{count}</span>
    </button>
  );
}
