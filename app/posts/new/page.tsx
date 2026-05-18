import PostForm from "@/components/PostForm";

export default function NewPostPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">새 게시글 작성</h1>
      <PostForm />
    </div>
  );
}
