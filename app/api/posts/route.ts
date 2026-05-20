import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;

    const cookieJar = await cookies();
    const cookieStore = {
      getAll: () => cookieJar.getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: (newCookies: Array<any>) => newCookies.forEach((c) => cookieJar.set(c)),
    };

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookieStore },
    );

    // 서버에서 인증 정보로부터 user_id 추출 (클라이언트 입력 금지)
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user_id = authData.user.id;

    const { data, error } = await supabase.from('posts').insert([{ title, content, user_id }]);
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
