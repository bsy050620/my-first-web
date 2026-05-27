import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: React.ReactNode;
}

export default function ErrorState({
  title = "오류가 발생했습니다",
  message,
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">{title}</h3>
          <p className="mt-1 text-sm text-red-800">{message}</p>
          {(onRetry || action) && (
            <div className="mt-4 flex gap-2">
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  다시 시도
                </Button>
              )}
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
