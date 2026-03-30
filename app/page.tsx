export default function Home() {
  const posts = [
    {
      id: 1,
      title: "첫 번째 블로그 포스트",
      excerpt: "이것은 블로그의 첫 번째 포스트입니다. 여기에 흥미로운 내용을 작성할 수 있습니다.",
      author: "백서연",
      date: "2024년 3월 25일"
    },
    {
      id: 2,
      title: "데이터 분석에 대해",
      excerpt: "빅데이터와 공공데이터 분석에 대한 유용한 팁과 경험을 공유합니다.",
      author: "백서연",
      date: "2024년 3월 20일"
    },
    {
      id: 3,
      title: "기술 블로그 시작",
      excerpt: "이 블로그에서는 학습한 내용과 경험을 기록하고 공유하겠습니다.",
      author: "백서연",
      date: "2024년 3월 15일"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            백서연
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            공공인재빅데이터융합학을 전공하는 블로거입니다.
          </p>
          <div className="flex gap-6 text-gray-600 mb-6">
            <div>
              <p className="text-sm text-gray-500">학교</p>
              <p className="font-medium">한신대학교</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">전공</p>
              <p className="font-medium">공공인재빅데이터융합학</p>
            </div>
          </div>
          <nav>
            <ul className="flex justify-between items-center gap-6 text-gray-600">
              <li><a href="#" className="hover:text-gray-900">홈</a></li>
              <li><a href="#" className="hover:text-gray-900">포스트</a></li>
              <li><a href="#" className="hover:text-gray-900">소개</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">최근 포스트</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {post.title}
              </h3>
              
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex gap-4">
                  <span className="text-gray-600">{post.author}</span>
                  <time className="text-gray-400">{post.date}</time>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 백서연. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
