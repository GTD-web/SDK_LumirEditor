# Tailwind CSS Integration Guide

## @lumir-company/editor와 Tailwind CSS 함께 사용하기

이 가이드는 LumirEditor를 Tailwind CSS 프로젝트에 통합하는 방법을 설명합니다.

---

## 1. 설치

```bash
# npm
npm install @lumir-company/editor

# yarn
yarn add @lumir-company/editor

# pnpm
pnpm add @lumir-company/editor
```

---

## 2. 기본 설정

### CSS 임포트 (필수)

프로젝트의 글로벌 CSS 파일 또는 레이아웃 파일에 에디터 스타일을 임포트합니다.

```tsx
// app/layout.tsx 또는 globals.css에서
import "@lumir-company/editor/style.css";
```

> ⚠️ 에디터 스타일은 Tailwind 스타일보다 먼저 임포트하는 것이 좋습니다.

---

## 3. 기본 사용 예제

### 간단한 에디터

```tsx
import { LumirEditor } from "@lumir-company/editor";
import "@lumir-company/editor/style.css";

function BasicEditor() {
  return (
    <LumirEditor
      className="min-h-[400px] rounded-lg border border-gray-200 shadow-lg"
      onContentChange={(blocks) => console.log(blocks)}
    />
  );
}
```

### 컨테이너 스타일링

```tsx
function ContainedEditor() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <LumirEditor
          className="min-h-[500px]"
          theme="light"
          onContentChange={(blocks) => console.log(blocks)}
        />
      </div>
    </div>
  );
}
```

---

## 4. 고급 스타일링

### 포커스 상태 표시

```tsx
<LumirEditor
  className="
    min-h-[500px] 
    rounded-xl 
    border border-gray-200 
    shadow-xl
    transition-all duration-200
    focus-within:ring-2 
    focus-within:ring-blue-500
    focus-within:border-blue-500
  "
/>
```

### 카드 스타일 에디터

```tsx
<div className="p-6 bg-gray-100 min-h-screen">
  <div className="max-w-3xl mx-auto">
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
        <h2 className="text-white font-bold text-lg">글 작성</h2>
      </div>
      <LumirEditor
        className="min-h-[600px]"
        s3Upload={{
          apiEndpoint: "/api/s3/presigned",
          env: "development",
          path: "blog",
        }}
      />
    </div>
  </div>
</div>
```

---

## 5. 반응형 디자인

### 모바일/태블릿/데스크톱 대응

```tsx
function ResponsiveEditor() {
  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <LumirEditor
        className="
          min-h-[300px] sm:min-h-[400px] lg:min-h-[600px]
          rounded-md sm:rounded-lg lg:rounded-xl
          border border-gray-300
          shadow-sm sm:shadow-md lg:shadow-lg
        "
      />
    </div>
  );
}
```

### 전체 화면 모드

```tsx
import { useState } from "react";
import { LumirEditor, cn } from "@lumir-company/editor";

function FullscreenEditor() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        {isFullscreen ? "축소" : "전체 화면"}
      </button>

      <LumirEditor
        className={cn(
          "transition-all duration-300 min-h-[400px] rounded-lg border",
          isFullscreen && "fixed inset-0 z-50 rounded-none border-none"
        )}
      />
    </>
  );
}
```

---

## 6. 테마별 스타일링

### 라이트 모드

```tsx
<div className="bg-white">
  <LumirEditor
    theme="light"
    className="bg-white text-gray-900 border border-gray-200 rounded-lg"
  />
</div>
```

### 다크 모드

```tsx
<div className="bg-gray-900">
  <LumirEditor
    theme="dark"
    className="bg-gray-800 text-white border border-gray-700 rounded-lg"
  />
</div>
```

### 시스템 설정 따르기 (다크 모드 지원)

```tsx
function ThemeAwareEditor() {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 transition-colors">
      <LumirEditor
        theme="light" // 또는 조건부로 설정
        className="
          bg-white text-gray-900 border-gray-200
          dark:bg-gray-800 dark:text-white dark:border-gray-700
          border rounded-lg min-h-[400px]
          transition-colors
        "
      />
    </div>
  );
}
```

### 동적 테마 전환

```tsx
import { useState, useEffect } from "react";

function DynamicThemeEditor() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 시스템 다크 모드 감지
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <LumirEditor
      theme={isDark ? "dark" : "light"}
      className={cn(
        "min-h-[400px] rounded-lg border transition-colors",
        isDark
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      )}
    />
  );
}
```

---

## 7. cn 유틸리티 활용

`@lumir-company/editor`에서 제공하는 `cn` 유틸리티로 조건부 클래스를 쉽게 결합할 수 있습니다.

```tsx
import { LumirEditor, cn } from "@lumir-company/editor";

interface EditorProps {
  isFullscreen?: boolean;
  hasError?: boolean;
  isDisabled?: boolean;
}

function ConditionalEditor({ isFullscreen, hasError, isDisabled }: EditorProps) {
  return (
    <LumirEditor
      editable={!isDisabled}
      className={cn(
        // 기본 스타일
        "min-h-[400px] rounded-lg border transition-all",

        // 전체 화면
        isFullscreen && "fixed inset-0 z-50 rounded-none",

        // 에러 상태
        hasError && "border-red-500 ring-2 ring-red-200",

        // 비활성화 상태
        isDisabled && "opacity-50 cursor-not-allowed bg-gray-100"
      )}
    />
  );
}
```

---

## 8. 커스텀 CSS로 세밀한 제어

Tailwind와 함께 커스텀 CSS를 사용하여 에디터 내부 요소를 스타일링할 수 있습니다.

### globals.css

```css
/* 커스텀 에디터 스타일 */
.custom-editor .bn-editor {
  padding-left: 32px;
  padding-right: 16px;
  font-size: 16px;
  line-height: 1.8;
}

.custom-editor [data-content-type="heading"] {
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 8px;
}

.custom-editor [data-content-type="paragraph"] {
  font-size: 15px;
  color: #374151;
}

/* 다크 모드 커스텀 */
.dark .custom-editor [data-content-type="paragraph"] {
  color: #e5e7eb;
}

/* 이미지 스타일 */
.custom-editor img {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### 사용

```tsx
<LumirEditor className="custom-editor min-h-[500px]" />
```

---

## 9. 실전 예제: 블로그 에디터

```tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import "@lumir-company/editor/style.css";

const LumirEditor = dynamic(
  () => import("@lumir-company/editor").then((m) => ({ default: m.LumirEditor })),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
  return (
    <div className="min-h-[500px] bg-gray-100 animate-pulse rounded-lg" />
  );
}

export default function BlogEditor() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({ title, content }),
      });
      alert("저장되었습니다!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="
              w-full text-3xl font-bold 
              bg-transparent border-none outline-none
              placeholder:text-gray-400
            "
          />
        </div>

        {/* 에디터 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <LumirEditor
            className="min-h-[500px]"
            s3Upload={{
              apiEndpoint: "/api/s3/presigned",
              env: "production",
              path: "blog/images",
            }}
            onContentChange={setContent}
          />
        </div>

        {/* 저장 버튼 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="
              px-6 py-3 
              bg-blue-600 hover:bg-blue-700 
              text-white font-medium 
              rounded-lg shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {isSaving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 10. 팁 & 주의사항

### 스타일 우선순위

```tsx
// ✅ 올바른 임포트 순서
import "@lumir-company/editor/style.css";  // 에디터 스타일 먼저
import "./globals.css";               // Tailwind 및 커스텀 스타일
```

### 기본 스타일 참고

| 선택자 | 기본 스타일 |
|--------|-------------|
| `.lumirEditor` | `width: 100%; height: 100%; min-width: 200px;` |
| `.lumirEditor .bn-editor` | 패딩: 왼쪽 25px, 오른쪽 10px, 위 5px |
| `.lumirEditor [data-content-type="paragraph"]` | `font-size: 14px` |
| 폰트 | Pretendard → Noto Sans KR → 시스템 폰트 |

### Tailwind Safelist (선택사항)

에디터에서 사용하는 동적 클래스가 있다면 safelist에 추가합니다:

```js
// tailwind.config.js
module.exports = {
  safelist: [
    // 에디터 관련 클래스가 purge되지 않도록 보호
    "lumirEditor",
    { pattern: /^lumirEditor-/ },
  ],
};
```

---

## 관련 문서

- [README.md](../README.md) - 전체 API 문서
- [BlockNote Documentation](https://www.blocknotejs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
