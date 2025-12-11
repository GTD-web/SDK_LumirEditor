# LumirEditor

🖼️ **이미지 전용** BlockNote 기반 Rich Text 에디터

[![npm version](https://img.shields.io/npm/v/@lumir-company/editor.svg)](https://www.npmjs.com/package/@lumir-company/editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 목차

- [✨ 핵심 특징](#-핵심-특징)
- [📦 설치](#-설치)
- [🚀 빠른 시작](#-빠른-시작)
- [📚 Props 레퍼런스](#-props-레퍼런스)
- [🖼️ 이미지 업로드](#️-이미지-업로드)
- [🛠️ 유틸리티 API](#️-유틸리티-api)
- [📖 타입 정의](#-타입-정의)
- [💡 사용 예제](#-사용-예제)
- [🎨 스타일링 가이드](#-스타일링-가이드)
- [⚠️ 주의사항 및 트러블슈팅](#️-주의사항-및-트러블슈팅)
- [📄 라이선스](#-라이선스)

---

## ✨ 핵심 특징

| 특징                     | 설명                                                        |
| ------------------------ | ----------------------------------------------------------- |
| 🖼️ **이미지 전용**       | 이미지 업로드/드래그앤드롭만 지원 (비디오/오디오/파일 제거) |
| ☁️ **S3 연동**           | Presigned URL 기반 S3 업로드 내장                           |
| 🎯 **커스텀 업로더**     | 자체 업로드 로직 적용 가능                                  |
| ⏳ **로딩 스피너**       | 이미지 업로드 중 자동 스피너 표시                           |
| 🚀 **애니메이션 최적화** | 기본 애니메이션 비활성화로 성능 향상                        |
| 📝 **TypeScript**        | 완전한 타입 안전성                                          |
| 🎨 **테마 지원**         | 라이트/다크 테마 및 커스텀 테마 지원                        |
| 📱 **반응형**            | 모바일/데스크톱 최적화                                      |

### 지원 이미지 형식

```
PNG, JPEG/JPG, GIF (애니메이션 포함), WebP, BMP, SVG
```

---

## 📦 설치

```bash
# npm
npm install @lumir-company/editor

# yarn
yarn add @lumir-company/editor

# pnpm
pnpm add @lumir-company/editor
```

### Peer Dependencies

```json
{
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0"
}
```

---

## 🚀 빠른 시작

### 1단계: CSS 임포트 (필수)

```tsx
import "@lumir-company/editor/style.css";
```

> ⚠️ **중요**: CSS를 임포트하지 않으면 에디터가 정상적으로 렌더링되지 않습니다.

### 2단계: 기본 사용

```tsx
import { LumirEditor } from "@lumir-company/editor";
import "@lumir-company/editor/style.css";

export default function App() {
  return (
    <div className="w-full h-[400px]">
      <LumirEditor onContentChange={(blocks) => console.log(blocks)} />
    </div>
  );
}
```

### 3단계: Next.js에서 사용 (SSR 비활성화 필수)

```tsx
"use client";

import dynamic from "next/dynamic";
import "@lumir-company/editor/style.css";

const LumirEditor = dynamic(
  () =>
    import("@lumir-company/editor").then((m) => ({ default: m.LumirEditor })),
  { ssr: false }
);

export default function EditorPage() {
  return (
    <div className="w-full h-[500px]">
      <LumirEditor
        onContentChange={(blocks) => console.log("Content:", blocks)}
      />
    </div>
  );
}
```

---

## 📚 Props 레퍼런스

### 에디터 옵션 (Editor Options)

| Prop                 | 타입                                      | 기본값                      | 설명                                     |
| -------------------- | ----------------------------------------- | --------------------------- | ---------------------------------------- |
| `initialContent`     | `DefaultPartialBlock[] \| string`         | `undefined`                 | 초기 콘텐츠 (블록 배열 또는 JSON 문자열) |
| `initialEmptyBlocks` | `number`                                  | `3`                         | 초기 빈 블록 개수                        |
| `placeholder`        | `string`                                  | `undefined`                 | 첫 번째 블록의 placeholder 텍스트        |
| `uploadFile`         | `(file: File) => Promise<string>`         | `undefined`                 | 커스텀 파일 업로드 함수                  |
| `s3Upload`           | `S3UploaderConfig`                        | `undefined`                 | S3 업로드 설정                           |
| `tables`             | `TableConfig`                             | `{...}`                     | 테이블 기능 설정                         |
| `heading`            | `{ levels?: (1\|2\|3\|4\|5\|6)[] }`       | `{ levels: [1,2,3,4,5,6] }` | 헤딩 레벨 설정                           |
| `defaultStyles`      | `boolean`                                 | `true`                      | 기본 스타일 활성화                       |
| `disableExtensions`  | `string[]`                                | `[]`                        | 비활성화할 확장 기능 목록                |
| `tabBehavior`        | `"prefer-navigate-ui" \| "prefer-indent"` | `"prefer-navigate-ui"`      | 탭 키 동작                               |
| `trailingBlock`      | `boolean`                                 | `true`                      | 마지막에 빈 블록 자동 추가               |
| `allowVideoUpload`   | `boolean`                                 | `false`                     | 비디오 업로드 허용 (기본 비활성)         |
| `allowAudioUpload`   | `boolean`                                 | `false`                     | 오디오 업로드 허용 (기본 비활성)         |
| `allowFileUpload`    | `boolean`                                 | `false`                     | 일반 파일 업로드 허용 (기본 비활성)      |

### 뷰 옵션 (View Options)

| Prop                | 타입                               | 기본값    | 설명                                                 |
| ------------------- | ---------------------------------- | --------- | ---------------------------------------------------- |
| `editable`          | `boolean`                          | `true`    | 편집 가능 여부                                       |
| `theme`             | `"light" \| "dark" \| ThemeObject` | `"light"` | 에디터 테마                                          |
| `formattingToolbar` | `boolean`                          | `true`    | 서식 툴바 표시                                       |
| `linkToolbar`       | `boolean`                          | `true`    | 링크 툴바 표시                                       |
| `sideMenu`          | `boolean`                          | `true`    | 사이드 메뉴 표시                                     |
| `sideMenuAddButton` | `boolean`                          | `false`   | 사이드 메뉴 + 버튼 표시 (false시 드래그 핸들만 표시) |
| `emojiPicker`       | `boolean`                          | `true`    | 이모지 선택기 표시                                   |
| `filePanel`         | `boolean`                          | `true`    | 파일 패널 표시                                       |
| `tableHandles`      | `boolean`                          | `true`    | 테이블 핸들 표시                                     |
| `className`         | `string`                           | `""`      | 컨테이너 CSS 클래스                                  |

### 콜백 (Callbacks)

| Prop                | 타입                                      | 설명                   |
| ------------------- | ----------------------------------------- | ---------------------- |
| `onContentChange`   | `(blocks: DefaultPartialBlock[]) => void` | 콘텐츠 변경 시 호출    |
| `onSelectionChange` | `() => void`                              | 선택 영역 변경 시 호출 |

### S3UploaderConfig

```tsx
interface S3UploaderConfig {
  apiEndpoint: string; // Presigned URL API 엔드포인트 (필수)
  env: "development" | "production"; // 환경 (필수)
  path: string; // S3 경로 (필수)
}
```

### TableConfig

```tsx
interface TableConfig {
  splitCells?: boolean; // 셀 분할 (기본: true)
  cellBackgroundColor?: boolean; // 셀 배경색 (기본: true)
  cellTextColor?: boolean; // 셀 텍스트 색상 (기본: true)
  headers?: boolean; // 헤더 행 (기본: true)
}
```

---

## 🖼️ 이미지 업로드

### 방법 1: S3 업로드 (권장)

Presigned URL을 사용한 안전한 S3 업로드 방식입니다.

```tsx
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "development",
    path: "blog/images",
  }}
  onContentChange={(blocks) => console.log(blocks)}
/>
```

**S3 파일 저장 경로 구조:**

```
{env}/{path}/{filename}
예: development/blog/images/my-image.png
```

**API 엔드포인트 응답 예시:**

```json
{
  "presignedUrl": "https://s3.amazonaws.com/bucket/...",
  "publicUrl": "https://cdn.example.com/development/blog/images/my-image.png"
}
```

### 방법 2: 커스텀 업로더

자체 업로드 로직을 사용할 때 활용합니다.

```tsx
<LumirEditor
  uploadFile={async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.url; // 업로드된 이미지의 URL 반환
  }}
/>
```

### 방법 3: createS3Uploader 헬퍼 함수

S3 업로더를 직접 생성하여 사용할 수 있습니다.

```tsx
import { LumirEditor, createS3Uploader } from "@lumir-company/editor";

// S3 업로더 생성
const s3Uploader = createS3Uploader({
  apiEndpoint: "/api/s3/presigned",
  env: "production",
  path: "uploads/images",
});

// 에디터에 적용
<LumirEditor uploadFile={s3Uploader} />;

// 또는 별도로 사용
const imageUrl = await s3Uploader(imageFile);
```

### 업로드 우선순위

1. `uploadFile` prop이 있으면 우선 사용
2. `uploadFile`이 없고 `s3Upload`가 있으면 S3 업로드 사용
3. 둘 다 없으면 업로드 실패

---

## 🛠️ 유틸리티 API

### ContentUtils

콘텐츠 관리 유틸리티 클래스입니다.

```tsx
import { ContentUtils } from "@lumir-company/editor";

// JSON 문자열 유효성 검증
const isValid = ContentUtils.isValidJSONString('[{"type":"paragraph"}]');
// true

// JSON 문자열을 블록 배열로 파싱
const blocks = ContentUtils.parseJSONContent(jsonString);
// DefaultPartialBlock[] | null

// 기본 빈 블록 생성
const emptyBlock = ContentUtils.createDefaultBlock();
// { type: "paragraph", props: {...}, content: [...], children: [] }

// 콘텐츠 유효성 검증 및 기본값 설정
const validatedContent = ContentUtils.validateContent(content, 3);
// 빈 콘텐츠면 3개의 빈 블록 반환
```

### EditorConfig

에디터 설정 유틸리티 클래스입니다.

```tsx
import { EditorConfig } from "@lumir-company/editor";

// 테이블 기본 설정 가져오기
const tableConfig = EditorConfig.getDefaultTableConfig({
  splitCells: true,
  headers: false,
});

// 헤딩 기본 설정 가져오기
const headingConfig = EditorConfig.getDefaultHeadingConfig({
  levels: [1, 2, 3],
});

// 비활성화 확장 목록 생성
const disabledExt = EditorConfig.getDisabledExtensions(
  ["codeBlock"], // 사용자 정의 비활성 확장
  false, // allowVideo
  false, // allowAudio
  false // allowFile
);
// ["codeBlock", "video", "audio", "file"]
```

### cn (className 유틸리티)

조건부 className 결합 유틸리티입니다.

```tsx
import { cn } from "@lumir-company/editor";

<LumirEditor
  className={cn(
    "min-h-[400px] rounded-lg",
    isFullscreen && "fixed inset-0 z-50",
    isDarkMode && "dark-theme"
  )}
/>;
```

---

## 📖 타입 정의

### 주요 타입 import

```tsx
import type {
  // 에디터 Props
  LumirEditorProps,

  // 에디터 인스턴스 타입
  EditorType,

  // 블록 관련 타입
  DefaultPartialBlock,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  PartialBlock,
  BlockNoteEditor,
} from "@lumir-company/editor";

import type { S3UploaderConfig } from "@lumir-company/editor";
```

### LumirEditorProps 전체 인터페이스

```tsx
interface LumirEditorProps {
  // === Editor Options ===
  initialContent?: DefaultPartialBlock[] | string;
  initialEmptyBlocks?: number;
  placeholder?: string;
  uploadFile?: (file: File) => Promise<string>;
  s3Upload?: {
    apiEndpoint: string;
    env: "development" | "production";
    path: string;
  };
  allowVideoUpload?: boolean;
  allowAudioUpload?: boolean;
  allowFileUpload?: boolean;
  tables?: {
    splitCells?: boolean;
    cellBackgroundColor?: boolean;
    cellTextColor?: boolean;
    headers?: boolean;
  };
  heading?: { levels?: (1 | 2 | 3 | 4 | 5 | 6)[] };
  defaultStyles?: boolean;
  disableExtensions?: string[];
  tabBehavior?: "prefer-navigate-ui" | "prefer-indent";
  trailingBlock?: boolean;

  // === View Options ===
  editable?: boolean;
  theme?:
    | "light"
    | "dark"
    | Partial<Record<string, unknown>>
    | {
        light: Partial<Record<string, unknown>>;
        dark: Partial<Record<string, unknown>>;
      };
  formattingToolbar?: boolean;
  linkToolbar?: boolean;
  sideMenu?: boolean;
  sideMenuAddButton?: boolean;
  emojiPicker?: boolean;
  filePanel?: boolean;
  tableHandles?: boolean;
  onSelectionChange?: () => void;
  className?: string;

  // === Callbacks ===
  onContentChange?: (content: DefaultPartialBlock[]) => void;
}
```

---

## 💡 사용 예제

### 기본 에디터

```tsx
import { LumirEditor } from "@lumir-company/editor";
import "@lumir-company/editor/style.css";

function BasicEditor() {
  return (
    <div className="h-[400px]">
      <LumirEditor />
    </div>
  );
}
```

### 초기 콘텐츠 설정

```tsx
// 방법 1: 블록 배열
<LumirEditor
  initialContent={[
    {
      type: "heading",
      props: { level: 1 },
      content: [{ type: "text", text: "제목입니다", styles: {} }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "본문 내용...", styles: {} }],
    },
  ]}
/>

// 방법 2: JSON 문자열
<LumirEditor
  initialContent='[{"type":"paragraph","content":[{"type":"text","text":"Hello World","styles":{}}]}]'
/>
```

### 읽기 전용 모드

```tsx
<LumirEditor
  editable={false}
  initialContent={savedContent}
  sideMenu={false}
  formattingToolbar={false}
/>
```

### 다크 테마

```tsx
<LumirEditor theme="dark" className="bg-gray-900 rounded-lg" />
```

### S3 이미지 업로드

```tsx
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: process.env.NODE_ENV as "development" | "production",
    path: "articles/images",
  }}
  onContentChange={(blocks) => {
    // 저장 로직
    saveToDatabase(JSON.stringify(blocks));
  }}
/>
```

### 반응형 디자인

```tsx
<div className="w-full h-64 md:h-96 lg:h-[600px]">
  <LumirEditor className="h-full rounded-md md:rounded-lg shadow-sm md:shadow-md" />
</div>
```

### 테이블 설정 커스터마이징

```tsx
<LumirEditor
  tables={{
    splitCells: true,
    cellBackgroundColor: true,
    cellTextColor: false, // 셀 텍스트 색상 비활성
    headers: true,
  }}
  heading={{
    levels: [1, 2, 3], // H4-H6 비활성
  }}
/>
```

### 콘텐츠 저장 및 불러오기

```tsx
import { useState, useEffect } from "react";
import { LumirEditor, ContentUtils } from "@lumir-company/editor";

function EditorWithSave() {
  const [content, setContent] = useState<string>("");

  // 저장된 콘텐츠 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("editor-content");
    if (saved && ContentUtils.isValidJSONString(saved)) {
      setContent(saved);
    }
  }, []);

  // 콘텐츠 저장
  const handleContentChange = (blocks) => {
    const jsonContent = JSON.stringify(blocks);
    localStorage.setItem("editor-content", jsonContent);
  };

  return (
    <LumirEditor
      initialContent={content}
      onContentChange={handleContentChange}
    />
  );
}
```

---

## 🎨 스타일링 가이드

### 기본 CSS 구조

```css
/* 메인 컨테이너 - 슬래시 메뉴 오버플로우 허용 */
.lumirEditor {
  width: 100%;
  height: 100%;
  min-width: 200px;
  overflow: visible; /* 슬래시 메뉴가 컨테이너를 넘어 표시되도록 */
  background-color: #ffffff;
}

/* 에디터 내부 콘텐츠 영역 스크롤 */
.lumirEditor .bn-container {
  overflow: auto;
  max-height: 100%;
}

/* 슬래시 메뉴 z-index 보장 */
.bn-suggestion-menu,
.bn-slash-menu,
.mantine-Menu-dropdown,
.mantine-Popover-dropdown {
  z-index: 9999 !important;
}

/* 에디터 내용 영역 */
.lumirEditor .bn-editor {
  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
  padding: 5px 10px 0 25px;
}

/* 문단 블록 */
.lumirEditor [data-content-type="paragraph"] {
  font-size: 14px;
}
```

### Tailwind CSS와 함께 사용

```tsx
import { LumirEditor, cn } from "@lumir-company/editor";

<LumirEditor
  className={cn(
    "min-h-[400px] rounded-xl",
    "border border-gray-200 shadow-lg",
    "focus-within:ring-2 focus-within:ring-blue-500"
  )}
/>;
```

### 커스텀 스타일 적용

```css
/* globals.css */
.my-editor .bn-editor {
  padding-left: 30px;
  padding-right: 20px;
  font-size: 16px;
}

.my-editor [data-content-type="heading"] {
  font-weight: 700;
  margin-top: 24px;
}
```

```tsx
<LumirEditor className="my-editor" />
```

---

## ⚠️ 주의사항 및 트러블슈팅

### 필수 체크리스트

| 항목                 | 체크                                        |
| -------------------- | ------------------------------------------- |
| CSS 임포트           | `import "@lumir-company/editor/style.css";` |
| 컨테이너 높이 설정   | 부모 요소에 높이 지정 필수                  |
| Next.js SSR 비활성화 | `dynamic(..., { ssr: false })` 사용         |
| React 버전           | 18.0.0 이상 필요                            |

### 일반적인 문제 해결

#### 1. 에디터가 렌더링되지 않음

```tsx
// ❌ 잘못된 사용
<LumirEditor />;

// ✅ 올바른 사용 - CSS 임포트 필요
import "@lumir-company/editor/style.css";
<LumirEditor />;
```

#### 2. Next.js에서 hydration 오류

```tsx
// ❌ 잘못된 사용
import { LumirEditor } from "@lumir-company/editor";

// ✅ 올바른 사용 - dynamic import 사용
const LumirEditor = dynamic(
  () =>
    import("@lumir-company/editor").then((m) => ({ default: m.LumirEditor })),
  { ssr: false }
);
```

#### 3. 높이가 0으로 표시됨

```tsx
// ❌ 잘못된 사용
<LumirEditor />

// ✅ 올바른 사용 - 부모 요소에 높이 설정
<div className="h-[400px]">
  <LumirEditor />
</div>
```

#### 4. 이미지 업로드 실패

```tsx
// uploadFile 또는 s3Upload 중 하나 반드시 설정
<LumirEditor
  uploadFile={async (file) => {
    // 업로드 로직
    return imageUrl;
  }}
  // 또는
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "development",
    path: "images",
  }}
/>
```

### 성능 최적화 팁

1. **애니메이션 기본 비활성**: 이미 `animations: false`로 설정되어 성능 최적화됨
2. **큰 콘텐츠 처리**: 초기 콘텐츠가 클 경우 lazy loading 고려
3. **이미지 최적화**: 업로드 전 클라이언트에서 이미지 리사이징 권장

---

## 🏗️ 프로젝트 구조

```
@lumir-company/editor/
├── dist/                    # 빌드 출력
│   ├── index.js            # CommonJS 빌드
│   ├── index.mjs           # ESM 빌드
│   ├── index.d.ts          # TypeScript 타입 정의
│   └── style.css           # 스타일시트
├── src/
│   ├── components/
│   │   └── LumirEditor.tsx # 메인 에디터 컴포넌트
│   ├── types/
│   │   ├── editor.ts       # 에디터 타입 정의
│   │   └── index.ts        # 타입 export
│   ├── utils/
│   │   ├── cn.ts           # className 유틸리티
│   │   └── s3-uploader.ts  # S3 업로더
│   ├── index.ts            # 메인 export
│   └── style.css           # 소스 스타일
└── examples/
    └── tailwind-integration.md  # Tailwind 통합 가이드
```

---

## 📄 라이선스

MIT License

---

## 🔗 관련 링크

- [GitHub Repository](https://github.com/lumir-company/editor)
- [npm Package](https://www.npmjs.com/package/@lumir-company/editor)
- [BlockNote Documentation](https://www.blocknotejs.org/)
