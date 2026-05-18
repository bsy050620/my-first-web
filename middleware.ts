import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const protectedPaths = ['/posts/new', '/api/posts'];
  const pathname = req.nextUrl.pathname;

  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    // Build a minimal cookie store compatible with @supabase/ssr
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
      // On any error, redirect to login to avoid leaking protected content
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
