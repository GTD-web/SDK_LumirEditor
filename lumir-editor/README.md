# LumirEditor

🖼️ **이미지 전용** BlockNote 기반 Rich Text 에디터

[![npm version](https://img.shields.io/npm/v/@lumir-company/editor.svg)](https://www.npmjs.com/package/@lumir-company/editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 이미지 업로드에 최적화된 경량 에디터. S3 업로드, 파일명 커스터마이징, 로딩 스피너 내장.

---

## 📋 목차

- [특징](#-특징)
- [빠른 시작](#-빠른-시작)
- [이미지 업로드](#-이미지-업로드)
  - [S3 업로드 설정](#1-s3-업로드-권장)
  - [파일명 커스터마이징](#-파일명-커스터마이징)
  - [커스텀 업로더](#2-커스텀-업로더)
- [Props API](#-props-api)
- [사용 예제](#-사용-예제)
- [스타일링](#-스타일링)
- [트러블슈팅](#-트러블슈팅)

---

## ✨ 특징

| 특징                       | 설명                                                   |
| -------------------------- | ------------------------------------------------------ |
| 🖼️ **이미지 전용**         | 이미지 업로드/드래그앤드롭만 지원 (비디오/오디오 제거) |
| ☁️ **S3 연동**             | Presigned URL 기반 S3 업로드 내장                      |
| 🏷️ **파일명 커스터마이징** | 업로드 파일명 변경 콜백 + UUID 자동 추가 지원          |
| ⏳ **로딩 스피너**         | 이미지 업로드 중 자동 스피너 표시                      |
| 🚀 **성능 최적화**         | 애니메이션 비활성화로 빠른 렌더링                      |
| 📝 **TypeScript**          | 완전한 타입 안전성                                     |
| 🎨 **테마 지원**           | 라이트/다크 테마 및 커스텀 테마                        |

### 지원 이미지 형식

```
PNG, JPEG/JPG, GIF, WebP, BMP, SVG
```

---

## 🚀 빠른 시작

### 1. 설치

```bash
npm install @lumir-company/editor
# 또는
yarn add @lumir-company/editor
```

**필수 Peer Dependencies:**

- `react` >= 18.0.0
- `react-dom` >= 18.0.0

### 2. 기본 사용

```tsx
import { LumirEditor } from "@lumir-company/editor";
import "@lumir-company/editor/style.css"; // 필수!

export default function App() {
  return (
    <div className="w-full h-[500px]">
      <LumirEditor onContentChange={(blocks) => console.log(blocks)} />
    </div>
  );
}
```

> ⚠️ **중요**: `style.css`를 임포트하지 않으면 에디터가 정상 작동하지 않습니다.

### 3. Next.js에서 사용

```tsx
"use client";

import dynamic from "next/dynamic";
import "@lumir-company/editor/style.css";

// SSR 비활성화 필수
const LumirEditor = dynamic(
  () =>
    import("@lumir-company/editor").then((m) => ({ default: m.LumirEditor })),
  { ssr: false }
);

export default function EditorPage() {
  return (
    <div className="h-[500px]">
      <LumirEditor />
    </div>
  );
}
```

---

## 🖼️ 이미지 업로드

### 1. S3 업로드 (권장)

Presigned URL을 사용한 안전한 S3 업로드 방식입니다.

```tsx
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "production",
    path: "blog/images",
  }}
/>
```

#### S3 파일 저장 경로

```
{env}/{path}/{filename}

예시:
production/blog/images/my-photo.png
```

#### API 엔드포인트 응답 형식

서버는 다음 형식으로 응답해야 합니다:

```json
{
  "presignedUrl": "https://s3.amazonaws.com/bucket/upload-url",
  "publicUrl": "https://cdn.example.com/production/blog/images/my-photo.png"
}
```

---

### 📝 파일명 커스터마이징

여러 이미지를 동시에 업로드할 때 파일명 중복을 방지하고 관리하기 쉽게 만드는 기능입니다.

#### 옵션 1: UUID 자동 추가

```tsx
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "production",
    path: "uploads",
    appendUUID: true, // 파일명 뒤에 UUID 자동 추가
  }}
/>
```

**결과:**

```
원본: photo.png
업로드: photo_550e8400-e29b-41d4-a716-446655440000.png
```

#### 옵션 2: 파일명 변환 콜백

```tsx
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "production",
    path: "uploads",
    fileNameTransform: (originalName, file) => {
      // 예: 사용자 ID 추가
      const userId = getCurrentUserId();
      return `${userId}_${originalName}`;
    },
  }}
/>
```

**결과:**

```
원본: photo.png
업로드: user123_photo.png
```

#### 옵션 3: 조합 사용 (권장)

```tsx
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "production",
    path: "uploads",
    fileNameTransform: (originalName) => `user123_${originalName}`,
    appendUUID: true, // 변환 후 UUID 추가
  }}
/>
```

**결과:**

```
원본: photo.png
1. fileNameTransform 적용: user123_photo.png
2. appendUUID 적용: user123_photo_550e8400-e29b-41d4.png
```

#### 실전 예제: 타임스탬프 + UUID

```tsx
function MyEditor() {
  return (
    <LumirEditor
      s3Upload={{
        apiEndpoint: "/api/s3/presigned",
        env: "production",
        path: "uploads",
        fileNameTransform: (originalName, file) => {
          const timestamp = new Date().toISOString().split("T")[0]; // 2024-01-15
          const ext = originalName.split(".").pop();
          const nameWithoutExt = originalName.replace(`.${ext}`, "");
          return `${timestamp}_${nameWithoutExt}.${ext}`;
        },
        appendUUID: true,
      }}
    />
  );
}
```

**결과:**

```
2024-01-15_photo_550e8400-e29b-41d4.png
```

---

### 2. 커스텀 업로더

자체 업로드 로직을 사용할 때:

```tsx
<LumirEditor
  uploadFile={async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const { url } = await response.json();
    return url; // 업로드된 이미지 URL 반환
  }}
/>
```

### 3. 헬퍼 함수 사용

```tsx
import { createS3Uploader } from "@lumir-company/editor";

const s3Uploader = createS3Uploader({
  apiEndpoint: "/api/s3/presigned",
  env: "production",
  path: "images",
  appendUUID: true,
});

// 에디터에 적용
<LumirEditor uploadFile={s3Uploader} />;

// 또는 별도로 사용
const imageUrl = await s3Uploader(imageFile);
```

### 업로드 우선순위

1. `uploadFile` prop이 있으면 우선 사용
2. `uploadFile` 없고 `s3Upload`가 있으면 S3 업로드 사용
3. 둘 다 없으면 업로드 실패

---

## 📚 Props API

### 핵심 Props

| Prop              | 타입                              | 기본값      | 설명               |
| ----------------- | --------------------------------- | ----------- | ------------------ |
| `s3Upload`        | `S3UploaderConfig`                | `undefined` | S3 업로드 설정     |
| `uploadFile`      | `(file: File) => Promise<string>` | `undefined` | 커스텀 업로드 함수 |
| `onContentChange` | `(blocks) => void`                | `undefined` | 콘텐츠 변경 콜백   |
| `initialContent`  | `Block[] \| string`               | `undefined` | 초기 콘텐츠        |
| `editable`        | `boolean`                         | `true`      | 편집 가능 여부     |
| `theme`           | `"light" \| "dark"`               | `"light"`   | 테마               |
| `className`       | `string`                          | `""`        | CSS 클래스         |

### S3UploaderConfig

```tsx
interface S3UploaderConfig {
  // 필수
  apiEndpoint: string; // Presigned URL API 엔드포인트
  env: "development" | "production";
  path: string; // S3 저장 경로

  // 선택 (파일명 커스터마이징)
  fileNameTransform?: (originalName: string, file: File) => string;
  appendUUID?: boolean; // true: 파일명 뒤에 UUID 추가
}
```

### 전체 Props

<details>
<summary>전체 Props 보기</summary>

```tsx
interface LumirEditorProps {
  // === 에디터 설정 ===
  initialContent?: DefaultPartialBlock[] | string; // 초기 콘텐츠 (블록 배열 또는 JSON 문자열)
  initialEmptyBlocks?: number; // 초기 빈 블록 개수 (기본: 3)
  uploadFile?: (file: File) => Promise<string>; // 커스텀 파일 업로드 함수
  s3Upload?: S3UploaderConfig; // S3 업로드 설정 (apiEndpoint, env, path 등)

  // === 콜백 ===
  onContentChange?: (blocks: DefaultPartialBlock[]) => void; // 콘텐츠 변경 시 호출
  onSelectionChange?: () => void; // 선택 영역 변경 시 호출

  // 기능 설정
  tables?: TableConfig; // 테이블 기능 설정 (splitCells, cellBackgroundColor 등)
  heading?: { levels?: (1 | 2 | 3 | 4 | 5 | 6)[] }; // 헤딩 레벨 설정 (기본: [1,2,3,4,5,6])
  defaultStyles?: boolean; // 기본 스타일 활성화 (기본: true)
  disableExtensions?: string[]; // 비활성화할 확장 기능 목록
  tabBehavior?: "prefer-navigate-ui" | "prefer-indent"; // 탭 키 동작 (기본: "prefer-navigate-ui")
  trailingBlock?: boolean; // 마지막에 빈 블록 자동 추가 (기본: true)

  // === UI 설정 ===
  editable?: boolean; // 편집 가능 여부 (기본: true)
  theme?: "light" | "dark" | ThemeObject; // 에디터 테마 (기본: "light")
  formattingToolbar?: boolean; // 서식 툴바 표시 (기본: true)
  linkToolbar?: boolean; // 링크 툴바 표시 (기본: true)
  sideMenu?: boolean; // 사이드 메뉴 표시 (기본: true)
  sideMenuAddButton?: boolean; // 사이드 메뉴 + 버튼 표시 (기본: false, 드래그 핸들만 표시)
  emojiPicker?: boolean; // 이모지 선택기 표시 (기본: true)
  filePanel?: boolean; // 파일 패널 표시 (기본: true)
  tableHandles?: boolean; // 테이블 핸들 표시 (기본: true)
  className?: string; // 컨테이너 CSS 클래스

  // 미디어 업로드 허용 여부 (기본: 모두 비활성)
  allowVideoUpload?: boolean; // 비디오 업로드 허용 (기본: false)
  allowAudioUpload?: boolean; // 오디오 업로드 허용 (기본: false)
  allowFileUpload?: boolean; // 일반 파일 업로드 허용 (기본: false)
}
```

</details>

---

## 💡 사용 예제

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

### 콘텐츠 저장 및 불러오기

```tsx
import { useState, useEffect } from "react";
import { LumirEditor, ContentUtils } from "@lumir-company/editor";

function EditorWithSave() {
  const [content, setContent] = useState("");

  // 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("content");
    if (saved && ContentUtils.isValidJSONString(saved)) {
      setContent(saved);
    }
  }, []);

  // 저장
  const handleChange = (blocks) => {
    const json = JSON.stringify(blocks);
    localStorage.setItem("content", json);
  };

  return (
    <LumirEditor initialContent={content} onContentChange={handleChange} />
  );
}
```

---

## 🎨 스타일링

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

### 커스텀 스타일

```css
/* globals.css */
.my-editor .bn-editor {
  padding: 20px 30px;
  font-size: 16px;
  line-height: 1.6;
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

## ⚠️ 트러블슈팅

### 필수 체크리스트

- [ ] CSS 임포트: `import "@lumir-company/editor/style.css"`
- [ ] 컨테이너 높이 설정: 부모 요소에 높이 지정 필수
- [ ] Next.js: `dynamic(..., { ssr: false })` 사용
- [ ] React 버전: 18.0.0 이상

### 자주 발생하는 문제

#### 1. 에디터가 보이지 않음

```tsx
// ❌ 잘못됨
<LumirEditor />;

// ✅ 올바름
import "@lumir-company/editor/style.css";
<div className="h-[400px]">
  <LumirEditor />
</div>;
```

#### 2. Next.js Hydration 오류

```tsx
// ❌ 잘못됨
import { LumirEditor } from "@lumir-company/editor";

// ✅ 올바름
const LumirEditor = dynamic(
  () =>
    import("@lumir-company/editor").then((m) => ({ default: m.LumirEditor })),
  { ssr: false }
);
```

#### 3. 이미지 업로드 실패

```tsx
// uploadFile 또는 s3Upload 중 하나는 반드시 설정!
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "development",
    path: "images",
  }}
/>
```

#### 4. 여러 이미지 업로드 시 중복 문제

```tsx
// ✅ 해결: appendUUID 사용
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "production",
    path: "images",
    appendUUID: true, // 고유한 파일명 보장
  }}
/>
```

---

## 🛠️ 유틸리티 API

### ContentUtils

```tsx
import { ContentUtils } from "@lumir-company/editor";

// JSON 검증
ContentUtils.isValidJSONString('[{"type":"paragraph"}]'); // true

// JSON 파싱
const blocks = ContentUtils.parseJSONContent(jsonString);

// 기본 블록 생성
const emptyBlock = ContentUtils.createDefaultBlock();
```

### createS3Uploader

```tsx
import { createS3Uploader } from "@lumir-company/editor";

const uploader = createS3Uploader({
  apiEndpoint: "/api/s3/presigned",
  env: "production",
  path: "uploads",
  appendUUID: true,
});

// 직접 사용
const url = await uploader(imageFile);
```

## 🔗 관련 링크

- [npm Package](https://www.npmjs.com/package/@lumir-company/editor)
- [BlockNote Documentation](https://www.blocknotejs.org/)

---

## 📝 변경 로그

### v0.4.0

- ✨ 파일명 변환 콜백 (`fileNameTransform`) 추가
- ✨ UUID 자동 추가 옵션 (`appendUUID`) 추가
- 🐛 여러 이미지 동시 업로드 시 중복 문제 해결
- 📝 문서 대폭 개선

### v0.3.3

- 🐛 에디터 재생성 방지 최적화
- 📝 타입 정의 개선
