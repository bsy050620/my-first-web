export default function Home() {
  const posts = [
    {
      id: 1,
      title: "첫 번째 블로그 포스트",
      excerpt: "이것은 블로그의 첫 번째 포스트입니다. 여기에 흥미로운 내용을 작성할 수 있습니다.",
      date: "2024년 3월 25일",
      category: "일반"
    },
    {
      id: 2,
      title: "데이터 분석에 대해",
      excerpt: "빅데이터와 공공데이터 분석에 대한 유용한 팁과 경험을 공유합니다.",
      date: "2024년 3월 20일",
      category: "빅데이터"
    },
    {
      id: 3,
      title: "기술 블로그 시작",
      excerpt: "이 블로그에서는 학습한 내용과 경험을 기록하고 공유하겠습니다.",
      date: "2024년 3월 15일",
      category: "기술"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            백서연
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            공공인재빅데이터융합학을 전공하는 블로거입니다.
          </p>
          <div className="flex gap-6 text-gray-600">
            <div>
              <p className="text-sm text-gray-500">학교</p>
              <p className="font-medium">한신대학교</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">전공</p>
              <p className="font-medium">공공인재빅데이터융합학</p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">최근 포스트</h2>
          
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                    {post.title}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full whitespace-nowrap">
                    {post.category}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                
                <div className="flex justify-between items-center">
                  <time className="text-sm text-gray-500">{post.date}</time>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    더 읽기 →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
