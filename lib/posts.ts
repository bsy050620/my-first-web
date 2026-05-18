export type Post = {
  id: number | string;
  title: string;
  content: string;
  user_id?: string;
  created_at?: string;
};

export const posts: Post[] = [
  {
    id: 1,
    title: "React 19 새 기능 정리",
    content: "React 19에서 달라진 점들을 정리해보았습니다. 새로운 훅들과 성능 개선사항들을 자세히 설명합니다.",
    user_id: "김코딩",
    created_at: "2026-03-30T00:00:00Z",
  },
  {
    id: 2,
    title: "Tailwind CSS 4 변경사항",
    content: "Tailwind CSS 4의 핵심 변경사항들을 소개합니다. 새로운 유틸리티 클래스와 설정 방식을 알아봅시다.",
    user_id: "이디자인",
    created_at: "2026-03-28T00:00:00Z",
  },
  {
    id: 3,
    title: "Next.js 16 App Router 가이드",
    content: "App Router를 사용하면 더 간편하게 라우팅을 관리할 수 있습니다. 파일 기반 라우팅의 모든 것을 배워봅시다.",
    user_id: "박개발",
    created_at: "2026-03-25T00:00:00Z",
  },
];
