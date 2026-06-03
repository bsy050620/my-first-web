import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * 인증 검증 헬퍼 함수
 * Supabase 세션에서 현재 사용자를 확인합니다.
 * 
 * @returns 사용자 객체 또는 null
 */
async function checkAuth(req: NextRequest) {
  const cookieJar = req.cookies;
  const cookieStore = {
    getAll: () => cookieJar.getAll().map((c) => ({ name: c.name, value: c.value })),
    setAll: (newCookies: Array<any>) => newCookies.forEach((c) => cookieJar.set(c.name, c.value)),
  } as any;

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookieStore },
    );

    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('[Middleware] Auth check error:', error.message);
      return null;
    }
    return data?.user || null;
  } catch (err: any) {
    console.error('[Middleware] Unexpected error during auth check:', err?.message);
    return null;
  }
}

/**
 * 인증 필요 여부를 판단합니다.
 */
function isProtectedRoute(pathname: string, method: string): boolean {
  // 1. /posts/new - 모든 요청 보호
  if (pathname === '/posts/new') {
    return true;
  }

  // 2. /posts/[id]/edit - GET 요청 보호
  if (/^\/posts\/[^/]+\/edit$/.test(pathname) && method === 'GET') {
    return true;
  }

  // 3. /api/posts - GET 제외한 모든 요청 보호 (POST, PATCH, DELETE)
  if (pathname.startsWith('/api/posts') && method !== 'GET') {
    return true;
  }

  return false;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  // 보호된 라우트인지 확인
  if (isProtectedRoute(pathname, method)) {
    const user = await checkAuth(req);
    
    if (!user) {
      // API 요청일 경우 JSON 응답, 페이지 요청일 경우 리다이렉트
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: { message: '인증이 필요합니다' } },
          { status: 401 }
        );
      }

      // 페이지 라우트: /login으로 리다이렉트
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // 매칭할 경로: /posts 하위 모든 경로, /api/posts 하위 모든 경로
  // isProtectedRoute()에서 정확한 보호 여부 판단
  matcher: ['/posts/:path*', '/api/posts/:path*'],
};
