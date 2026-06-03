import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    let cookieJar;
    try {
      cookieJar = await cookies();
    } catch (cookieErr) {
      console.error('[API GET /posts] Cookie error:', cookieErr);
      return NextResponse.json(
        { 
          error: { 
            message: '서버 설정 오류가 발생했습니다',
            debug: 'Cookie 접근 실패'
          } 
        },
        { status: 500 }
      );
    }

    const cookieStore = {
      getAll: () => cookieJar.getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: (newCookies: Array<any>) => newCookies.forEach((c) => cookieJar.set(c)),
    };

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[API GET /posts] Missing Supabase environment variables');
      return NextResponse.json(
        { 
          error: { 
            message: 'Supabase 설정이 필요합니다',
            debug: 'NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 미설정'
          } 
        },
        { status: 500 }
      );
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: cookieStore },
    );

    // profiles 테이블과 조인하여 사용자명 포함
    // user_id → profiles(id) 외래키 관계
    let data, error;
    
    ({ data, error } = await supabase
      .from('posts')
      .select(
        `id,
        title,
        content,
        user_id,
        created_at,
        profiles!user_id(username)`
      )
      .order('created_at', { ascending: false }));

    // 조인 쿼리 실패 시 profiles 없이 조회 (폴백)
    if (error) {
      console.warn('[API GET /posts] Join query failed, attempting fallback:', error.code, error.message);
      ({ data, error } = await supabase
        .from('posts')
        .select('id,title,content,user_id,created_at')
        .order('created_at', { ascending: false }));
    }

    if (error) {
      console.error('[API GET /posts] Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { 
          error: { 
            message: '게시글을 불러오는 데 실패했습니다',
            debug: `[${error.code}] ${error.message}`,
            details: error.details
          } 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error('[API GET /posts] Unexpected error:', {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    });
    return NextResponse.json(
      { 
        error: { 
          message: '서버 오류가 발생했습니다',
          debug: err?.message
        } 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: { message: '제목은 필수입니다' } },
        { status: 400 }
      );
    }

    let cookieJar;
    try {
      cookieJar = await cookies();
    } catch (cookieErr) {
      console.error('[API POST /posts] Cookie error:', cookieErr);
      return NextResponse.json(
        { 
          error: { 
            message: '서버 설정 오류가 발생했습니다',
            debug: 'Cookie 접근 실패'
          } 
        },
        { status: 500 }
      );
    }

    const cookieStore = {
      getAll: () => cookieJar.getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: (newCookies: Array<any>) => newCookies.forEach((c) => cookieJar.set(c)),
    };

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[API POST /posts] Missing Supabase environment variables');
      return NextResponse.json(
        { 
          error: { 
            message: 'Supabase 설정이 필요합니다',
            debug: 'NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 미설정'
          } 
        },
        { status: 500 }
      );
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: cookieStore },
    );

    // 서버에서 인증 정보로부터 user_id 추출 (클라이언트 입력 금지)
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user?.id) {
      console.error('[API POST /posts] Auth error:', {
        code: authError?.code,
        message: authError?.message,
        hasUser: !!authData?.user,
      });
      return NextResponse.json(
        { error: { message: '인증 정보를 확인할 수 없습니다' } },
        { status: 401 }
      );
    }

    const user_id = authData.user.id;

    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, content, user_id }])
      .select();

    if (error) {
      console.error('[API POST /posts] Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { 
          error: { 
            message: '게시글 작성에 실패했습니다',
            debug: `[${error.code}] ${error.message}`
          } 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('[API POST /posts] Unexpected error:', {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    });
    return NextResponse.json(
      { 
        error: { 
          message: '서버 오류가 발생했습니다',
          debug: err?.message
        } 
      },
      { status: 500 }
    );
  }
}
