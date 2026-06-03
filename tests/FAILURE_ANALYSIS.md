# Playwright E2E 테스트 실패 원인 분석

---

## 🔴 실패 유형 1: 로그인 폼 요소를 찾지 못함

### 문제 상황
```
await page.getByLabel(/이메일/i).fill(testEmail);
// → locator.fill: Test timeout of 30000ms exceeded
```

### 원인 분석

#### ✅ **확인된 코드 상태** (LoginClient.tsx)
```tsx
<div>
  <label className="block text-sm font-medium text-gray-900 mb-2">이메일</label>
  <Input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@example.com"
    disabled={loading || !isSupabaseConfigured}
    required
  />
</div>
```

#### 🚨 **문제점**
1. **`label` 요소에 `htmlFor` 속성 없음**
2. **`Input` 컴포넌트에 `id` 속성을 전달하지 않음**

#### 왜 `getByLabel()`이 실패하는가?
Playwright의 `getByLabel()`은 다음 로직으로 작동합니다:
```
1. <label htmlFor="fieldId">이메일</label>을 찾음
2. htmlFor="fieldId"의 값을 읽음
3. <input id="fieldId">를 찾음
```

현재 코드는 `htmlFor` 속성이 없으므로, 연결되지 않은 레이블로 인식됩니다.

---

### 분류

| 분류 | 판단 |
|------|------|
| **테스트 코드 문제** | ❌ 아님 (테스트 코드는 정확함) |
| **애플리케이션 구현 문제** | ✅ **YES** |
| **접근성 마크업 문제** | ✅ **YES** (직접 원인) |
| **Playwright 사용 방식 문제** | ❌ 아님 (사용법 정확함) |

### 🔧 수정 방향

#### 옵션 A: `htmlFor` + `id` 속성 추가 (권장)
```tsx
<div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
    이메일
  </label>
  <Input
    id="email"  // ← 추가
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@example.com"
    disabled={loading || !isSupabaseConfigured}
    required
  />
</div>
```
**장점**: 접근성 표준 준수, Playwright와 일반 사용자 모두 정상 작동

#### 옵션 B: 테스트에서 셀렉터 변경
```ts
// ❌ 현재 (작동 안 함)
await page.getByLabel(/이메일/i).fill(testEmail);

// ✅ 대체 방법들
await page.getByPlaceholder(/you@example\.com/i).fill(testEmail);
await page.locator('input[type="email"]').fill(testEmail);
await page.getByRole('textbox', { name: /이메일/i }).fill(testEmail);
```
**단점**: 접근성 마크업은 여전히 불완전 (근본 해결 아님)

---

## 🔴 실패 유형 2: 로그인 페이지 제목 검증 실패

### 문제 상황
```
await expect(page).toHaveTitle(/로그인/i);
// Expected: /로그인/i
// Received: "내 블로그"
```

### 원인 분석

#### ✅ **확인된 코드 상태** (layout.tsx)
```tsx
export const metadata: Metadata = {
  title: "내 블로그",  // ← 모든 페이지의 공통 제목
  description: "웹 개발 블로그",
};
```

#### 🚨 **문제점**
- 모든 페이지가 동일한 title을 사용 (`<title>내 블로그</title>`)
- 페이지별 제목이 설정되어 있지 않음
- 테스트는 페이지별 고유 제목이 있을 것이라고 가정함

---

### 분류

| 분류 | 판단 |
|------|------|
| **테스트 코드 문제** | ✅ **YES** (부분적) |
| **애플리케이션 구현 문제** | ✅ **YES** (메타데이터 미설정) |
| **접근성 마크업 문제** | ❌ 아님 |
| **Playwright 사용 방식 문제** | ❌ 아님 |

### 🔧 수정 방향

#### 옵션 A: 페이지별 title 설정 (권장)
```tsx
// app/login/page.tsx 또는 app/posts/new/page.tsx 에서
export const metadata: Metadata = {
  title: "로그인 - 내 블로그",
  description: "계정으로 로그인하세요",
};
```

#### 옵션 B: 테스트 코드 조정
```ts
// 현재 (실패)
await expect(page).toHaveTitle(/로그인/i);

// 수정됨
await expect(page).toHaveTitle("내 블로그");
// 또는 (더 유연함)
await expect(page.locator("h1")).toContainText(/로그인/i);
```

**추천**: 옵션 A를 권장. (SEO, UX 측면에서 페이지별 title이 필요)

---

## 🔴 실패 유형 3: localStorage 접근 실패

### 문제 상황
```ts
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
});
// → SecurityError: Failed to read the 'localStorage' property from 'Window'
```

### 원인 분석

#### 🚨 **문제점**
```ts
// ❌ 잘못된 순서
const newPage = await newContext.newPage();

// 아직 페이지가 로드되지 않음 (about:blank)
await newPage.evaluate(() => {
  localStorage.clear();  // about:blank에서는 localStorage 접근 불가
});

// 여기서 페이지 로드
await newPage.goto('/posts/new');
```

#### 왜 SecurityError가 발생하는가?
1. **`newPage()` 호출 직후**: 페이지 URL = `about:blank`
2. **`about:blank` 컨텍스트**: 각 origin별 localStorage가 분리됨
3. **`evaluate()` 실행**: `about:blank` origin에서 실행되므로 localhost 저장소 접근 불가
4. **SecurityError 발생**: Origin 미스매치

#### 올바른 흐름
```ts
1. newPage() 생성
2. goto('/login' or any real page)  ← 실제 페이지 로드
3. clearCookies() / evaluate(localStorage.clear())  ← 이제 가능
```

---

### 분류

| 분류 | 판단 |
|------|------|
| **테스트 코드 문제** | ✅ **YES** (순서 오류) |
| **애플리케이션 구현 문제** | ❌ 아님 |
| **접근성 마크업 문제** | ❌ 아님 |
| **Playwright 사용 방식 문제** | ✅ **YES** (직접 원인) |

### 🔧 수정 방향

#### ✅ **옵션 A: 페이지 로드 후 처리** (권장)
```ts
const newContext = await page.context().browser()?.newContext();
const newPage = await newContext.newPage();

// 1. 먼저 페이지로 이동 (about:blank → localhost)
await newPage.goto('/posts/new');

// 2. 이제 localStorage 접근 가능
await newPage.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
});
```

#### ✅ **옵션 B: 컨텍스트 생성 시점에 처리** (더 깔끔)
```ts
// 쿠키 없이 새로운 컨텍스트 생성
const newContext = await page.context().browser()?.newContext();
// → 자동으로 깨끗한 상태 (쿠키/스토리지 없음)

const newPage = await newContext.newPage();
await newPage.goto('/posts/new');
// → localStorage 접근 불필요
```

**추천**: 옵션 B. (쿠키/스토리지 초기화는 새 컨텍스트로 충분)

---

## 📋 종합 수정 계획

| 실패 유형 | 원인 | 수정 우선순위 | 담당 영역 |
|----------|------|-------------|---------|
| 로그인 폼 못 찾음 | 접근성 마크업 미흡 | 🔴 **높음** | 애플리케이션 |
| 제목 검증 실패 | 테스트 가정 오류 + 메타데이터 미설정 | 🟡 **중간** | 테스트 + 애플리케이션 |
| localStorage 오류 | Playwright 사용 순서 오류 | 🔴 **높음** | 테스트 |

---

## 🎯 권장 수정 순서

1. **LoginClient.tsx**: `label htmlFor` + `Input id` 추가 (접근성)
2. **테스트 코드**: localStorage 처리 로직 순서 변경
3. **메타데이터**: 필요하면 페이지별 title 추가

