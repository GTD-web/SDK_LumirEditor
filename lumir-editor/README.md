# LumirEditor

**이미지 전용** BlockNote 기반 Rich Text 에디터

[![npm version](https://img.shields.io/npm/v/@lumir-company/editor.svg)](https://www.npmjs.com/package/@lumir-company/editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 이미지 업로드에 최적화된 경량 에디터. S3 업로드, 파일명 커스터마이징, 로딩 스피너 내장.

---

## 목차

- [특징](#특징)
- [빠른 시작](#빠른-시작)
- [이미지 업로드](#이미지-업로드)
  - [S3 업로드 설정](#1-s3-업로드-권장)
  - [파일명 커스터마이징](#파일명-커스터마이징)
  - [커스텀 업로더](#2-커스텀-업로더)
- [Props API](#props-api)
- [사용 예제](#사용-예제)
- [스타일링](#스타일링)
- [트러블슈팅](#트러블슈팅)

---

## 특징

| 특징                    | 설명                                                   |
| ----------------------- | ------------------------------------------------------ |
| **이미지 전용**         | 이미지 업로드/드래그앤드롭만 지원 (비디오/오디오 제거) |
| **S3 연동**             | Presigned URL 기반 S3 업로드 내장                      |
| **파일명 커스터마이징** | 업로드 파일명 변경 콜백 + UUID 자동 추가 지원          |
| **로딩 스피너**         | 이미지 업로드 중 자동 스피너 표시                      |
| **성능 최적화**         | 애니메이션 비활성화로 빠른 렌더링                      |
| **TypeScript**          | 완전한 타입 안전성                                     |
| **테마 지원**           | 라이트/다크 테마 및 커스텀 테마                        |

### 지원 이미지 형식

```
PNG, JPEG/JPG, GIF, WebP, BMP, SVG
```

---

## 빠른 시작

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

> **중요**: `style.css`를 임포트하지 않으면 에디터가 정상 작동하지 않습니다.

### 3. Next.js에서 사용

```tsx
"use client";

import dynamic from "next/dynamic";
import "@lumir-company/editor/style.css";

// SSR 비활성화 필수
const LumirEditor = dynamic(
  () =>
    import("@lumir-company/editor").then((m) => ({ default: m.LumirEditor })),
  { ssr: false },
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

## 이미지 업로드

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

### 파일명 커스터마이징

여러 이미지를 동시에 업로드할 때 파일명 중복을 방지하고 관리하기 쉽게 만드는 기능입니다.

> **참고**: 기본적으로 확장자는 자동으로 붙습니다. `preserveExtension: false`로 설정하면 확장자를 붙이지 않습니다.

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
    fileNameTransform: (nameWithoutExt, file) => {
      // nameWithoutExt는 확장자가 제거된 파일명 (예: "photo")
      // 확장자는 자동으로 붙습니다
      const userId = getCurrentUserId();
      return `${userId}_${nameWithoutExt}`;
    },
  }}
/>
```

**결과:**

```
원본: photo.png
→ nameWithoutExt: "photo"
→ 변환 후: "user123_photo"
→ 최종: user123_photo.png
```

#### 옵션 3: 조합 사용 (권장)

```tsx
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "production",
    path: "uploads",
    fileNameTransform: (nameWithoutExt) => `user123_${nameWithoutExt}`,
    appendUUID: true, // 변환 후 UUID 추가
  }}
/>
```

**결과:**

```
원본: photo.png
→ nameWithoutExt: "photo"
1. fileNameTransform 적용: "user123_photo"
2. appendUUID 적용: "user123_photo_550e8400-e29b-41d4"
3. 확장자 붙이기: user123_photo_550e8400-e29b-41d4.png
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
        fileNameTransform: (nameWithoutExt, file) => {
          // nameWithoutExt는 이미 확장자가 제거됨
          const timestamp = new Date().toISOString().split("T")[0]; // 2024-01-15
          return `${timestamp}_${nameWithoutExt}`;
        },
        appendUUID: true,
      }}
    />
  );
}
```

**결과:**

```
원본: photo.png
→ nameWithoutExt: "photo"
1. fileNameTransform: "2024-01-15_photo"
2. appendUUID: "2024-01-15_photo_550e8400-e29b-41d4"
3. 확장자 붙이기: 2024-01-15_photo_550e8400-e29b-41d4.png
```

#### 옵션 4: 확장자 제거 (preserveExtension: false)

```tsx
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "production",
    path: "uploads",
    fileNameTransform: (nameWithoutExt) => `${nameWithoutExt}_custom`,
    preserveExtension: false, // 확장자 안 붙임
  }}
/>
```

**결과:**

```
원본: photo.png
→ nameWithoutExt: "photo"
→ 변환 후: "photo_custom"
→ 최종: photo_custom (확장자 없음)
```

**사용 사례**: WebP 변환 등 서버에서 확장자를 변경하는 경우

```tsx
fileNameTransform: (nameWithoutExt) => `${nameWithoutExt}.webp`,
preserveExtension: false,
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

## Props API

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
  fileNameTransform?: (nameWithoutExt: string, file: File) => string; // 확장자 제외한 이름 변환
  appendUUID?: boolean; // true: 파일명 뒤에 UUID 추가 (확장자 앞에 삽입)
  preserveExtension?: boolean; // false: 확장자를 붙이지 않음 (기본: true)
}
```

---

## 📋 전체 Props 빠른 참조표

> 💡 **빠른 참조**: 아래 표에서 원하는 prop을 찾고, 상세 내용은 하단의 "📚 전체 Props 상세 매뉴얼"을 참고하세요.

### 🔧 에디터 설정

| Prop                 | 타입                                      | 기본값                 | 설명                                |
| -------------------- | ----------------------------------------- | ---------------------- | ----------------------------------- |
| `initialContent`     | `DefaultPartialBlock[] \| string`         | `undefined`            | 초기 콘텐츠 (블록 배열/JSON/텍스트) |
| `initialEmptyBlocks` | `number`                                  | `3`                    | 빈 콘텐츠일 때 생성할 빈 블록 개수  |
| `defaultStyles`      | `boolean`                                 | `true`                 | BlockNote 기본 스타일 적용 여부     |
| `tabBehavior`        | `"prefer-navigate-ui" \| "prefer-indent"` | `"prefer-navigate-ui"` | Tab 키 동작 (UI 탐색 또는 들여쓰기) |
| `trailingBlock`      | `boolean`                                 | `true`                 | 문서 끝에 빈 블록 자동 추가         |

### 📤 파일 업로드

| Prop                         | 타입                                   | 기본값      | 설명                         |
| ---------------------------- | -------------------------------------- | ----------- | ---------------------------- |
| `uploadFile`                 | `(file: File) => Promise<string>`      | `undefined` | 커스텀 파일 업로드 함수      |
| `s3Upload`                   | `S3UploadConfig`                       | `undefined` | AWS S3 업로드 설정 객체      |
| `s3Upload.apiEndpoint`       | `string`                               | -           | Presigned URL API 엔드포인트 |
| `s3Upload.env`               | `"development" \| "production"`        | -           | 환경 설정                    |
| `s3Upload.path`              | `string`                               | -           | S3 버킷 내 경로              |
| `s3Upload.fileNameTransform` | `(name: string, file: File) => string` | `undefined` | 파일명 변환 함수             |
| `s3Upload.appendUUID`        | `boolean`                              | `false`     | UUID 자동 추가 여부          |
| `s3Upload.preserveExtension` | `boolean`                              | `true`      | 확장자 보존 여부             |
| `allowVideoUpload`           | `boolean`                              | `false`     | 비디오 업로드 허용           |
| `allowAudioUpload`           | `boolean`                              | `false`     | 오디오 업로드 허용           |
| `allowFileUpload`            | `boolean`                              | `false`     | 일반 파일 업로드 허용        |

### 🧩 블록 기능

| Prop                         | 타입                                | 기본값          | 설명                       |
| ---------------------------- | ----------------------------------- | --------------- | -------------------------- |
| `tables`                     | `TableConfig`                       | 모두 `true`     | 테이블 블록 세부 기능 설정 |
| `tables.splitCells`          | `boolean`                           | `true`          | 셀 분할/병합 기능          |
| `tables.cellBackgroundColor` | `boolean`                           | `true`          | 셀 배경색 변경             |
| `tables.cellTextColor`       | `boolean`                           | `true`          | 셀 텍스트 색상 변경        |
| `tables.headers`             | `boolean`                           | `true`          | 헤더 행/열 기능            |
| `heading`                    | `{ levels?: (1\|2\|3\|4\|5\|6)[] }` | `[1,2,3,4,5,6]` | 사용 가능한 헤딩 레벨      |
| `disableExtensions`          | `string[]`                          | `[]`            | 비활성화할 블록 타입 목록  |

**비활성화 가능한 블록 타입**: `"image"`, `"video"`, `"audio"`, `"file"`, `"table"`, `"heading"`, `"numberedList"`, `"bulletList"`, `"checkList"`, `"codeBlock"`

### 🎨 UI 표시 설정

| Prop                | 타입                               | 기본값    | 설명                            |
| ------------------- | ---------------------------------- | --------- | ------------------------------- |
| `editable`          | `boolean`                          | `true`    | 편집 가능 여부                  |
| `theme`             | `"light" \| "dark" \| ThemeObject` | `"light"` | 에디터 테마                     |
| `formattingToolbar` | `boolean`                          | `true`    | 서식 툴바 표시 (텍스트 선택 시) |
| `linkToolbar`       | `boolean`                          | `true`    | 링크 툴바 표시 (링크 클릭 시)   |
| `sideMenu`          | `boolean`                          | `true`    | 사이드 메뉴 표시 (드래그 핸들)  |
| `sideMenuAddButton` | `boolean`                          | `false`   | 사이드 메뉴 + 버튼 표시         |
| `emojiPicker`       | `boolean`                          | `true`    | 이모지 선택기 표시              |
| `filePanel`         | `boolean`                          | `true`    | 파일 패널 표시 (미디어 옵션)    |
| `tableHandles`      | `boolean`                          | `true`    | 테이블 핸들 표시 (행/열 추가)   |
| `className`         | `string`                           | `""`      | 컨테이너 CSS 클래스             |

### 🔔 콜백 함수

| Prop                | 타입                                      | 기본값      | 설명                   |
| ------------------- | ----------------------------------------- | ----------- | ---------------------- |
| `onContentChange`   | `(blocks: DefaultPartialBlock[]) => void` | `undefined` | 콘텐츠 변경 시 호출    |
| `onSelectionChange` | `() => void`                              | `undefined` | 선택 영역 변경 시 호출 |

### 📊 Props 개수 요약

- **총 Props**: 26개
- **에디터 설정**: 5개
- **파일 업로드**: 11개 (s3Upload 하위 포함)
- **블록 기능**: 7개 (tables 하위 포함)
- **UI 설정**: 10개
- **콜백 함수**: 2개

---

### 📚 전체 Props 상세 매뉴얼

<details open>
<summary><strong>Props 전체 목록 보기</strong></summary>

## 1️⃣ 초기 콘텐츠 설정

### `initialContent`

- **타입**: `DefaultPartialBlock[] | string`
- **기본값**: `undefined` (빈 블록 자동 생성)
- **설명**: 에디터의 초기 콘텐츠를 설정합니다.

**사용 가능한 형식**:

1. **블록 배열** (권장)

```tsx
const blocks: DefaultPartialBlock[] = [
  {
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [{ type: "text", text: "안녕하세요!", styles: {} }],
    children: [],
  },
  {
    type: "heading",
    props: { level: 1, textAlignment: "left" },
    content: [{ type: "text", text: "제목", styles: { bold: true } }],
  },
];

<LumirEditor initialContent={blocks} />;
```

2. **JSON 문자열**

```tsx
const jsonContent = JSON.stringify([
  { type: "paragraph", content: [{ type: "text", text: "Hello" }] },
]);

<LumirEditor initialContent={jsonContent} />;
```

3. **단순 텍스트** (자동으로 paragraph 블록 생성)

```tsx
<LumirEditor initialContent="환영합니다!" />
```

---

### `initialEmptyBlocks`

- **타입**: `number`
- **기본값**: `3`
- **설명**: `initialContent`가 없을 때 생성할 빈 블록의 개수

```tsx
// 5개의 빈 블록으로 시작
<LumirEditor initialEmptyBlocks={5} />

// 빈 블록 없이 시작 (첫 입력 시 자동 생성)
<LumirEditor initialEmptyBlocks={0} />
```

---

## 2️⃣ 파일 업로드 설정

### `uploadFile`

- **타입**: `(file: File) => Promise<string>`
- **기본값**: `undefined`
- **설명**: 커스텀 파일 업로드 함수. URL을 반환해야 합니다.

```tsx
const customUpload = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const { url } = await response.json();
  return url; // 업로드된 파일의 공개 URL 반환
};

<LumirEditor uploadFile={customUpload} />;
```

---

### `s3Upload`

- **타입**: `S3UploadConfig`
- **기본값**: `undefined`
- **설명**: AWS S3 업로드 설정

**전체 구조**:

```tsx
interface S3UploadConfig {
  apiEndpoint: string; // Presigned URL API 엔드포인트
  env: "development" | "production"; // 환경 설정
  path: string; // S3 버킷 내 경로
  fileNameTransform?: (
    // 파일명 변환 함수
    nameWithoutExt: string, // 확장자 제외한 파일명
    file: File, // 원본 파일 객체
  ) => string;
  appendUUID?: boolean; // UUID 자동 추가 여부
  preserveExtension?: boolean; // 확장자 보존 여부
}
```

**사용 예시**:

**기본 사용**:

```tsx
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "production",
    path: "uploads/images",
  }}
/>
```

**파일명 커스터마이징**:

```tsx
const [username, setUsername] = useState("user123");

<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "development",
    path: "user-uploads",
    // 파일명 변환: user123_image_abc.png
    fileNameTransform: (nameWithoutExt, file) => {
      return `${username}_${nameWithoutExt}`;
    },
    appendUUID: true, // UUID 추가
    preserveExtension: true, // 확장자 보존
  }}
/>;
```

**파일명 변환 예시**:
| 원본 파일 | fileNameTransform | appendUUID | 최종 파일명 |
|-----------|-------------------|------------|-------------|
| `photo.jpg` | `(name) => "product_" + name` | `false` | `product_photo.jpg` |
| `photo.jpg` | `(name) => "product_" + name` | `true` | `product_photo_abc123.jpg` |
| `photo.jpg` | `(name) => Date.now()` | `true` | `1704012345_xyz789.jpg` |

---

## 3️⃣ 미디어 업로드 허용 설정

### `allowVideoUpload`

- **타입**: `boolean`
- **기본값**: `false`
- **설명**: 비디오 파일 업로드 허용

```tsx
<LumirEditor
  allowVideoUpload={true}
  uploadFile={customUpload} // 또는 s3Upload
/>
```

### `allowAudioUpload`

- **타입**: `boolean`
- **기본값**: `false`
- **설명**: 오디오 파일 업로드 허용

```tsx
<LumirEditor allowAudioUpload={true} uploadFile={customUpload} />
```

### `allowFileUpload`

- **타입**: `boolean`
- **기본값**: `false`
- **설명**: 일반 파일 업로드 허용

```tsx
<LumirEditor allowFileUpload={true} uploadFile={customUpload} />
```

⚠️ **주의**: 이미지는 기본적으로 허용됩니다. 이미지를 비활성화하려면 `disableExtensions={["image"]}`를 사용하세요.

---

## 4️⃣ 블록 기능 설정

### `tables`

- **타입**: `TableConfig`
- **기본값**: 모든 기능 활성화
- **설명**: 테이블 블록의 기능을 세부 제어

```tsx
interface TableConfig {
  splitCells?: boolean; // 셀 분할/병합 기능
  cellBackgroundColor?: boolean; // 셀 배경색 변경
  cellTextColor?: boolean; // 셀 텍스트 색상 변경
  headers?: boolean; // 헤더 행/열 기능
}
```

**사용 예시**:

```tsx
// 모든 테이블 기능 활성화 (기본값)
<LumirEditor
  tables={{
    splitCells: true,
    cellBackgroundColor: true,
    cellTextColor: true,
    headers: true,
  }}
/>

// 간단한 테이블만 허용 (셀 병합 비활성화)
<LumirEditor
  tables={{
    splitCells: false,
    cellBackgroundColor: false,
    cellTextColor: false,
    headers: true,
  }}
/>
```

---

### `heading`

- **타입**: `{ levels?: (1 | 2 | 3 | 4 | 5 | 6)[] }`
- **기본값**: `{ levels: [1, 2, 3, 4, 5, 6] }`
- **설명**: 사용 가능한 헤딩 레벨 설정

```tsx
// H1, H2, H3만 허용
<LumirEditor
  heading={{
    levels: [1, 2, 3]
  }}
/>

// H1만 허용
<LumirEditor
  heading={{
    levels: [1]
  }}
/>
```

---

### `disableExtensions`

- **타입**: `string[]`
- **기본값**: `[]`
- **설명**: 비활성화할 블록 타입 목록

**비활성화 가능한 블록**:

- `"image"` - 이미지 블록
- `"video"` - 비디오 블록
- `"audio"` - 오디오 블록
- `"file"` - 파일 첨부 블록
- `"table"` - 테이블 블록
- `"heading"` - 제목 블록
- `"numberedList"` - 번호 목록
- `"bulletList"` - 글머리 기호 목록
- `"checkList"` - 체크리스트
- `"codeBlock"` - 코드 블록

```tsx
// 이미지와 비디오 비활성화
<LumirEditor
  disableExtensions={["image", "video"]}
/>

// 미디어 파일 전체 비활성화
<LumirEditor
  disableExtensions={["image", "video", "audio", "file"]}
/>

// 텍스트만 허용 (모든 미디어와 테이블 비활성화)
<LumirEditor
  disableExtensions={["image", "video", "audio", "file", "table"]}
/>
```

⚠️ **중요**: `disableExtensions`로 블록을 비활성화하면:

1. 슬래시 메뉴(`/`)에서 해당 항목이 제거됩니다
2. 드래그 앤 드롭으로 추가할 수 없습니다
3. 붙여넣기도 작동하지 않습니다

---

### `defaultStyles`

- **타입**: `boolean`
- **기본값**: `true`
- **설명**: BlockNote 기본 스타일 적용 여부

```tsx
// 기본 스타일 비활성화 (완전한 커스텀 스타일링)
<LumirEditor defaultStyles={false} />
```

---

### `tabBehavior`

- **타입**: `"prefer-navigate-ui" | "prefer-indent"`
- **기본값**: `"prefer-navigate-ui"`
- **설명**: Tab 키 동작 설정

```tsx
// Tab으로 UI 탐색 (기본)
<LumirEditor tabBehavior="prefer-navigate-ui" />

// Tab으로 들여쓰기
<LumirEditor tabBehavior="prefer-indent" />
```

---

### `trailingBlock`

- **타입**: `boolean`
- **기본값**: `true`
- **설명**: 문서 끝에 빈 블록 자동 추가

```tsx
// 마지막 빈 블록 비활성화
<LumirEditor trailingBlock={false} />
```

---

## 5️⃣ UI 설정

### `editable`

- **타입**: `boolean`
- **기본값**: `true`
- **설명**: 편집 가능 여부

```tsx
// 읽기 전용 모드
<LumirEditor editable={false} initialContent={savedContent} />
```

---

### `theme`

- **타입**: `"light" | "dark" | ThemeObject`
- **기본값**: `"light"`
- **설명**: 에디터 테마 설정

**사용 예시**:

```tsx
// 라이트 테마
<LumirEditor theme="light" />

// 다크 테마
<LumirEditor theme="dark" />

// 커스텀 테마 (고급)
<LumirEditor
  theme={{
    light: {
      "--bn-colors-editor-background": "#ffffff",
      "--bn-colors-editor-text": "#000000",
    },
    dark: {
      "--bn-colors-editor-background": "#1a1a1a",
      "--bn-colors-editor-text": "#ffffff",
    },
  }}
/>
```

---

### `formattingToolbar`

- **타입**: `boolean`
- **기본값**: `true`
- **설명**: 서식 툴바 표시 (텍스트 선택 시 나타나는 툴바)

```tsx
<LumirEditor formattingToolbar={false} />
```

---

### `linkToolbar`

- **타입**: `boolean`
- **기본값**: `true`
- **설명**: 링크 툴바 표시 (링크 클릭 시 나타나는 편집 툴바)

```tsx
<LumirEditor linkToolbar={false} />
```

---

### `sideMenu`

- **타입**: `boolean`
- **기본값**: `true`
- **설명**: 사이드 메뉴 표시 (왼쪽의 드래그 핸들)

```tsx
<LumirEditor sideMenu={false} />
```

---

### `sideMenuAddButton`

- **타입**: `boolean`
- **기본값**: `false`
- **설명**: 사이드 메뉴의 + 버튼 표시

```tsx
// + 버튼과 드래그 핸들 모두 표시
<LumirEditor sideMenuAddButton={true} />

// 드래그 핸들만 표시 (기본)
<LumirEditor sideMenuAddButton={false} />
```

---

### `emojiPicker`

- **타입**: `boolean`
- **기본값**: `true`
- **설명**: 이모지 선택기 표시

```tsx
<LumirEditor emojiPicker={false} />
```

---

### `filePanel`

- **타입**: `boolean`
- **기본값**: `true`
- **설명**: 파일 패널 표시 (이미지/비디오 블록의 옵션 패널)

```tsx
<LumirEditor filePanel={false} />
```

---

### `tableHandles`

- **타입**: `boolean`
- **기본값**: `true`
- **설명**: 테이블 핸들 표시 (행/열 추가/삭제 버튼)

```tsx
<LumirEditor tableHandles={false} />
```

---

### `className`

- **타입**: `string`
- **기본값**: `""`
- **설명**: 에디터 컨테이너의 CSS 클래스

```tsx
<LumirEditor className="my-custom-editor border rounded-lg shadow-md" />
```

---

## 6️⃣ 콜백 함수

### `onContentChange`

- **타입**: `(blocks: DefaultPartialBlock[]) => void`
- **기본값**: `undefined`
- **설명**: 콘텐츠가 변경될 때마다 호출됩니다.

```tsx
const [content, setContent] = useState<DefaultPartialBlock[]>([]);

<LumirEditor
  onContentChange={(blocks) => {
    setContent(blocks);

    // 자동 저장
    localStorage.setItem("draft", JSON.stringify(blocks));

    // 서버에 저장
    saveToDB(blocks);
  }}
/>;
```

**blocks 구조 예시**:

```json
[
  {
    "id": "block-1",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "안녕하세요",
        "styles": { "bold": true }
      }
    ],
    "children": []
  }
]
```

---

### `onSelectionChange`

- **타입**: `() => void`
- **기본값**: `undefined`
- **설명**: 텍스트 선택 영역이 변경될 때 호출됩니다.

```tsx
<LumirEditor
  onSelectionChange={() => {
    console.log("선택 영역이 변경되었습니다");
  }}
/>
```

---

## 📊 Props 조합 예시

### 간단한 텍스트 에디터

```tsx
<LumirEditor
  disableExtensions={["image", "video", "audio", "file", "table"]}
  formattingToolbar={true}
  linkToolbar={true}
  onContentChange={handleChange}
/>
```

### 이미지 전용 에디터

```tsx
<LumirEditor
  disableExtensions={["video", "audio", "file", "table", "codeBlock"]}
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "production",
    path: "images",
    appendUUID: true,
  }}
  onContentChange={handleChange}
/>
```

### 읽기 전용 뷰어

```tsx
<LumirEditor
  editable={false}
  initialContent={savedContent}
  formattingToolbar={false}
  sideMenu={false}
  className="viewer-mode"
/>
```

### 풀 기능 에디터

```tsx
<LumirEditor
  initialContent={draft}
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "production",
    path: "documents",
  }}
  allowVideoUpload={true}
  allowAudioUpload={true}
  tables={{
    splitCells: true,
    cellBackgroundColor: true,
    cellTextColor: true,
    headers: true,
  }}
  heading={{ levels: [1, 2, 3] }}
  onContentChange={autoSave}
  className="h-[600px]"
/>
```

</details>

---

## 사용 예제

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

## 스타일링

### Tailwind CSS와 함께 사용

```tsx
import { LumirEditor, cn } from "@lumir-company/editor";

<LumirEditor
  className={cn(
    "min-h-[400px] rounded-xl",
    "border border-gray-200 shadow-lg",
    "focus-within:ring-2 focus-within:ring-blue-500",
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

## 📘 TypeScript 타입 정의 전체

<details>
<summary><strong>전체 인터페이스 보기 (복사/붙여넣기 가능)</strong></summary>

```typescript
import type { DefaultPartialBlock } from "@lumir-company/editor";

// ============================================
// LumirEditor Props 인터페이스
// ============================================

interface LumirEditorProps {
  // ===== 초기 콘텐츠 설정 =====

  /** 초기 콘텐츠 (블록 배열, JSON 문자열, 또는 텍스트) */
  initialContent?: DefaultPartialBlock[] | string;

  /** 빈 콘텐츠일 때 생성할 빈 블록 개수 (기본: 3) */
  initialEmptyBlocks?: number;

  // ===== 파일 업로드 설정 =====

  /** 커스텀 파일 업로드 함수 (URL 반환) */
  uploadFile?: (file: File) => Promise<string>;

  /** AWS S3 업로드 설정 */
  s3Upload?: {
    /** Presigned URL API 엔드포인트 */
    apiEndpoint: string;

    /** 환경 설정 */
    env: "development" | "production";

    /** S3 버킷 내 경로 (예: "uploads/images") */
    path: string;

    /** 파일명 변환 함수 (확장자 제외한 이름 받음) */
    fileNameTransform?: (nameWithoutExt: string, file: File) => string;

    /** UUID 자동 추가 여부 (기본: false) */
    appendUUID?: boolean;

    /** 확장자 보존 여부 (기본: true) */
    preserveExtension?: boolean;
  };

  /** 비디오 업로드 허용 (기본: false) */
  allowVideoUpload?: boolean;

  /** 오디오 업로드 허용 (기본: false) */
  allowAudioUpload?: boolean;

  /** 일반 파일 업로드 허용 (기본: false) */
  allowFileUpload?: boolean;

  // ===== 블록 기능 설정 =====

  /** 테이블 블록 세부 기능 설정 */
  tables?: {
    /** 셀 분할/병합 기능 (기본: true) */
    splitCells?: boolean;

    /** 셀 배경색 변경 (기본: true) */
    cellBackgroundColor?: boolean;

    /** 셀 텍스트 색상 변경 (기본: true) */
    cellTextColor?: boolean;

    /** 헤더 행/열 기능 (기본: true) */
    headers?: boolean;
  };

  /** 사용 가능한 헤딩 레벨 (기본: [1,2,3,4,5,6]) */
  heading?: {
    levels?: (1 | 2 | 3 | 4 | 5 | 6)[];
  };

  /** BlockNote 기본 스타일 적용 여부 (기본: true) */
  defaultStyles?: boolean;

  /** 비활성화할 블록 타입 목록 (예: ["image", "video"]) */
  disableExtensions?: string[];

  /** Tab 키 동작 (기본: "prefer-navigate-ui") */
  tabBehavior?: "prefer-navigate-ui" | "prefer-indent";

  /** 문서 끝에 빈 블록 자동 추가 (기본: true) */
  trailingBlock?: boolean;

  // ===== UI 표시 설정 =====

  /** 편집 가능 여부 (기본: true) */
  editable?: boolean;

  /** 에디터 테마 (기본: "light") */
  theme?:
    | "light"
    | "dark"
    | Partial<Record<string, unknown>>
    | {
        light: Partial<Record<string, unknown>>;
        dark: Partial<Record<string, unknown>>;
      };

  /** 서식 툴바 표시 - 텍스트 선택 시 (기본: true) */
  formattingToolbar?: boolean;

  /** 링크 툴바 표시 - 링크 클릭 시 (기본: true) */
  linkToolbar?: boolean;

  /** 사이드 메뉴 표시 - 드래그 핸들 (기본: true) */
  sideMenu?: boolean;

  /** 사이드 메뉴 + 버튼 표시 (기본: false) */
  sideMenuAddButton?: boolean;

  /** 이모지 선택기 표시 (기본: true) */
  emojiPicker?: boolean;

  /** 파일 패널 표시 - 미디어 옵션 (기본: true) */
  filePanel?: boolean;

  /** 테이블 핸들 표시 - 행/열 추가 (기본: true) */
  tableHandles?: boolean;

  /** 컨테이너 CSS 클래스 */
  className?: string;

  // ===== 콜백 함수 =====

  /** 콘텐츠 변경 시 호출되는 함수 */
  onContentChange?: (blocks: DefaultPartialBlock[]) => void;

  /** 선택 영역 변경 시 호출되는 함수 */
  onSelectionChange?: () => void;
}

// ============================================
// 블록 구조 타입 (참고용)
// ============================================

interface DefaultPartialBlock {
  /** 블록 고유 ID (자동 생성) */
  id?: string;

  /** 블록 타입 */
  type:
    | "paragraph"
    | "heading"
    | "bulletList"
    | "numberedList"
    | "checkList"
    | "table"
    | "image"
    | "video"
    | "audio"
    | "file"
    | "codeBlock";

  /** 블록 속성 */
  props?: {
    textColor?: string;
    backgroundColor?: string;
    textAlignment?: "left" | "center" | "right" | "justify";
    level?: 1 | 2 | 3 | 4 | 5 | 6; // heading용
    [key: string]: any;
  };

  /** 블록 콘텐츠 (텍스트, 링크 등) */
  content?: InlineContent[];

  /** 하위 블록 (중첩 구조) */
  children?: DefaultPartialBlock[];
}

interface InlineContent {
  /** 콘텐츠 타입 */
  type: "text" | "link";

  /** 텍스트 내용 */
  text: string;

  /** 텍스트 스타일 */
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    [key: string]: any;
  };

  /** 링크 URL (type="link"일 때) */
  href?: string;
}

// ============================================
// S3 업로드 설정 타입 (상세)
// ============================================

interface S3UploadConfig {
  /** Presigned URL을 생성하는 API 엔드포인트 */
  apiEndpoint: string;

  /** 환경 설정 (로깅 레벨 등에 영향) */
  env: "development" | "production";

  /** S3 버킷 내 저장 경로 */
  path: string;

  /**
   * 파일명 변환 함수
   * @param nameWithoutExt - 확장자를 제외한 파일명
   * @param file - 원본 File 객체
   * @returns 변환된 파일명 (확장자 제외)
   */
  fileNameTransform?: (
    nameWithoutExt: string,
    file: File
  ) => string;

  /**
   * UUID 자동 추가 여부
   * true일 경우: "filename_abc123.png" 형태로 저장
   */
  appendUUID?: boolean;

  /**
   * 확장자 보존 여부
   * false로 설정하면 확장자가 자동으로 붙지 않음
   */
  preserveExtension?: boolean;
}

// ============================================
// 사용 예시
// ============================================

const Example: React.FC = () => {
  const [content, setContent] = useState<DefaultPartialBlock[]>([]);

  return (
    <LumirEditor
      initialContent={[
        {
          type: "paragraph",
          props: {
            textColor: "default",
            backgroundColor: "default",
            textAlignment: "left",
          },
          content: [
            {
              type: "text",
              text: "안녕하세요!",
              styles: { bold: true },
            },
          ],
        },
      ]}
      s3Upload={{
        apiEndpoint: "/api/s3/presigned",
        env: "production",
        path: "uploads",
        appendUUID: true,
      }}
      onContentChange={setContent}
      className="h-[500px]"
    />
  );
};
```

</details>

---

## 트러블슈팅

### 필수 체크리스트

- [ ] CSS 임포트: `import "@lumir-company/editor/style.css"`
- [ ] 컨테이너 높이 설정: 부모 요소에 높이 지정 필수
- [ ] Next.js: `dynamic(..., { ssr: false })` 사용
- [ ] React 버전: 18.0.0 이상

### 자주 발생하는 문제

#### 1. 에디터가 보이지 않음

```tsx
// 잘못됨
<LumirEditor />;

// 올바름
import "@lumir-company/editor/style.css";
<div className="h-[400px]">
  <LumirEditor />
</div>;
```

#### 2. Next.js Hydration 오류

```tsx
// 잘못됨
import { LumirEditor } from "@lumir-company/editor";

// 올바름
const LumirEditor = dynamic(
  () =>
    import("@lumir-company/editor").then((m) => ({ default: m.LumirEditor })),
  { ssr: false },
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
// 해결: appendUUID 사용
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

## 유틸리티 API

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

## 관련 링크

- [npm Package](https://www.npmjs.com/package/@lumir-company/editor)
- [BlockNote Documentation](https://www.blocknotejs.org/)

---

## 변경 로그

### v0.3.5 (2025-01-12)

**📚 문서화 대폭 개선**

- ✅ **전체 Props 빠른 참조표 추가**
  - 26개 모든 props를 5개 카테고리별 표로 정리
  - 타입, 기본값, 설명을 한눈에 확인 가능
- ✅ **TypeScript 타입 정의 전체 추가**
  - 복사/붙여넣기 가능한 완전한 인터페이스
  - 모든 필드에 주석 설명 포함
  - 사용 예시 코드 포함
- ✅ **Props 상세 매뉴얼 작성**
  - 각 prop마다 타입, 기본값, 상세 설명 제공
  - 실제 사용 가능한 코드 예시 다수 포함
  - 주의사항 및 제약사항 명시
  - Props 조합 예시 4가지 (텍스트 전용, 이미지 전용, 읽기 전용, 풀 기능)

**🐛 버그 수정**

- ✅ **disableExtensions 옵션 수정**
  - 슬래시 메뉴 필터링이 하드코딩되어 있던 문제 해결
  - 이제 `disableExtensions={["image"]}`가 정상 작동
  - 슬래시 메뉴에서 비활성화된 블록 타입이 올바르게 제거됨

**📖 문서 구조**

```
README.md
├─ 빠른 시작
├─ 이미지 업로드
│
├─ 📋 전체 Props 빠른 참조표 ⭐ NEW
│   └─ 5개 카테고리 × 26개 props 표
│
├─ 📚 전체 Props 상세 매뉴얼 ⭐ NEW
│   ├─ 초기 콘텐츠 설정
│   ├─ 파일 업로드 설정
│   ├─ 미디어 업로드 허용
│   ├─ 블록 기능 설정
│   ├─ UI 설정
│   └─ 콜백 함수
│
├─ 📘 TypeScript 타입 정의 전체 ⭐ NEW
│   ├─ LumirEditorProps (완전한 인터페이스)
│   ├─ DefaultPartialBlock (블록 구조)
│   ├─ InlineContent (콘텐츠 구조)
│   └─ S3UploadConfig (상세 타입)
│
└─ 트러블슈팅
```

### v0.4.1

- `preserveExtension` prop 추가 - 확장자 자동 붙이기 제어 (기본: true)
- **중요**: 파일명 변환 시 확장자 위치 수정 (확장자가 항상 맨 뒤에 오도록)
- **Breaking Change**: `fileNameTransform` 파라미터 변경 - 이제 확장자 제외한 파일명만 전달됨
  - 이전: `fileNameTransform: (originalName, file) => ...` → originalName에 확장자 포함
  - 변경: `fileNameTransform: (nameWithoutExt, file) => ...` → nameWithoutExt에 확장자 제외
- 확장자 제거 사용 사례 문서화
- README 예제 및 설명 개선

### v0.4.0

- 파일명 변환 콜백 (`fileNameTransform`) 추가
- UUID 자동 추가 옵션 (`appendUUID`) 추가
- 여러 이미지 동시 업로드 시 중복 문제 해결
- 문서 대폭 개선

### v0.3.3

- 에디터 재생성 방지 최적화
- 타입 정의 개선
