> **미션**: Ch1~6에서 만든 블로그에 아키텍처를 보강한다 — shadcn/ui 컴포넌트, 디자인 토큰, DB 스키마 계획이 바이브코딩 품질을 결정한다
> 

---

## 학습목표

1. 설계 없는 바이브코딩이 왜 "AI 슬롭"을 만드는지 설명할 수 있다
2. **범용 컨텍스트 파일 3종**([copilot-instructions.md](http://copilot-instructions.md/), [context.md](http://context.md/), [todo.md](http://todo.md/))과 **프로젝트별 설계 파일**([ARCHITECTURE.md](http://architecture.md/))을 구분하여 사용할 수 있다
3. 페이지 맵과 유저 플로우로 앱 구조를 설계할 수 있다
4. Copilot Vision으로 스케치를 코드 초안으로 변환할 수 있다
5. shadcn/ui를 설치하고 디자인 토큰으로 테마를 커스터마이징할 수 있다
6. context.md와 todo.md로 세션 간 컨텍스트를 관리하고, 세션 시작 프롬프트로 Copilot에 주입할 수 있다

---

## 이번 장 진행 방식

이번 장은 **내용 설명 → 바로 바이브코딩 실습** 순서로 진행한다. 먼저 왜 필요한지 짧게 이해하고, 이어서 Copilot에게 어떤 식으로 요청할지 실습한다.

진행 순서는 다음과 같다:

1. 설계가 왜 필요한지 이해한다
2. `copilot-instructions.md`, `context.md`, `todo.md`로 AI가 참고할 맥락을 만든다
3. 페이지 맵과 유저 플로우로 앱 구조를 정리한다
4. `ARCHITECTURE.md` 뼈대를 잡는다 — 페이지와 흐름을 한 문서에 모아 플랜을 확정한다
5. 와이어프레임으로 화면 구조를 시각화한다
6. shadcn/ui를 설치하고 컴포넌트 시스템을 구축한다
7. `ARCHITECTURE.md`를 완성한다 — 컴포넌트 계층과 데이터 모델을 추가한다

> **원칙**: 설치 명령처럼 단순한 일은 직접 실행하고, 문서 초안 작성·화면 개선·검증 목록 작성처럼 판단과 정리가 필요한 일은 Copilot에게 맡긴다.
> 

---

## 7.1 왜 설계가 먼저인가

지금까지 Next.js로 페이지를 나누고, 상태를 관리하고, 데이터를 가져오는 방법을 배웠다. Ch1~6에서 블로그의 기본 구조를 만들었지만, 한 가지 빠진 것이 있다. **"어떻게 체계적으로 만들 것인지"를 정하는 과정**이다.

### 7.1.1 설계 없는 바이브코딩의 문제점: "AI 슬롭"과 균일한 UI

AI에게 "블로그 만들어줘"라고 하면 코드가 만들어진다. 문제는, **모든 학생이 똑같은 결과물을 받는다**는 것이다. 같은 프롬프트 -> 같은 AI -> 같은 디자인. 이렇게 만들어진 결과물을 **AI 슬롭**(AI Slop)이라 부른다.

AI 슬롭의 특징:

- 모든 프로젝트가 비슷하게 생겼다 (같은 색상, 같은 레이아웃)
- 디자인에 의도가 없다 (왜 이 색인지, 왜 이 배치인지 설명할 수 없다)
- 사용자 경험을 고려하지 않았다 (어디를 클릭해야 하는지 헷갈린다)

반대로, **설계서를 먼저 작성하고 AI에게 제공하면** 결과가 달라진다. "파란색 계열 테마, 왼쪽에 사이드바, 카드 리스트 형태"처럼 구체적인 지시를 담은 설계서가 있으면, AI는 그 의도에 맞는 코드를 생성한다.

> **팁**: "설계 없이 만든 블로그"과 "설계서를 기반으로 만든 블로그"을 비교해보자. 차이가 극명하다.
> 

### 7.1.2 AI는 디자인 감각이 없다 — 시각적 컨텍스트가 필요한 이유

2장에서 AI의 3대 한계를 배웠다. 디자인에는 **네 번째 한계**가 추가된다: AI는 **시각적 의도를 이해하지 못한다**.

AI는 텍스트로 학습했다. "깔끔한 디자인"이라고 요청하면, AI가 생각하는 "깔끔함"과 내가 원하는 "깔끔함"이 다를 수 있다. AI에게는 레퍼런스 이미지, 색상 코드, 구체적인 레이아웃 지시가 필요하다.

**표 7.3** 모호한 지시 vs 조금 더 나은 지시

| 모호한 지시 | 조금 더 나은 지시 |
| --- | --- |
| "예쁘게 만들어줘" | "개인 블로그답게 밝고 읽기 편하게 만들어줘" |
| "깔끔하게 배치해줘" | "글 제목, 요약, 작성일이 한눈에 보이게 정리해줘" |
| "모바일에서도 보이게" | "휴대폰에서도 글을 읽기 편하게 아래로 자연스럽게 쌓아줘" |

### 7.1.3 좋은 설계 = 좋은 프롬프트: 3단계 디자인 파이프라인

바이브코딩에서 디자인 품질을 높이는 방법은 **3단계 디자인 파이프라인**(Design Pipeline)을 따르는 것이다:

```
① 탐색 — 레퍼런스 수집 (마음에 드는 사이트/앱 스크린샷)
    ↓
② 프로토타입 — 와이어프레임 + AI 초안 (손그림 → Copilot Vision)
    ↓
③ 코드 — 설계서 기반 코드 생성 (shadcn/ui + Copilot)
```

이 장에서 3단계를 모두 실습한다. 핵심은 **1번을 건너뛰지 않는 것**이다. 레퍼런스 없이 바로 코드를 작성하면 AI 슬롭이 된다.

> **바이브코딩 실습**: 지금 만든 블로그의 목적과 사용자를 먼저 정리해 보자.
> 

```
내 블로그 프로젝트의 설계 방향을 정리하려고 해.

현재 프로젝트는 Ch1~6에서 만든 개인 블로그야.
독자는 글을 읽고, 작성자는 글을 작성하고 관리할 수 있어야 해.

다음 내용을 초보자도 이해하기 쉽게 정리해줘.
1. 이 블로그의 목표
2. 주요 사용자
3. 꼭 필요한 페이지
4. 디자인 분위기
5. Copilot에게 코드를 요청할 때 지켜야 할 기준
```

---

## 7.2 코파일럿 컨텍스트 관리 — 범용 파일 3종

### 7.2.1 Copilot의 기억 한계와 범용 컨텍스트 파일

Copilot Chat은 **대화를 닫으면 이전 맥락을 모두 잊는다**. 이것이 문제가 되는 상황:

- 월요일에 "포스트 목록 페이지" 작업 → 수요일에 이어서 "포스트 상세 페이지" 요청 → **Copilot은 월요일 작업을 모른다**
- "지난번에 만든 디자인 토큰 기준으로 해줘" → Copilot: "어떤 토큰인가요?"

바이브코딩에서 프로젝트를 체계적으로 관리하려면 **AI 기억 보조 파일**이 필요하다. 이 섹션에서는 **모든 프로젝트에 공통으로 사용하는 3가지 범용 파일**을 소개한다:

**표 7.2** 범용 컨텍스트 파일 3종 (모든 프로젝트 공통)

| 파일 | 역할 | Copilot 자동 로드 | 비유 | 범위 |
| --- | --- | --- | --- | --- |
| `copilot-instructions.md` | 규칙 — "이렇게 코딩해라" | ✅ | 회사 사규 | **모든 프로젝트** |
| `context.md` | 상태 — "여기까지 했다" | ❌ | 작업 일지 | **모든 프로젝트** |
| `todo.md` | 할 일 — "다음에 이걸 한다" | ❌ | 체크리스트 | **모든 프로젝트** |

> **핵심**: `copilot-instructions.md`만 자동 로드된다. 나머지 2개는 Copilot Chat에서 **`#file:파일명`으로 직접 참조**해야 한다.
> 

> **중요**: 프로젝트별 설계 문서 ([ARCHITECTURE.md](http://architecture.md/))는 7.4절에서 뼈대를 잡고, 7.8절에서 완성한다.
> 

**AI 도구별 규칙 파일 이름**

Copilot만 사용하는 프로젝트라면 `.github/copilot-instructions.md`만으로 충분하다. 하지만 Claude Code, Antigravity, Gemini CLI, Codex 같은 여러 AI 코딩 도구를 함께 쓸 경우에는 도구별로 읽는 파일 이름이 다르다.

```
AGENTS.md                       # 공용 에이전트 규칙
CLAUDE.md                       # Claude용
.github/copilot-instructions.md # Copilot용
.agent/rules/project.md         # Antigravity 워크스페이스 규칙
```

> **권장**: 공통 규칙은 `AGENTS.md`에 먼저 정리하고, 각 도구 전용 파일에는 같은 내용을 복사하거나 `AGENTS.md`를 기준으로 작업하라고 적는다. 이렇게 하면 AI 도구를 바꿔도 프로젝트 규칙이 흩어지지 않는다.
> 

### 7.2.2 [copilot-instructions.md](http://copilot-instructions.md/) — 규칙 (자동 로드)

2장에서 작성한 `.github/copilot-instructions.md`는 **프로젝트의 코딩 규칙**을 정의하는 파일이다. Copilot이 항상 자동으로 읽어들이므로, 여기에 작성한 규칙은 **모든 대화에서 적용**된다.

**copilot-instructions.md의 주요 섹션**:

```markdown
## Tech Stack

- Next.js 16.2.1 (App Router only)
- React 19.2.4
- Tailwind CSS 4
- shadcn/ui (components/ui/ 경로에 설치됨)

## Coding Conventions

- Default to Server Components unless a Client Component is required.
- Use Tailwind CSS for styling.
- Keep components simple and easy to verify.
- Prefer files inside `app/` for routes.

## Design Tokens

- Primary color: shadcn/ui --primary
- Background: --background
- Card: shadcn/ui Card 컴포넌트 사용 (rounded-lg shadow-sm)
- Spacing: 컨텐츠 간격 space-y-6, 카드 내부 p-6
- Max width: max-w-4xl mx-auto (메인 컨텐츠)
- 반응형: md 이상 2열 그리드, 모바일 1열

## Component Rules

- UI 컴포넌트는 shadcn/ui 사용 (components/ui/)
- Button, Card, Input, Dialog 등 shadcn/ui 컴포넌트 우선
- 커스텀 컴포넌트는 components/ 루트에 배치
- Tailwind 기본 컬러 직접 사용 금지 → CSS 변수(디자인 토큰) 사용

## Known AI Mistakes

- Do not use `next/router`; use `next/navigation` when navigation is needed.
- Do not create `pages/` router files; this project uses the App Router.
- Do not add `"use client"` unless interactivity or browser APIs are actually needed.
```

**언제 업데이트하는가**:

- shadcn/ui 설치 후 → Tech Stack에 추가
- 디자인 토큰 확정 후 → Design Tokens 섹션 작성
- AI가 같은 실수를 반복할 때 → Known AI Mistakes에 기록

> **바이브코딩 실습**: Copilot에게 현재 프로젝트에 맞는 규칙 초안을 작성하게 한다.
> 

```
이 프로젝트의 .github/copilot-instructions.md 초안을 작성해줘.

포함할 내용:
- Next.js App Router 사용 규칙
- TypeScript와 Tailwind CSS 사용 규칙
- shadcn/ui 컴포넌트 사용 규칙
- AI가 자주 틀릴 수 있는 주의사항

초보자가 읽어도 이해하기 쉽게 작성해줘.
```

### 7.2.3 [context.md](http://context.md/) — 상태 (수동 참조)

`context.md`는 **프로젝트의 현재 상태를 기록하는 파일**이다. AI가 "지금 이 프로젝트가 어디까지 진행되었는지"를 한눈에 파악할 수 있게 한다.

**❗️중요**: `context.md`는 `copilot-instructions.md`와 **완전히 다른 역할**을 한다:

- [**copilot-instructions.md**](http://copilot-instructions.md/): 규칙 (변하지 않음, 자동 로드)
- [**context.md**](http://context.md/): 상태 (계속 변함, 수동 참조)

프로젝트 루트에 `context.md`를 생성한다:

```markdown
# Context — my-first-web 프로젝트 상태

## 현재 상태

- 마지막 작업일: 2026-02-26
- 완료된 작업: 홈 페이지, 헤더/푸터 레이아웃, 포스트 목록
- 진행 중: 포스트 상세 페이지 (UI 완료, 데이터 연결 미완)
- 미착수: 마이페이지

## 기술 결정 사항

- 인증: Supabase Auth (Email)
- 상태관리: React Context (AuthProvider)
- 이미지: Supabase Storage 사용 예정

## 해결된 이슈

- shadcn/ui Button variant가 디자인 토큰과 불일치 → globals.css의 --primary 수정으로 해결
- 모바일 헤더 메뉴가 겹침 → Sheet 컴포넌트로 교체

## 알게 된 점

- Tailwind CSS 4 기준에서는 `@import "tailwindcss"` + `@theme` 블록으로 설정 (`tailwind.config.js` 불필요)
- Server Component에서 useRouter 사용 불가 → redirect() 사용
```

**각 섹션의 역할**:

| 섹션 | 기록하는 것 | 왜 필요한가 |
| --- | --- | --- |
| 현재 상태 | 완료/진행 중/미착수 | Copilot이 **중복 작업을 피한다** |
| 기술 결정 사항 | 이미 결정된 기술 선택 | Copilot이 **다른 기술을 제안하지 않는다** |
| 해결된 이슈 | 과거에 겪은 문제와 해결법 | **같은 실수를 반복하지 않는다** |
| 알게 된 점 | 작업 중 발견한 주의사항 | **프로젝트 고유의 노하우가 축적된다** |

**업데이트 시점**: 작업 세션을 마칠 때마다 context.md를 갱신한다. Copilot에게 요청:

```
오늘 작업한 내용을 정리해서 context.md를 업데이트해줘.
변경된 파일, 해결한 이슈, 새로 알게 된 점을 포함해줘.
```

### 7.2.4 [todo.md](http://todo.md/) — 작업 흐름 추적

`todo.md`는 **체크박스 기반의 할 일 목록**이다. 프로젝트의 전체 진행률을 한눈에 보여주고, Copilot이 "다음에 뭘 해야 하는지"를 자동으로 파악할 수 있게 한다.

프로젝트 루트에 `todo.md`를 생성한다:

```markdown
# TODO — my-first-web

## 1단계: 기본 구조 (Ch7~8)

- [x] ARCHITECTURE.md 작성
- [x] copilot-instructions.md 작성
- [x] shadcn/ui 초기화 + 테마 설정
- [x] 헤더/푸터 레이아웃
- [x] 홈 페이지
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 작성

## 2단계: 핵심 기능 (Ch9~10)

- [x] 포스트 목록 페이지
- [ ] 포스트 상세 페이지
- [ ] 포스트 작성 (CRUD)
- [ ] 로그인/회원가입

## 3단계: 고급 기능 (Ch11~12)

- [ ] 마이페이지
- [ ] 댓글 기능

## 진행률: 6/12 (50%)
```

[**todo.md](http://todo.md/) 작성 규칙**:

- **단계별로 묶는다** — 무작정 나열하지 않고 프로젝트 진행 순서에 맞춘다
- **체크박스(`[x]` / `[ ]`)를 사용한다** — Copilot이 완료 상태를 인식한다
- **진행률을 하단에 기록한다** — 전체 감각을 유지한다

**업데이트 시점**: 작업을 시작하기 전에 todo.md를 확인하고, 완료된 항목은 체크(`[x]`)한다. Copilot에게 요청:

```
방금 포스트 상세 페이지를 완성했어. todo.md에서 해당 항목을 체크하고 진행률을 업데이트해줘.
```

### 7.2.5 세션 시작/종료 프롬프트 — Copilot에 컨텍스트 주입하기

범용 컨텍스트 파일의 진짜 힘은 **Copilot Chat을 새로 열 때 한꺼번에 주입**할 때 나온다.

**세션 시작 프롬프트 (기본)** — 새 대화를 열고 가장 먼저 입력:

```
#file:context.md #file:todo.md

이전 작업을 이어서 진행하려고 해.
context.md에서 현재 상태를 파악하고,
todo.md에서 다음 할 일을 찾아서 진행해줘.
```

> **팁**: `copilot-instructions.md`는 `#file:`로 참조하지 않아도 **자동 로드**된다.
> 

**프로젝트에 설계 문서가 있는 경우** (7.4절에서 작성하는 [ARCHITECTURE.md](http://architecture.md/) 등):

```
#file:context.md #file:todo.md #file:ARCHITECTURE.md

이전 작업을 이어서 진행하려고 해.
context.md에서 현재 상태를 파악하고,
todo.md에서 다음 할 일을 찾아서 진행해줘.
ARCHITECTURE.md의 설계를 따라줘.
```

> **팁**: `#file:ARCHITECTURE.md`는 프로젝트별 설계 파일. 모든 프로젝트에 필수는 아니다.
> 

이 프롬프트 하나로 Copilot은:

1. **어디까지 했는지** 파악하고 ([context.md](http://context.md/))
2. **다음에 뭘 할지** 알고 ([todo.md](http://todo.md/))
3. **어떤 규칙으로 코딩할지** 준수한다 ([copilot-instructions.md](http://copilot-instructions.md/) — 자동)
4. **(프로젝트별)** 어떤 구조로 만들지 이해한다 ([ARCHITECTURE.md](http://architecture.md/) — 선택)

```
세션 시작 시 Copilot이 받는 컨텍스트:

┌─────────────────────────────────────────┐
│  copilot-instructions.md  (자동 로드)    │  ← 규칙 (모든 프로젝트)
├─────────────────────────────────────────┤
│  #file:context.md         (수동 참조)    │  ← 상태 (모든 프로젝트)
│  #file:todo.md            (수동 참조)    │  ← 할 일 (모든 프로젝트)
├─────────────────────────────────────────┤
│  #file:ARCHITECTURE.md    (수동, 선택)   │  ← 설계 (프로젝트별)
├─────────────────────────────────────────┤
│  열린 파일들               (자동 포함)    │  ← 현재 코드
└─────────────────────────────────────────┘
```

**세션 종료 프롬프트** — 작업을 마칠 때:

```
오늘 작업을 마무리하려고 해.
1) context.md를 업데이트해줘 (변경 파일, 해결 이슈, 알게 된 점)
2) todo.md에서 완료 항목을 체크하고 진행률을 갱신해줘
```

이렇게 하면 **다음 세션에서 Copilot이 바로 이어서 작업**할 수 있다. AI의 기억력 한계를 파일 시스템으로 보완하는 것이다.

---

## 7.3 페이지 구조 설계

코드를 작성하기 전에, 앱에 **어떤 페이지가 필요한지**부터 정리한다. 이것이 **페이지 맵**(Page Map)이다.

### 7.3.1 어떤 페이지가 필요한가 (페이지 맵)

`my-first-web`의 포스트 기능을 예로 들면:

```
홈 (/)
├── 포스트 목록 (/posts)
│   ├── 포스트 상세 (/posts/[id])
│   └── 포스트 작성 (/posts/new)
├── 로그인 (/login)
├── 마이페이지 (/mypage)
```

**페이지 맵은 종이에 그려도 충분하다.** 중요한 것은 "어떤 페이지가 있는지"와 "페이지 간 관계"를 한눈에 파악하는 것이다.

### 7.3.2 페이지별 URL 구조 정의 (Next.js App Router 기준)

페이지 맵을 그렸으면, Next.js App Router의 폴더 구조로 변환한다:

**표 7.4** 페이지 맵 -> App Router 폴더 구조

| 페이지 | URL | 폴더/파일 |
| --- | --- | --- |
| 홈 | `/` | `app/page.tsx` |
| 포스트 목록 | `/posts` | `app/posts/page.tsx` |
| 포스트 상세 | `/posts/[id]` | `app/posts/[id]/page.tsx` |
| 포스트 작성 | `/posts/new` | `app/posts/new/page.tsx` |
| 로그인 | `/login` | `app/login/page.tsx` |
| 마이페이지 | `/mypage` | `app/mypage/page.tsx` |

Next.js의 파일 기반 라우팅이 여기서 다시 등장한다. 설계 단계에서 URL 구조를 미리 정하면, Copilot에게 "이 URL 구조에 맞춰서 만들어줘"라고 지시할 수 있다.

### 7.3.3 페이지 간 이동 흐름 (유저 플로우)

**유저 플로우**(User Flow)는 사용자가 특정 목표를 달성하기까지의 화면 이동 경로이다.

예를 들어 "비로그인 사용자가 블로그 글을 작성하는 경우":

```
홈 → "포스트" 진입 → "글쓰기" 클릭 → 로그인 페이지로 이동 → 이메일 로그인
→ 포스트 작성 페이지로 돌아옴 → 글 작성 → 제출 → 포스트 상세
```

이런 흐름을 미리 정리해두면 두 가지가 좋아진다:

- AI에게 **"로그인하지 않은 사용자가 글쓰기를 누르면 로그인 페이지로 리다이렉트해줘"**처럼 명확한 프롬프트를 줄 수 있다
- 빠뜨린 페이지나 경로를 미리 발견할 수 있다

> **팁**: 블로그 앱의 유저 플로우 3가지(글 읽기, 글 쓰기, 내 글 수정)를 직접 그려보자.
> 

> **바이브코딩 실습**: 페이지 맵과 유저 플로우 초안을 Copilot에게 정리하게 한다.
> 

```
내 개인 블로그의 페이지 맵과 유저 플로우를 정리해줘.

현재 필요한 기능:
- 홈
- 글 목록
- 글 상세
- 글 작성
- 로그인
- 마이페이지

요구사항:
- Next.js App Router URL 기준으로 정리
- 초보자가 이해할 수 있게 표로 작성
- 글 읽기, 글 작성, 마이페이지 확인 흐름을 각각 정리
- 빠진 페이지가 있으면 이유와 함께 제안
```

---

## 7.4 [ARCHITECTURE.md](http://architecture.md/) — 플랜 문서 뼈대 잡기

설계의 핵심은 **먼저 전체 그림을 그리고, 그 그림대로 실행하는 것**이다. 지금까지 페이지 맵과 유저 플로우로 앱의 구조를 정리했다. 이제 이것을 하나의 문서로 모아 [**ARCHITECTURE.md**](http://architecture.md/)를 만든다.

ARCHITECTURE.md는 이 챕터에서 **두 번** 등장한다:

- **지금(7.4)**: 페이지와 흐름만 담은 **뼈대**를 잡는다 — 와이어프레임과 컴포넌트 작업의 방향이 된다
- **나중(7.8)**: 컴포넌트 계층과 데이터 모델을 추가해 **완성**한다 — Ch8부터 Copilot에게 제공하는 설계서가 된다

### 7.4.1 범용 파일 vs 프로젝트별 설계 문서

앞서 7.2절에서 **모든 프로젝트에 공통으로 사용하는 범용 파일 3종** ([copilot-instructions.md](http://copilot-instructions.md/), [context.md](http://context.md/), [todo.md](http://todo.md/))을 배웠다.

ARCHITECTURE.md는 이들과 다르다. **이 블로그 프로젝트만의 설계 문서**다.

**범용 vs 프로젝트별 비교:**

| 구분 | 범용 파일 (7.2절) | 프로젝트별 파일 (지금) |
| --- | --- | --- |
| 예시 | [copilot-instructions.md](http://copilot-instructions.md/), [context.md](http://context.md/), [todo.md](http://todo.md/) | [ARCHITECTURE.md](http://architecture.md/) |
| 범위 | 모든 프로젝트 | 이 블로그만 |
| 내용 | 코딩 규칙, 작업 상태, 할 일 | 페이지 맵, 컴포넌트 계층, 데이터 모델 |
| 재사용 | 다른 프로젝트에도 같은 방식 사용 | 프로젝트마다 별도 작성 |

### 7.4.2 뼈대 작성 — 아는 것부터 먼저 채운다

shadcn/ui 컴포넌트 구조와 데이터 모델은 아직 결정되지 않았다. 지금 쓸 수 있는 것만 먼저 채우고, 나머지는 "추가 예정"으로 남겨둔다.

> **바이브코딩 실습**: Copilot에게 [ARCHITECTURE.md](http://architecture.md/) 뼈대를 작성하게 한다.
> 

```
내 개인 블로그 프로젝트의 ARCHITECTURE.md 뼈대를 작성해줘.

지금 포함할 내용:
1. 프로젝트 목표
2. 페이지 맵 (URL 구조 포함)
3. 유저 플로우 (글 읽기, 글 작성, 마이페이지)

아직 쓰지 않는 항목:
- 컴포넌트 구조 (shadcn/ui 설치 후 추가 예정)
- 데이터 모델 (Ch8 대비 후 추가 예정)

조건:
- Next.js App Router 기준으로 작성
- 나중에 채울 섹션은 "TODO: 추가 예정" 표시만 남겨두기
- 바로 ARCHITECTURE.md 파일로 저장할 수 있는 마크다운으로 출력
```

이 파일을 프로젝트 루트에 `ARCHITECTURE.md`로 저장한다. 이후 와이어프레임 작업부터 이 파일이 방향의 기준이 된다.

---

## 7.5 AI로 와이어프레임 만들기

### 7.5.1 와이어프레임이란: 복잡한 디자인이 아닌 뼈대 잡기

**와이어프레임**(Wireframe)은 페이지의 **뼈대 구조**를 단순하게 표현한 설계도이다. 색상, 이미지, 폰트 없이 **"어디에 무엇이 배치되는지"**만 표현한다.

와이어프레임은 **완벽할 필요가 없다**. 목적은 AI에게 "이런 구조로 만들어줘"라는 **시각적 컨텍스트를 전달**하는 것이다.

### 7.5.2 종이/화이트보드에서 시작하기

가장 빠른 와이어프레임 도구는 **종이와 펜**이다.

> **실습 안내**: 종이에 블로그 메인 페이지와 포스트 상세 페이지를 5분 동안 스케치한다.
> 

스케치할 때 포함할 요소:

- 상단: 네비게이션 바 (로고, 메뉴, 로그인 버튼)
- 메인: 콘텐츠 영역 (카드 리스트 또는 상세 본문)
- 하단: 푸터 (선택)
- 각 영역에 "이것은 무엇이다"를 글씨로 적는다

> **팁**: 예쁘게 그릴 필요 없다. 네모 몇 개와 화살표면 충분하다. 못 그리는 것이 정상이다.
> 

---

### 7.5.3 AI 디자인 도구 비교

지금부터 사용할 도구들을 정리한다. 이 수업에서는 Copilot과 shadcn/ui를 필수로 사용하고, v0는 선택 도구로 소개한다.

**표 7.5** AI 디자인 도구 비교

| 도구 | 비용 | 입력 | 출력 | 용도 |
| --- | --- | --- | --- | --- |
| **Copilot** | 학생 무료 | 스케치/스크린샷 + 프롬프트 | React+Tailwind | **필수** — 스케치→코드, 코드 생성 |
| **v0 by Vercel** | 무료 7-15회/월 | 텍스트 프롬프트 | React+Tailwind+shadcn | 선택 — 빠른 프로토타입 생성 |
| **shadcn/ui** | 무료 OSS | CLI 명령어 | 컴포넌트 코드 | **필수** — 컴포넌트 시스템 |

### 7.5.4 Copilot Vision — 스케치를 코드로 변환하기

Copilot은 **이미지를 이해하는 기능**(Copilot Vision)을 제공한다. Copilot Chat에 이미지를 첨부하면, AI가 그림을 분석하여 코드를 생성한다. 2026년 현재 Copilot의 주력 모델(GPT-4o, Claude 3.5 Sonnet, Gemini 등)은 이미지를 정확히 분석하여 코드로 변환해 준다.

**사용 방법**:

1. 종이 스케치를 촬영한다 (스마트폰 카메라)
2. Copilot Chat 패널을 연다
3. 이미지를 채팅창에 **드래그 앤 드롭** 또는 첨부한다
4. 프롬프트를 함께 입력한다

> **바이브코딩 실습**: 스케치 이미지를 첨부하고 아래처럼 요청한다.
> 

```
첨부한 손그림 스케치를 Next.js + Tailwind CSS 컴포넌트로 변환해줘.

조건:
- App Router 구조를 사용
- 현재 프로젝트의 package.json 기준으로 버전 확인
- next/router와 pages router는 사용하지 않기
- 레이아웃은 스케치와 최대한 비슷하게 만들기
- 색상은 아직 정하지 않았으니 회색 계열로 단순하게 처리
- 변경할 파일과 이유를 함께 설명
```

---

## 7.6 shadcn/ui로 컴포넌트 시스템 구축하기

### 7.6.1 shadcn/ui란: 복사해서 쓰는 컴포넌트 라이브러리

**shadcn/ui**는 일반적인 npm 패키지가 아니다. `npm install`로 설치하는 것이 아니라, **컴포넌트 코드를 프로젝트에 직접 복사**한다. 복사된 코드는 내 프로젝트의 일부가 되므로 자유롭게 수정할 수 있다.

왜 바이브코딩 교재에서 shadcn/ui를 사용하는가:

- **코드가 내 프로젝트에 있으므로** AI가 코드를 읽고 수정할 수 있다 (블랙박스가 아니다)
- v0, Bolt, Lovable 등 **주요 AI 도구들이 모두 shadcn/ui 기반**이다
- Tailwind CSS + **Radix UI**(접근성 보장) 조합이다
- 복사된 코드를 열어서 **"이 버튼이 어떻게 동작하는지"** 직접 읽을 수 있다

> **팁**: npm 패키지는 node_modules 안에 숨어 있어서 코드를 보기 어렵다. 반면 shadcn/ui는 내 components/ui/ 폴더에 코드가 그대로 복사된다. 직접 수정할 수 있다는 뜻이다.
> 

### 7.6.2 npx shadcn init -- 프로젝트에 설치하기

`init`은 프로젝트에 shadcn/ui를 사용할 준비를 해 주는 명령이다. 쉽게 말해 "이 프로젝트는 shadcn/ui 컴포넌트를 받을 수 있다"는 설정 파일과 기본 테마 구조를 만들어 준다.

> **실습 안내**: 프로젝트 루트에서 아래 명령을 실행한다.
> 

```bash
npx shadcn@latest init
```

설치 중 질문이 나오면 기본값을 그대로 사용해도 된다. 이 실습에서는 복잡한 설정을 직접 바꾸지 않고, 먼저 shadcn/ui가 프로젝트에 들어오도록 하는 것이 목표다.

설치가 끝나면 `components.json` 파일이 생겼는지 확인한다.

```bash
ls components.json
```

설치 후 생성되는 파일:

```
프로젝트/
├── components/
│   └── ui/              ← shadcn/ui 컴포넌트가 여기에 복사됨
├── components.json      ← shadcn/ui 설정 파일
├── lib/
│   └── utils.ts         ← cn() 유틸리티 함수
└── app/
    └── globals.css      ← CSS 변수 (디자인 토큰) + @theme inline 블록
```

### 7.6.3 핵심 컴포넌트 추가: Button, Card, Input, Dialog

shadcn/ui는 필요한 컴포넌트만 골라서 프로젝트에 복사하는 방식이다. 처음에는 자주 쓰는 `Button`, `Card`, `Input`, `Dialog` 정도만 추가하면 블로그 화면을 꾸미기에 충분하다.

- `Button`: 글쓰기, 저장, 이동 같은 클릭 동작
- `Card`: 글 목록처럼 묶어서 보여줄 콘텐츠
- `Input`: 제목, 검색어 같은 짧은 입력
- `Dialog`: 삭제 확인처럼 한 번 더 물어봐야 하는 화면

> **실습 안내**: 자주 쓰는 컴포넌트를 한 번에 추가한다.
> 

```bash
npx shadcn@latest add button card input dialog
```

추가가 끝나면 `components/ui/` 폴더에 파일이 생긴다. 직접 사용법을 모두 외울 필요는 없다. Copilot에게 현재 페이지에 맞게 적용해 달라고 요청하면 된다.

```
방금 shadcn/ui의 button, card, input, dialog 컴포넌트를 추가했다.
기존 블로그 페이지에 이 컴포넌트들을 자연스럽게 적용해줘.

요구사항:
- 글 목록은 Card로 정리
- 글쓰기/이동 버튼은 Button 사용
- 입력 폼은 Input 사용
- 삭제 확인이나 중요한 확인은 Dialog 사용
- 기존 페이지 구조와 데이터 흐름은 최대한 유지
```

### 7.6.4 테마 커스터마이징: CSS 변수로 디자인 토큰 설정

shadcn/ui의 색상과 둥근 정도는 `app/globals.css`의 CSS 변수로 바꾼다. 이 값들을 **디자인 토큰**이라고 부른다. 디자인 토큰은 "우리 사이트에서 반복해서 쓸 색상과 스타일 이름"이라고 생각하면 된다.

예를 들어 `--background`를 바꾸면 페이지 배경 분위기가 바뀌고, `--primary`를 바꾸면 주요 버튼 색이 바뀐다. 이번 실습에서는 CSS 구조를 모두 이해할 필요는 없고, 아래 값들이 어디에 쓰이는지만 알면 충분하다.

- `-background`: 페이지 배경색
- `-foreground`: 기본 글자색
- `-primary`: 주요 버튼과 강조 색상
- `-border`: 카드와 입력창의 테두리 색상
- `-radius`: 버튼과 카드의 둥근 정도

> **실습 안내**: Copilot에게 블로그 분위기에 맞게 `app/globals.css`의 테마 값을 정리해 달라고 요청한다.
> 

```
app/globals.css의 shadcn/ui 테마 변수를 블로그에 어울리게 정리해줘.

원하는 분위기:
- 깔끔하고 읽기 편한 개인 블로그
- 배경은 밝게
- 본문 글자는 선명하게
- 주요 버튼은 차분한 색으로
- 과한 그라디언트나 강한 그림자는 사용하지 않기

기존 구조는 유지하고, 필요한 CSS 변수만 수정해줘.
```

---

## 7.7 디자인 프롬프트 전략 -- AI에게 "우리 디자인"을 가르치기

### 7.7.1 디자인 토큰이란: 색상, 타이포그래피, 간격의 체계화

**디자인 토큰**(Design Token)은 색상, 폰트, 간격 등 디자인 규칙을 변수로 정리한 것이다. 쉽게 말해서 **"우리 앱의 디자인 규칙집"**이다.

디자인 토큰이 없으면:

- AI가 매번 다른 색상을 사용한다 (`blue-500`, `indigo-600`, `sky-400`...)
- 페이지마다 간격이 다르다 (`p-4`, `p-6`, `p-8`...)
- 일관성 없는 UI가 만들어진다

디자인 토큰이 있으면:

- AI가 **정해진 색상만** 사용한다 (primary, secondary, accent)
- 모든 페이지에서 **동일한 간격 규칙**을 따른다
- 일관된 UI가 유지된다

### 7.7.2 copilot-instructions.md에 디자인 규칙 추가하기

2장에서 작성한 `.github/copilot-instructions.md`에 **Design Tokens** 섹션을 추가한다:

```markdown
## Design Tokens

- Primary color: shadcn/ui --primary (어두운 파란색 계열)
- Background: --background (흰색)
- Card: shadcn/ui Card 컴포넌트 사용 (rounded-lg shadow-sm)
- Spacing: 컨텐츠 간격 space-y-6, 카드 내부 p-6
- Max width: max-w-4xl mx-auto (메인 컨텐츠)
- 반응형: md 이상 2열 그리드, 모바일 1열

## Component Rules

- UI 컴포넌트는 shadcn/ui 사용 (components/ui/)
- Button, Card, Input, Dialog 등 shadcn/ui 컴포넌트 우선
- 커스텀 컴포넌트는 components/ 루트에 배치
- Tailwind 기본 컬러 직접 사용 금지 → CSS 변수(디자인 토큰) 사용
```

### 7.7.3 효과적인 디자인 프롬프트 5가지 전략

**표 7.9** 디자인 프롬프트 5가지 전략

| # | 전략 | 설명 | 예시 |
| --- | --- | --- | --- |
| 1 | **레퍼런스 제시** | 참고할 UI/사이트 이름을 명시한다 | "Notion 스타일의 사이드바" |
| 2 | **제약 조건 명시** | 사용할 컴포넌트, 색상 등을 제한한다 | "shadcn/ui Card만 사용, primary 색상 위주" |
| 3 | **반복 다듬기** | 한 번에 완성하지 않고 단계적으로 수정한다 | "간격을 더 넓게" -> "폰트를 키워줘" |
| 4 | **부정 프롬프트** | 하지 말아야 할 것을 명시한다 | "그라디언트 사용 금지, 그림자 최소화" |
| 5 | **역할 부여** | AI에게 디자인 역할을 지정한다 | "미니멀리스트 UI 디자이너로서 답변해줘" |

### 7.7.4 초보자를 위한 디자인 프롬프트 개선법

처음부터 `md:grid-cols-2`, `CardHeader`, `--primary` 같은 표현을 쓰기는 어렵다. 그런 표현을 이미 알고 있다면 어느 정도 프론트엔드 경험이 있는 것이다.

초보자는 **기술 용어를 많이 쓰려고 하기보다**, 원하는 느낌과 화면의 역할을 먼저 말하면 된다. 그 다음 Copilot에게 "필요한 컴포넌트와 Tailwind 클래스는 네가 골라줘"라고 요청한다.

**표 7.10** 초보자용 디자인 프롬프트 개선

| 항목 | 너무 막연한 프롬프트 | 초보자용 개선 프롬프트 |
| --- | --- | --- |
| 색상 | "예쁘게 해줘" | "개인 블로그에 어울리게 밝고 읽기 편한 색으로 정리해줘. 너무 튀는 색은 피하고, 주요 버튼만 눈에 띄게 해줘." |
| 레이아웃 | "깔끔하게 해줘" | "글 목록을 한눈에 보기 좋게 정리해줘. 제목, 요약, 작성일이 잘 보이게 배치해줘." |
| 컴포넌트 | "카드로 만들어줘" | "글 하나가 하나의 묶음처럼 보이게 만들어줘. shadcn/ui 컴포넌트 중 적절한 것을 골라 사용해줘." |
| 반응형 | "모바일에서도 보이게" | "휴대폰에서도 읽기 편하게 만들어줘. 화면이 좁을 때는 내용이 아래로 자연스럽게 쌓이게 해줘." |

초보자에게 더 현실적인 프롬프트는 다음과 같다:

```
이 페이지를 개인 블로그답게 보기 좋게 정리해줘.

나는 Tailwind 클래스나 shadcn/ui 컴포넌트 이름을 잘 모른다.
네가 적절한 컴포넌트와 클래스를 선택해줘.

원하는 방향:
- 글을 읽기 편해야 함
- 너무 화려하지 않아야 함
- 모바일에서도 깨지지 않아야 함
- 기존 기능은 그대로 유지해야 함

수정 후 어떤 컴포넌트와 스타일을 사용했는지 쉽게 설명해줘.
```

> **핵심**: 초보자는 정답처럼 완성된 프롬프트를 쓰려고 하지 말고, "목표 + 느낌 + 유지할 기능 + 설명 요청"을 넣으면 충분하다.
> 

---

## 7.8 [ARCHITECTURE.md](http://architecture.md/) 완성하기

### 7.8.1 데이터 모델 설계: 테이블 구조 미리 잡기 (Supabase 대비)

다음 장(Ch8)에서 Supabase 데이터베이스를 연결한다. 그때 테이블을 만들려면 **어떤 데이터가 필요한지** 지금 정리해야 한다.

블로그 앱의 데이터 모델:

```
users (사용자)
├── id: UUID (자동 생성)
├── email: 이메일
├── name: 이름
├── avatar_url: 프로필 이미지 URL
└── role: 역할 ('user', 'admin')

posts (포스트)
├── id: UUID (자동 생성)
├── title: 제목
├── content: 본문
├── author_id: 작성자 (→ users.id)
└── created_at: 작성일시 (자동 생성)
```

대부분의 웹앱은 **사용자 역할(role)**이 필요하다. 일반 사용자와 관리자(admin)처럼 역할에 따라 접근 가능한 페이지와 수행 가능한 작업이 달라진다. `role` 컬럼은 Ch9(인증)에서 프로필 조회에 활용하고, Ch11(RLS)에서 역할 기반 접근 제어에 사용한다.

**테이블 관계**: 한 명의 사용자(users)가 여러 개의 블로그 글(posts)을 작성할 수 있다 → **1:N 관계**. `posts.author_id`가 `users.id`를 참조한다.

### 7.8.2 [ARCHITECTURE.md](http://architecture.md/) 완성 — 컴포넌트 계층과 데이터 모델 추가

7.4절에서 페이지 맵과 유저 플로우만 담은 뼈대를 만들었다. 이제 shadcn/ui 컴포넌트 구조와 방금 정리한 데이터 모델을 추가해 완성한다.

> **바이브코딩 실습**: Copilot에게 ARCHITECTURE.md를 완성하게 한다.
> 

```
#file:ARCHITECTURE.md

ARCHITECTURE.md에 다음 두 섹션을 추가해서 완성해줘.

추가할 내용:
1. 컴포넌트 구조 — 방금 설치한 shadcn/ui 컴포넌트 기준으로 작성
   (Button, Card, Input, Dialog 활용 위치 포함)
2. 데이터 모델 — users, posts 테이블 구조와 관계 (위 7.8.1 내용 기반)

조건:
- 기존 페이지 맵, 유저 플로우 내용은 유지
- "TODO: 추가 예정" 항목을 실제 내용으로 교체
- 상세 구현 코드는 쓰지 말고 설계 문서 형태로 작성
```

완성된 ARCHITECTURE.md는 Ch8부터 Copilot에게 제공하는 **주요 컨텍스트 파일**이 된다. 세션 시작 프롬프트에서 `#file:ARCHITECTURE.md`로 참조하면, Copilot이 프로젝트 전체 구조를 한눈에 파악하고 작업한다.

### 7.8.3 AI 생성 디자인 검증 체크리스트

**표 7.11** AI 디자인 검증 체크리스트

| # | 검증 항목 | 확인 내용 | 확인 방법 |
| --- | --- | --- | --- |
| 1 | **반응형** | 모바일(375px), 태블릿(768px), 데스크톱(1280px)에서 깨지지 않는가? | DevTools -> 반응형 모드 (Ctrl+Shift+M) |
| 2 | **접근성** | 이미지에 alt, 버튼에 의미 있는 텍스트, 충분한 색상 대비가 있는가? | Lighthouse -> 접근성 점수 |
| 3 | **일관성** | 모든 페이지에서 동일한 디자인 토큰을 사용하는가? | 육안 비교 |
| 4 | **컴포넌트** | shadcn/ui 컴포넌트를 올바르게 import하고 사용했는가? | `@/components/ui/` 경로 확인 |
| 5 | **네비게이션** | 모든 페이지 간 이동이 페이지 맵과 일치하는가? | 직접 클릭하며 테스트 |
| 6 | **코드 구조** | 컴포넌트가 ARCHITECTURE.md의 계층과 일치하는가? | 파일 구조 비교 |

### 7.8.4 설계 문서를 참조하여 AI에게 코드 생성 지시하기

ARCHITECTURE.md와 copilot-instructions.md가 준비되었으면, Copilot에게 프로젝트 파일을 참조하여 설계 기반으로 코드를 생성하도록 지시한다:

```
#file:ARCHITECTURE.md

ARCHITECTURE.md의 Page Map과 Component Hierarchy를 참고해서
app/posts/page.tsx에 포스트 목록 페이지를 만들어줘.

조건:
- App Router만 사용
- next/router와 pages router 사용 금지
- 포스트 목록은 shadcn/ui Card를 사용
- 버튼이 필요하면 shadcn/ui Button 사용
- 디자인 토큰은 copilot-instructions.md의 규칙을 따르기
- 수정한 파일과 확인 방법을 설명
```

핵심은 **프로젝트의 설계 파일을 참조하도록 지시하는 것**이다. AI가 프로젝트 전체 파일을 탐색하여 설계 의도에 맞는 코드를 생성한다.

---

### AI가 자주 틀리는 디자인 패턴

**표 7.12** AI가 자주 틀리는 디자인 패턴

| AI 실수 | 올바른 방법 | 이유 |
| --- | --- | --- |
| Tailwind 색상 직접 사용 (`bg-blue-500`) | 디자인 토큰 사용 (`bg-primary`) | 테마 변경 시 전체 수정 필요 |
| 반응형 클래스 누락 | `md:grid-cols-2` 등 브레이크포인트 지정 | 모바일에서 레이아웃 깨짐 |
| shadcn/ui import 경로 오류 | `@/components/ui/button` 실제 경로 확인 | 환각 -- 존재하지 않는 경로 |
| 이미지에 `alt` 속성 누락 | `<img alt="설명" />` 필수 | 접근성 위반 |
| 하드코딩된 색상값, 간격 | CSS 변수 또는 Tailwind 유틸리티 사용 | 디자인 토큰과 불일치 |
| 불필요한 `"use client"` 추가 | Server Component가 기본 -- 필요할 때만 추가 | Ch6에서 배운 원칙 위반 |

---

## 핵심 정리

### 이번 시간 핵심 4가지

1. **AI 슬롭** 방지: 설계서를 먼저 작성하고 AI에게 제공하면 의도에 맞는 결과물이 나온다
2. **shadcn/ui**: 코드를 프로젝트에 복사하는 컴포넌트 라이브러리 + CSS 변수로 테마 커스터마이징
3. **범용 vs 프로젝트별**: copilot-instructions/context/todo는 모든 프로젝트 공통, ARCHITECTURE.md는 프로젝트별
4. **세션 간 연속성**: [context.md](http://context.md/)(상태) + [todo.md](http://todo.md/)(할 일)로 Copilot의 기억 한계를 보완한다

---

## B회차 실습: 아키텍처 설계서 보강

**과제 내용**: Ch1~6에서 만든 **블로그의 아키텍처 설계서**를 보강한다.

설계서에 shadcn/ui 컴포넌트 시스템, 디자인 토큰, DB 스키마 계획을 추가한다. Ch8~12에서 배울 Supabase CRUD, 인증, RLS를 활용할 수 있는 구조로 설계해야 한다.

**제출물**:

① 페이지 맵 보강 (기존 페이지 + 추가 페이지, URL 구조 포함)
② AI 와이어프레임 (Copilot Vision 또는 v0로 생성, 2장 이상)
③ shadcn/ui 테마 (`npx shadcn init` 완료 + 색상 커스터마이징)
④ 데이터 모델 (테이블 2개 이상 + 관계 정의 — Ch8 Supabase 대비)
⑤ [copilot-instructions.md](http://copilot-instructions.md/) (Design Tokens + Component Rules 섹션 포함)
⑥ [ARCHITECTURE.md](http://architecture.md/) (페이지 맵 + 컴포넌트 계층 + 데이터 모델 통합)
⑦ [context.md](http://context.md/) (프로젝트 현재 상태 기록 — 기술 결정 사항 포함)
⑧ [todo.md](http://todo.md/) (전체 작업 체크리스트 — 단계별 구분, 진행률 포함)

B회차에서는 Ch6까지 만든 블로그 프로젝트를 이어서 사용한다. 설계서 파일([ARCHITECTURE.md](http://architecture.md/), [context.md](http://context.md/), [todo.md](http://todo.md/))은 프로젝트 루트에 직접 생성한다.

---

## 바이브코딩 가이드

> **Copilot 활용**: 이번 실습에서는 Copilot Chat에 기존 블로그 프로젝트의 구조를 입력하여 설계서 보강안을 생성한다. AI가 만든 설계서를 그대로 쓰지 말고, A회차에서 배운 "AI 슬롭 방지" 기준으로 반드시 검증·수정한다.
> 

**좋은 프롬프트 vs 나쁜 프롬프트**:

❌ 나쁜 프롬프트:

> "블로그 설계서 만들어줘"
> 

문제: 현재 상태, 보강할 부분, 기술 스택이 전혀 명시되지 않아 AI 슬롭이 생성된다.

✅ 좋은 프롬프트:

> "내 블로그 프로젝트의 ARCHITECTURE.md를 보강해줘.
기술 스택: Next.js 16 App Router + Tailwind CSS + shadcn/ui + Supabase.
기존 페이지: 홈(/), 포스트 목록(/posts), 포스트 작성(/posts/new), 포스트 상세(/posts/[id]).
추가할 것: shadcn/ui 컴포넌트 계층, 디자인 토큰, DB 스키마(users, posts 테이블 + FK 관계).
인증: 이메일/비밀번호 로그인.
각 페이지의 주요 컴포넌트와 데이터 흐름을 포함해줘."
> 

---

## 개인 실습

### 체크포인트 1: 페이지 맵 + 데이터 모델

**목표**: 블로그의 페이지 구조를 보강하고 데이터베이스 모델을 설계한다.

① 기존 블로그의 페이지 맵을 검토한다.

② 페이지 맵을 보강한다. 기존 페이지와 추가 페이지를 모두 포함하고, App Router URL 구조로 정리한다.

```
/               → 홈 (포스트 목록)
/posts          → 포스트 목록
/posts/new      → 포스트 작성
/posts/[id]     → 포스트 상세
/mypage         → 마이페이지
/login          → 로그인
/signup         → 회원가입
```

③ 데이터 모델을 설계한다. 테이블 2개 이상과 1:N 관계를 정의한다.

```
profiles (사용자)
├── id: uuid (PK, auth.users 참조)
├── username: text
├── avatar_url: text
└── created_at: timestamptz

posts (포스트)
├── id: uuid (PK)
├── user_id: uuid (FK → profiles.id)
├── title: text
├── content: text
└── created_at: timestamptz
```

④ Copilot에게 블로그에 맞는 데이터 모델을 요청하고, 결과를 검토한다.

### 체크포인트 2: 와이어프레임 + shadcn/ui 테마

**목표**: AI로 와이어프레임을 생성하고, shadcn/ui 테마를 설정한다.

① Copilot Vision 또는 v0([https://v0.dev](https://v0.dev/))에 와이어프레임을 요청한다.

```
다음 페이지의 와이어프레임을 그려줘:
1) 홈 페이지 — 포스트 카드 목록 + 검색바
2) 포스트 작성 페이지 — 제목, 내용 입력 폼 + 제출 버튼
스타일: 깔끔하고 미니멀, shadcn/ui 컴포넌트 활용
```

② shadcn/ui를 초기화한다.

```bash
npx shadcn@latest init
```

③ CSS 변수에서 프로젝트 색상을 커스터마이징한다 (`app/globals.css`).

```css
:root {
  --primary: 220 70% 50%;      /* 프로젝트 메인 색상 */
  --primary-foreground: 0 0% 100%;
}
```

④ 필요한 컴포넌트를 추가한다.

```bash
npx shadcn@latest add button card input
```

### 체크포인트 3: 설계 문서 통합 + GitHub push

**목표**: 설계 문서 4종 세트를 완성하고 GitHub에 push한다.

① ARCHITECTURE.md를 보강한다 — 페이지 맵 + 컴포넌트 계층 + 데이터 모델 통합

② copilot-instructions.md를 보강한다 — Design Tokens + Component Rules 섹션 포함

③ context.md를 작성한다 — 현재 상태, 기술 결정 사항 기록

④ todo.md를 작성한다 — 전체 작업 체크리스트 (Ch8~12에서 구현할 항목 포함)

⑤ 7.8.3의 AI 생성 디자인 검증 체크리스트를 수행한다.

⑥ Copilot Chat(Agent 모드)에 GitHub push를 요청한다.

> **Copilot 프롬프트**
> 
> 
> "터미널에서 git add, commit, push를 실행해줘."
> 

---

## 흔한 AI 실수

**표 7.15** Ch7에서 AI가 자주 틀리는 패턴

| AI 실수 | 올바른 방법 | 발생 원인 |
| --- | --- | --- |
| 페이지 맵에 Pages Router 경로 사용 (`/pages/about`) | App Router 경로 사용 (`/app/about/page.tsx`) | Next.js 버전 혼동 |
| 데이터 모델에 `id: int` 사용 | `id: uuid` 사용 (Supabase auth.users와 호환) | PostgreSQL + Supabase 규칙 미인식 |
| copilot-instructions.md에 구체적 파일 경로 누락 | 프로젝트 구조와 기술 스택을 명시 | 맥락 부족 |
| 와이어프레임에 존재하지 않는 컴포넌트 사용 | shadcn/ui에 실제로 있는 컴포넌트만 사용 | AI 환각 |
| CSS 변수 형식 오류 (`#3b82f6` 대신 HSL 사용) | `--primary: 220 70% 50%` (HSL 공백 구분) | shadcn/ui의 CSS 변수 형식 미인식 |
| ARCHITECTURE.md에 구현 코드 포함 | 설계 수준의 구조만 기술 (코드는 Ch8부터) | 설계와 구현 단계 혼동 |

---

## 제출 안내 (Google Classroom)

Google Classroom의 "Ch7 과제"에 아래 두 항목을 제출한다:

```
  GitHub 저장소 URL
   예: <https://github.com/내아이디/my-first-web>
   (ARCHITECTURE.md, copilot-instructions.md, context.md, todo.md 포함)
```

---