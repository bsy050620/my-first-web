"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ErrorState from "@/components/ErrorState";

type Props = {
  initialData?: { title?: string; content?: string };
  postId?: string;
};

// 유효성 검증 규칙
const VALIDATION_RULES = {
  title: {
    minLength: 2,
    maxLength: 200,
  },
  content: {
    minLength: 10,
  },
};

interface FieldErrors {
  title?: string;
  content?: string;
}

export default function PostForm({ initialData, postId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // 필드별 유효성 검증
  function validateField(
    field: "title" | "content",
    value: string
  ): string | undefined {
    const trimmedValue = value.trim();

    if (field === "title") {
      if (!trimmedValue) {
        return "제목은 필수입니다";
      }
      if (trimmedValue.length < VALIDATION_RULES.title.minLength) {
        return `제목은 최소 ${VALIDATION_RULES.title.minLength}자 이상이어야 합니다`;
      }
      if (value.length > VALIDATION_RULES.title.maxLength) {
        return `제목은 ${VALIDATION_RULES.title.maxLength}자 이하여야 합니다`;
      }
    }

    if (field === "content") {
      if (!trimmedValue) {
        return "내용은 필수입니다";
      }
      if (trimmedValue.length < VALIDATION_RULES.content.minLength) {
        return `내용은 최소 ${VALIDATION_RULES.content.minLength}자 이상이어야 합니다`;
      }
    }

    return undefined;
  }

  // 전체 폼 유효성 검증
  function validateForm(): boolean {
    const errors: FieldErrors = {};
    const titleError = validateField("title", title);
    const contentError = validateField("content", content);

    if (titleError) errors.title = titleError;
    if (contentError) errors.content = contentError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // 제목 변경
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // 실시간 유효성 검증
    const error = validateField("title", newTitle);
    setFieldErrors((prev) => ({
      ...prev,
      title: error,
    }));
  }

  // 내용 변경
  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newContent = e.target.value;
    setContent(newContent);

    // 실시간 유효성 검증
    const error = validateField("content", newContent);
    setFieldErrors((prev) => ({
      ...prev,
      content: error,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    // 폼 유효성 검증
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setServerError("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // user_id는 서버에서만 설정 (클라이언트 입력 금지)
      const payload = { title, content };
      const url = postId ? `/api/posts/${postId}` : "/api/posts";
      const method = postId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(
          `[PostForm ${method}] API error: ${res.status}`,
          res.statusText
        );
        const responseText = await res.text();
        let err;
        try {
          err = JSON.parse(responseText);
        } catch {
          console.error(
            "[PostForm] JSON parse error. Response:",
            responseText.substring(0, 200)
          );
          throw new Error("서버 응답 형식이 올바르지 않습니다");
        }
        throw new Error(err?.error?.message ?? err?.error ?? "요청 실패");
      }

      router.push("/posts");
    } catch (err: any) {
      const errorMessage = err?.message ?? String(err);
      setServerError(errorMessage);
      console.error(
        `[PostForm Error - ${postId ? "Update" : "Create"}]`,
        errorMessage,
        err
      );
    } finally {
      setLoading(false);
    }
  }

  const isFormValid =
    !loading &&
    title.trim().length >= VALIDATION_RULES.title.minLength &&
    content.trim().length >= VALIDATION_RULES.content.minLength &&
    !fieldErrors.title &&
    !fieldErrors.content;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && <ErrorState message={serverError} />}

      {/* 제목 필드 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          제목 *
        </label>
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="제목을 입력하세요 (최소 2자)"
          disabled={loading}
          maxLength={VALIDATION_RULES.title.maxLength}
          className={fieldErrors.title ? "border-red-500" : ""}
          required
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {title.length}/{VALIDATION_RULES.title.maxLength}
          </p>
          {fieldErrors.title && (
            <p className="text-xs text-red-600 font-medium">{fieldErrors.title}</p>
          )}
        </div>
      </div>

      {/* 내용 필드 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          내용 *
        </label>
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="내용을 입력하세요 (최소 10자)"
          rows={8}
          className={`w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            fieldErrors.content
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          disabled={loading}
          required
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {content.length}자
          </p>
          {fieldErrors.content && (
            <p className="text-xs text-red-600 font-medium">{fieldErrors.content}</p>
          )}
        </div>
      </div>

      {/* 제출 버튼 영역 */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          disabled={!isFormValid}
          className="min-w-[120px]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {postId ? "수정 중..." : "저장 중..."}
            </span>
          ) : postId ? (
            "수정 저장"
          ) : (
            "저장"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/posts")}
          disabled={loading}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
