"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ErrorState from "@/components/ErrorState";
import { supabase } from "@/lib/supabase/client";
import { ImagePlus, Trash2 } from "lucide-react";

type Props = {
  initialData?: { title?: string; content?: string; image_url?: string | null };
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
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url ?? null);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 로컬 이미지 URL 메모리 해제
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // 이미지 선택 변경 핸들러
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 파일 타입 유효성 검사
    if (!file.type.startsWith("image/")) {
      setServerError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    // 파일 용량 유효성 검사 (5MB 제한)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setServerError("이미지 크기는 최대 5MB까지 가능합니다.");
      return;
    }

    setServerError("");
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  // 이미지 제거 핸들러
  function handleRemoveImage() {
    setSelectedFile(null);
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      let finalImageUrl = imageUrl;

      // 1. 새 이미지가 선택된 경우 업로드 진행
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        // Supabase Storage 업로드 실행
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("[PostForm Upload Error]", uploadError);
          throw new Error(`이미지 업로드에 실패했습니다: ${uploadError.message}`);
        }

        // 공용 URL 획득
        const { data: publicUrlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      } else if (imagePreview === null) {
        // 이미지가 명시적으로 삭제된 경우
        finalImageUrl = "";
      }

      // user_id는 서버에서만 설정 (클라이언트 입력 금지)
      const payload = { title, content, image_url: finalImageUrl || null };
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

      {/* 이미지 첨부 필드 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          이미지 첨부 (선택)
        </label>
        
        {imagePreview ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 max-h-[300px] flex items-center justify-center group">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-[300px] object-contain w-full"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow transition-all opacity-95 hover:opacity-100 focus:outline-none"
              title="이미지 제거"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors mb-2">
              <ImagePlus className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-700">이미지 추가하기</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF 등 (최대 5MB)</p>
          </div>
        )}
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
