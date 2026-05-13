import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Suspense fallback={<div>로딩 중...</div>}>
        {/* Client component handles useSearchParams and interactions */}
        <LoginClient />
      </Suspense>
    </div>
  );
}
