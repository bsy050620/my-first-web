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
