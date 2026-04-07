export type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
};

export const posts: Post[] = [
  {
    id: 1,
    title: "React 19 새 기능 정리",
    content: "React 19에서 달라진 점들을 정리해보았습니다. 새로운 훅들과 성능 개선사항들을 자세히 설명합니다.",
    author: "김코딩",
    date: "2026-03-30",
  },
  {
    id: 2,
    title: "Tailwind CSS 4 변경사항",
    content: "Tailwind CSS 4의 핵심 변경사항들을 소개합니다. 새로운 유틸리티 클래스와 설정 방식을 알아봅시다.",
    author: "이디자인",
    date: "2026-03-28",
  },
  {
    id: 3,
    title: "Next.js 16 App Router 가이드",
    content: "App Router를 사용하면 더 간편하게 라우팅을 관리할 수 있습니다. 파일 기반 라우팅의 모든 것을 배워봅시다.",
    author: "박개발",
    date: "2026-03-25",
  },
];
