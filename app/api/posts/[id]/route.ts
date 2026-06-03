import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await Promise.resolve(params);
    const body = await req.json();
    const { title, content } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: { message: "제목은 필수입니다" } },
        { status: 400 }
      );
    }

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

    // 인증 정보 확인
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      console.error("[API PATCH /posts/[id]] Auth error:", authError?.message);
      return NextResponse.json(
        { error: { message: "인증이 필요합니다" } },
        { status: 401 }
      );
    }

    // 포스트 조회 및 작성자 확인
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      console.error(`[API PATCH /posts/${id}] Post not found:`, fetchError);
      return NextResponse.json(
        { error: { message: "게시글을 찾을 수 없습니다" } },
        { status: 404 }
      );
    }

    // 권한 확인: 작성자만 수정 가능
    if (post.user_id !== authData.user.id) {
      console.warn(
        `[API PATCH /posts/${id}] Permission denied: user ${authData.user.id} attempted to edit post by ${post.user_id}`
      );
      return NextResponse.json(
        { error: { message: "수정 권한이 없습니다" } },
        { status: 403 }
      );
    }

    // 포스트 수정
    const { data, error } = await supabase
      .from("posts")
      .update({ title, content })
      .eq("id", id)
      .select();

    if (error) {
      console.error(`[API PATCH /posts/${id}] Supabase error:`, error);
      return NextResponse.json(
        { error: { message: "게시글 수정에 실패했습니다" } },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("[API PATCH /posts/[id]] Error:", err);
    return NextResponse.json(
      { error: { message: "서버 오류가 발생했습니다" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await Promise.resolve(params);
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

    // 인증 정보 확인
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      console.error("[API DELETE /posts/[id]] Auth error:", authError?.message);
      return NextResponse.json(
        { error: { message: "인증이 필요합니다" } },
        { status: 401 }
      );
    }

    // 포스트 조회 및 작성자 확인
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      console.error(`[API DELETE /posts/${id}] Post not found:`, fetchError);
      return NextResponse.json(
        { error: { message: "게시글을 찾을 수 없습니다" } },
        { status: 404 }
      );
    }

    // 권한 확인: 작성자만 삭제 가능
    if (post.user_id !== authData.user.id) {
      console.warn(
        `[API DELETE /posts/${id}] Permission denied: user ${authData.user.id} attempted to delete post by ${post.user_id}`
      );
      return NextResponse.json(
        { error: { message: "삭제 권한이 없습니다" } },
        { status: 403 }
      );
    }

    // 포스트 삭제
    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error(`[API DELETE /posts/${id}] Supabase error:`, error);
      return NextResponse.json(
        { error: { message: "게시글 삭제에 실패했습니다" } },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("[API DELETE /posts/[id]] Error:", err);
    return NextResponse.json(
      { error: { message: "서버 오류가 발생했습니다" } },
      { status: 500 }
    );
  }
}
