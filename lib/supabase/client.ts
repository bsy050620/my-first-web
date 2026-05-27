"use client"

import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 개발 환경에서 자세한 디버그 정보 제공
if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Client] Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl?.substring(0, 20) + (supabaseUrl ? '...' : '(missing)'),
    });
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Supabase 환경 변수가 설정되지 않았습니다.\n` +
    `.env.local 파일을 확인하고 다음을 포함하는지 확인하세요:\n` +
    `- NEXT_PUBLIC_SUPABASE_URL\n` +
    `- NEXT_PUBLIC_SUPABASE_ANON_KEY\n` +
    `개발 서버를 재시작해주세요.`
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
