import Link from "next/link";
import { posts } from "@/lib/posts";

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function PostPage({ params }: Props) {
  // params는 서버 컴포넌트에서 비동기로 전달될 수 있으므로 await로 안전하게 추출합니다
  const { id } = await Promise.resolve(params);

  const post = posts.find((p) => p.id === Number(id));

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다</h1>
        <p className="mb-6 text-gray-600">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
        <Link href="/posts" className="inline-block text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-extrabold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {post.author} · {post.date}
      </p>

      <div className="prose prose-lg mb-8">{post.content}</div>

      <Link href="/posts" className="text-blue-600 hover:underline">
        목록으로 돌아가기
      </Link>
    </article>
  );
}
