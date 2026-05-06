import CardGrid from "@/components/CardGrid";

export default function Home() {
  return (
    <div className="py-12">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">내 블로그</h1>
        <p className="text-lg text-gray-600">웹 개발을 배우며 기록하는 공간</p>
      </header>

      <CardGrid />

      <div className="mt-10">
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-8 text-center text-gray-700">
          푸터 위의 넓은 배너 영역 (예: 공지 또는 CTA)
        </div>
      </div>
    </div>
  );
}
