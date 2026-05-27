import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  // GET /api/posts는 공개이므로 보호하지 않음
  const protectedPaths = ['/posts/new', '/api/posts/((?!GET).)*'];
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  // POST /api/posts는 보호해야 함
  if (pathname.startsWith('/api/posts') && method !== 'GET') {
    const cookieJar = req.cookies;
    const cookieStore = {
      getAll: () => cookieJar.getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: (newCookies: Array<any>) => newCookies.forEach((c) => cookieJar.set(c.name, c.value)),
    } as any;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookieStore },
    );

    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
    } catch (err) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // /posts/new는 항상 보호
  if (pathname.startsWith('/posts/new')) {
    const cookieJar = req.cookies;
    const cookieStore = {
      getAll: () => cookieJar.getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: (newCookies: Array<any>) => newCookies.forEach((c) => cookieJar.set(c.name, c.value)),
    } as any;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookieStore },
    );

    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
    } catch (err) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/posts/new', '/api/posts'],
};
