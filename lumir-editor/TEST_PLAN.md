# LumirEditor 테스트 계획서

## 1. 개요

### 1.1 테스트 목표
- **100% 코드 커버리지** 달성
- 모든 공개 API에 대한 테스트 보장
- 보안 관련 코드의 철저한 검증

### 1.2 테스트 프레임워크

```bash
# 필수 의존성
npm install -D vitest @vitest/coverage-v8 @vitest/ui
npm install -D @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 1.3 테스트 분류

| 분류 | 설명 | 도구 |
|-----|------|-----|
| **Unit** | 개별 함수/클래스 테스트 | Vitest |
| **Integration** | React 컴포넌트 통합 테스트 | @testing-library/react |
| **E2E** | 엔드투엔드 시나리오 (선택) | Playwright |

---

## 2. 테스트 대상 분석

### 2.1 소스 파일 목록

| 카테고리 | 파일 | LOC | 난이도 | 우선순위 |
|---------|------|-----|-------|---------|
| Utils | `s3-uploader.ts` | 189 | 🟡 중 | P1 |
| Utils | `cn.ts` | 7 | 🟢 쉬움 | P1 |
| Errors | `LumirEditorError.ts` | 134 | 🟢 쉬움 | P1 |
| Constants | `colors.ts` | 55 | 🟢 쉬움 | P1 |
| Constants | `limits.ts` | 32 | 🟢 쉬움 | P1 |
| Components | `LumirEditor.tsx` | 849 | 🔴 어려움 | P2 |
| Blocks | `HtmlPreview.tsx` | 464 | 🔴 어려움 | P2 |
| Components | `FloatingMenu/index.tsx` | 270 | 🔴 어려움 | P3 |
| Components | `FloatingMenu/Icons.tsx` | 222 | 🟢 쉬움 | P2 |
| Types | `types/*.ts` | 118 | ⚪ 제외 | - |
| Entry | `index.ts` | 40 | ⚪ 제외 | - |

---

## 3. Unit Test 계획

### 3.1 `src/utils/cn.ts`

**테스트 파일**: `__tests__/unit/utils/cn.unit.test.ts`

```typescript
describe('cn', () => {
  it('여러 문자열을 공백으로 병합한다')
  it('undefined 값을 필터링한다')
  it('null 값을 필터링한다')
  it('false 값을 필터링한다')
  it('빈 문자열을 필터링한다')
  it('모든 falsy 값을 필터링한다')
  it('인자 없으면 빈 문자열을 반환한다')
  it('공백 포함 클래스명을 처리한다')
})
```

**예상 테스트 수**: 8개

---

### 3.2 `src/errors/LumirEditorError.ts`

**테스트 파일**: `__tests__/unit/errors/LumirEditorError.unit.test.ts`

```typescript
describe('LumirEditorError', () => {
  describe('constructor', () => {
    it('에러 메시지를 설정한다')
    it('에러 코드를 설정한다')
    it('코드 미지정 시 UNKNOWN_ERROR 기본값을 사용한다')
    it('originalError를 저장한다')
    it('context를 저장한다')
    it('instanceof 검증이 동작한다')
  })

  describe('toJSON', () => {
    it('모든 필드를 포함한 JSON을 반환한다')
    it('context 없이도 정상 동작한다')
  })

  describe('getUserMessage', () => {
    it('UPLOAD_FAILED 코드에 대한 메시지를 반환한다')
    it('INVALID_FILE_TYPE 코드에 대한 메시지를 반환한다')
    it('S3_CONFIG_ERROR 코드에 대한 메시지를 반환한다')
    it('PRESIGNED_URL_ERROR 코드에 대한 메시지를 반환한다')
    it('NETWORK_ERROR 코드에 대한 메시지를 반환한다')
    it('EDITOR_ERROR 코드에 대한 메시지를 반환한다')
    it('UNKNOWN_ERROR 코드에 대한 기본 메시지를 반환한다')
  })

  describe('static factories', () => {
    it('fromError - Error를 LumirEditorError로 변환한다')
    it('fromError - 코드 미지정 시 UNKNOWN_ERROR 사용')
    it('uploadFailed - originalError 포함')
    it('uploadFailed - originalError 없음')
    it('invalidFileType - fileName을 context에 포함')
    it('s3ConfigError - 메시지 설정')
    it('networkError - originalError 포함')
    it('networkError - originalError 없음')
  })
})
```

**예상 테스트 수**: 22개

---

### 3.3 `src/utils/s3-uploader.ts`

**테스트 파일**: `__tests__/unit/utils/s3-uploader.unit.test.ts`

```typescript
describe('createS3Uploader', () => {
  describe('필수 파라미터 검증', () => {
    it('apiEndpoint 빈 문자열이면 에러를 던진다')
    it('apiEndpoint 공백만 있으면 에러를 던진다')
    it('env가 undefined면 에러를 던진다')
    it('path 빈 문자열이면 에러를 던진다')
    it('path 공백만 있으면 에러를 던진다')
  })

  describe('파일명 생성', () => {
    it('기본 파일명을 생성한다 (env/path/filename)')
    it('fileNameTransform 콜백을 적용한다')
    it('appendUUID=true면 UUID를 추가한다')
    it('preserveExtension=false면 확장자를 제거한다')
    it('확장자 없는 파일을 처리한다')
  })

  describe('업로드 플로우', () => {
    it('성공적으로 업로드하고 publicUrl을 반환한다')
    it('presigned URL 요청 실패 시 에러를 던진다')
    it('S3 업로드 실패 시 에러를 던진다')
    it('네트워크 에러를 처리한다')
  })

  describe('URL 검증 (SSRF 방지)', () => {
    it('HTTP URL을 거부한다 (presignedUrl)')
    it('HTTP URL을 거부한다 (publicUrl)')
    it('localhost URL을 거부한다')
    it('127.x.x.x IP를 거부한다')
    it('192.168.x.x IP를 거부한다')
    it('10.x.x.x IP를 거부한다')
    it('AWS 메타데이터 서버(169.254.169.254)를 거부한다')
    it('빈 문자열 URL을 거부한다')
    it('유효하지 않은 URL 형식을 거부한다')
  })

  describe('환경별 경로', () => {
    it('production 환경 경로를 생성한다')
    it('development 환경 경로를 생성한다')
  })

  describe('Content-Type', () => {
    it('file.type이 있으면 사용한다')
    it('file.type이 없으면 기본값을 사용한다')
  })
})
```

**예상 테스트 수**: 25개

---

### 3.4 `src/constants/colors.ts`

**테스트 파일**: `__tests__/unit/constants/colors.unit.test.ts`

```typescript
describe('colors', () => {
  describe('TEXT_COLORS', () => {
    it('10개의 색상을 포함한다')
    it('각 항목이 name, value, hex 속성을 가진다')
    it('default 색상이 존재한다')
    it('hex가 올바른 형식이다 (#RRGGBB 또는 투명)')
  })

  describe('BACKGROUND_COLORS', () => {
    it('10개의 색상을 포함한다')
    it('각 항목이 name, value, hex 속성을 가진다')
    it('default 색상이 transparent이다')
  })

  describe('getHexFromColorValue', () => {
    it('텍스트 색상 - red를 #e03e3e로 변환한다')
    it('텍스트 색상 - default를 #3f3f3f로 변환한다')
    it('텍스트 색상 - 존재하지 않는 값은 #000000을 반환한다')
    it('배경 색상 - red를 #fbe4e4로 변환한다')
    it('배경 색상 - default를 transparent로 변환한다')
    it('배경 색상 - 존재하지 않는 값은 transparent를 반환한다')
    it('모든 TEXT_COLORS에 대해 올바른 hex를 반환한다')
    it('모든 BACKGROUND_COLORS에 대해 올바른 hex를 반환한다')
  })
})
```

**예상 테스트 수**: 17개

---

### 3.5 `src/constants/limits.ts`

**테스트 파일**: `__tests__/unit/constants/limits.unit.test.ts`

```typescript
describe('limits', () => {
  describe('MAX_FILE_SIZE', () => {
    it('10MB (10485760)이다')
  })

  describe('UPLOAD_TIMEOUT', () => {
    it('30000ms이다')
  })

  describe('ALLOWED_IMAGE_MIME_TYPES', () => {
    it('Set 타입이다')
    it('image/jpeg를 포함한다')
    it('image/png를 포함한다')
    it('image/gif를 포함한다')
    it('image/webp를 포함한다')
    it('image/bmp를 포함한다')
    it('image/svg+xml을 포함하지 않는다 (보안)')
  })

  describe('BLOCKED_EXTENSIONS', () => {
    it('배열 타입이다')
    it('.svg를 포함한다')
    it('.svgz를 포함한다')
  })

  describe('ALLOWED_IMAGE_EXTENSIONS', () => {
    it('배열 타입이다')
    it('.png, .jpg, .jpeg, .gif, .webp, .bmp를 포함한다')
    it('.svg를 포함하지 않는다')
  })
})
```

**예상 테스트 수**: 16개

---

### 3.6 `src/components/LumirEditor.tsx` - 유틸리티 클래스

**테스트 파일**: `__tests__/unit/components/ContentUtils.unit.test.ts`

```typescript
describe('ContentUtils', () => {
  describe('isValidJSONString', () => {
    it('유효한 JSON 배열이면 true를 반환한다')
    it('유효하지 않은 JSON이면 false를 반환한다')
    it('빈 문자열이면 false를 반환한다')
    it('배열 아닌 JSON 객체면 false를 반환한다')
    it('빈 배열이면 true를 반환한다')
  })

  describe('parseJSONContent', () => {
    it('유효한 JSON 배열을 파싱한다')
    it('파싱 실패 시 null을 반환한다')
    it('배열 아닌 경우 null을 반환한다')
    it('빈 배열을 파싱한다')
  })

  describe('createDefaultBlock', () => {
    it('paragraph 타입을 생성한다')
    it('기본 props를 포함한다')
    it('빈 content 배열을 포함한다')
    it('빈 children 배열을 포함한다')
  })

  describe('validateContent', () => {
    it('빈 문자열이면 기본 블록을 생성한다')
    it('공백 문자열이면 기본 블록을 생성한다')
    it('유효한 JSON 문자열을 파싱한다')
    it('파싱 실패 시 기본 블록을 생성한다')
    it('빈 배열이면 기본 블록을 생성한다')
    it('유효한 배열은 그대로 반환한다')
    it('undefined면 기본 블록을 생성한다')
    it('emptyBlockCount 파라미터를 적용한다')
  })
})
```

**예상 테스트 수**: 17개

---

**테스트 파일**: `__tests__/unit/components/EditorConfig.unit.test.ts`

```typescript
describe('EditorConfig', () => {
  describe('getDefaultTableConfig', () => {
    it('설정 없으면 모든 옵션이 true이다')
    it('일부 설정 시 병합한다')
    it('모든 옵션을 false로 설정할 수 있다')
  })

  describe('getDefaultHeadingConfig', () => {
    it('설정 없으면 [1,2,3,4,5,6]이다')
    it('빈 levels면 기본값을 사용한다')
    it('사용자 설정을 유지한다')
  })

  describe('getDisabledExtensions', () => {
    it('사용자 확장을 병합한다')
    it('allowVideo=false면 video를 추가한다')
    it('allowAudio=false면 audio를 추가한다')
    it('allowFile=false면 file을 추가한다')
    it('모든 허용=true면 사용자 확장만 반환한다')
    it('중복을 제거한다')
  })
})
```

**예상 테스트 수**: 11개

---

### 3.7 내부 함수 테스트 (export 필요)

**테스트 파일**: `__tests__/unit/components/fileValidation.unit.test.ts`

```typescript
describe('isImageFile', () => {
  it('0 바이트 파일을 거부한다')
  it('MAX_FILE_SIZE 초과 파일을 거부한다')
  it('SVG MIME 타입을 거부한다')
  it('.svg 확장자를 거부한다')
  it('.svgz 확장자를 거부한다')
  it('image/jpeg를 허용한다')
  it('image/png를 허용한다')
  it('image/gif를 허용한다')
  it('image/webp를 허용한다')
  it('image/bmp를 허용한다')
  it('MIME 없지만 확장자로 인식한다')
  it('비이미지 MIME을 거부한다')
  it('대소문자 구분 없이 확장자를 인식한다')
})

describe('isHtmlFile', () => {
  it('0 바이트 파일을 거부한다')
  it('text/html MIME을 허용한다')
  it('.html 확장자를 허용한다')
  it('.htm 확장자를 허용한다')
  it('대소문자 구분 없이 인식한다')
  it('비HTML 파일을 거부한다')
})
```

**예상 테스트 수**: 19개

---

**테스트 파일**: `__tests__/unit/components/security.unit.test.ts`

```typescript
describe('escapeHtml', () => {
  it('&를 &amp;로 변환한다')
  it('<를 &lt;로 변환한다')
  it('>를 &gt;로 변환한다')
  it('"를 &quot;로 변환한다')
  it("'를 &#39;로 변환한다")
  it('복합 문자열을 처리한다')
  it('일반 문자열은 그대로 반환한다')
})
```

**예상 테스트 수**: 7개

---

**테스트 파일**: `__tests__/unit/components/imageTracking.unit.test.ts`

```typescript
describe('extractImageUrls', () => {
  it('빈 배열이면 빈 Set을 반환한다')
  it('이미지 블록에서 URL을 추출한다')
  it('중첩된 children에서 URL을 추출한다')
  it('중복 URL을 제거한다')
  it('비이미지 블록을 무시한다')
})

describe('findDeletedImageUrls', () => {
  it('이전에만 있던 URL을 반환한다')
  it('두 Set이 동일하면 빈 배열을 반환한다')
  it('새로 추가된 URL을 무시한다')
})
```

**예상 테스트 수**: 8개

---

### 3.8 `src/blocks/HtmlPreview.tsx` - 유틸리티 함수

**테스트 파일**: `__tests__/unit/blocks/HtmlPreview.unit.test.ts`

```typescript
describe('ensureCharset', () => {
  it('이미 charset이 있으면 그대로 반환한다')
  it('<head>가 있으면 그 안에 추가한다')
  it('<html>만 있으면 <head>를 추가한다')
  it('HTML fragment면 전체 구조를 추가한다')
  it('대소문자 구분 없이 인식한다')
})

describe('sanitizeFileName', () => {
  it('null/undefined면 기본 파일명을 반환한다')
  it('빈 문자열이면 기본 파일명을 반환한다')
  it('null byte를 제거한다')
  it('/를 _로 변환한다')
  it('\\를 _로 변환한다')
  it('<, >, :, ", |, ?, *를 제거한다')
  it('연속된 점을 단일 점으로 변환한다')
  it('앞뒤 점을 제거한다')
})

describe('createSecureBlobUrl', () => {
  it('UTF-8 인코딩을 명시한다')
  it('blob: URL을 반환한다')
})

describe('상수', () => {
  it('MIN_HEIGHT는 100이다')
  it('MAX_HEIGHT는 1200이다')
})
```

**예상 테스트 수**: 17개

---

### 3.9 `src/components/FloatingMenu/Icons.tsx`

**테스트 파일**: `__tests__/unit/components/FloatingMenu/Icons.unit.test.tsx`

```typescript
describe('Icons', () => {
  it('모든 아이콘 키가 존재한다')
  it('각 아이콘이 valid React element이다')
})

describe('BlockTypeIcons', () => {
  it('모든 블록 타입 키가 존재한다')
  it('각 아이콘이 렌더링 가능하다')
})
```

**예상 테스트 수**: 4개

---

## 4. Integration Test 계획

### 4.1 `LumirEditor.integration.test.tsx`

```typescript
describe('LumirEditor Integration', () => {
  describe('초기 렌더링', () => {
    it('에디터가 렌더링된다')
    it('초기 콘텐츠가 표시된다')
    it('빈 콘텐츠로 기본 블록이 생성된다')
    it('JSON 문자열 콘텐츠를 파싱한다')
  })

  describe('에디터 상호작용', () => {
    it('텍스트를 입력할 수 있다')
    it('블록을 추가할 수 있다')
    it('블록을 삭제할 수 있다')
    it('onChange 콜백이 호출된다')
  })

  describe('이미지 업로드', () => {
    it('이미지 파일을 업로드한다')
    it('지원하지 않는 파일을 거부한다')
    it('SVG 파일을 거부한다')
    it('크기 초과 파일을 거부한다')
    it('onError 콜백이 호출된다')
  })

  describe('HTML 드래그앤드롭', () => {
    it('HTML 파일을 드롭하면 HtmlPreview 블록이 생성된다')
    it('비HTML 파일은 무시된다')
  })

  describe('이미지 삭제 추적', () => {
    it('이미지 삭제 시 onImageDelete가 호출된다')
    it('삭제된 이미지 URL을 전달한다')
  })

  describe('에러 처리', () => {
    it('업로드 실패 시 에러 토스트가 표시된다')
    it('onError 콜백에 LumirEditorError가 전달된다')
  })

  describe('설정', () => {
    it('editable=false면 편집 불가능하다')
    it('테이블 설정이 적용된다')
    it('헤딩 설정이 적용된다')
    it('allowVideo/Audio/File 설정이 적용된다')
  })
})
```

**예상 테스트 수**: 22개

---

### 4.2 `FloatingMenu.integration.test.tsx`

```typescript
describe('FloatingMenu Integration', () => {
  describe('렌더링', () => {
    it('FloatingMenu가 렌더링된다')
    it('모든 버튼이 표시된다')
  })

  describe('반응형 레이아웃', () => {
    it('좁은 화면에서 Compact 레이아웃으로 전환된다')
    it('매우 좁은 화면에서 Minimized 레이아웃으로 전환된다')
  })

  describe('버튼 상호작용', () => {
    it('Undo/Redo 버튼이 동작한다')
    it('텍스트 스타일 버튼이 동작한다')
    it('색상 버튼이 동작한다')
    it('정렬 버튼이 동작한다')
    it('리스트 버튼이 동작한다')
    it('링크 버튼이 동작한다')
    it('이미지 버튼이 동작한다')
    it('테이블 버튼이 동작한다')
    it('블록 타입 선택이 동작한다')
  })

  describe('이미지 업로드', () => {
    it('이미지 버튼 클릭 시 파일 선택이 열린다')
    it('이미지 선택 시 onImageUpload가 호출된다')
  })
})
```

**예상 테스트 수**: 15개

---

### 4.3 `HtmlPreviewBlock.integration.test.tsx`

```typescript
describe('HtmlPreviewBlock Integration', () => {
  describe('렌더링', () => {
    it('HtmlPreview 블록이 렌더링된다')
    it('iframe에 HTML 콘텐츠가 표시된다')
    it('파일명이 표시된다')
  })

  describe('리사이즈', () => {
    it('드래그로 높이를 조절할 수 있다')
    it('MIN_HEIGHT 이하로 줄어들지 않는다')
    it('MAX_HEIGHT 이상으로 늘어나지 않는다')
  })

  describe('내보내기', () => {
    it('다운로드 버튼이 동작한다')
    it('새 창 열기 버튼이 동작한다')
  })

  describe('보안', () => {
    it('iframe에 sandbox 속성이 적용된다')
    it('XSS 스크립트가 실행되지 않는다')
  })
})
```

**예상 테스트 수**: 10개

---

## 5. 테스트 디렉토리 구조

```
__tests__/
├── setup.ts                              # 전역 설정
├── mocks/
│   ├── file.ts                           # File mock
│   ├── fetch.ts                          # fetch mock
│   └── blocknote.ts                      # BlockNote mock
├── unit/
│   ├── utils/
│   │   ├── cn.unit.test.ts               # 8 tests
│   │   └── s3-uploader.unit.test.ts      # 25 tests
│   ├── errors/
│   │   └── LumirEditorError.unit.test.ts # 22 tests
│   ├── constants/
│   │   ├── colors.unit.test.ts           # 17 tests
│   │   └── limits.unit.test.ts           # 16 tests
│   ├── components/
│   │   ├── ContentUtils.unit.test.ts     # 17 tests
│   │   ├── EditorConfig.unit.test.ts     # 11 tests
│   │   ├── fileValidation.unit.test.ts   # 19 tests
│   │   ├── security.unit.test.ts         # 7 tests
│   │   ├── imageTracking.unit.test.ts    # 8 tests
│   │   └── FloatingMenu/
│   │       └── Icons.unit.test.tsx       # 4 tests
│   └── blocks/
│       └── HtmlPreview.unit.test.ts      # 17 tests
└── integration/
    ├── LumirEditor.integration.test.tsx  # 22 tests
    ├── FloatingMenu.integration.test.tsx # 15 tests
    └── HtmlPreview.integration.test.tsx  # 10 tests
```

---

## 6. 테스트 요약

### 6.1 Unit Tests

| 파일 | 테스트 수 |
|-----|----------|
| cn.unit.test.ts | 8 |
| s3-uploader.unit.test.ts | 25 |
| LumirEditorError.unit.test.ts | 22 |
| colors.unit.test.ts | 17 |
| limits.unit.test.ts | 16 |
| ContentUtils.unit.test.ts | 17 |
| EditorConfig.unit.test.ts | 11 |
| fileValidation.unit.test.ts | 19 |
| security.unit.test.ts | 7 |
| imageTracking.unit.test.ts | 8 |
| Icons.unit.test.tsx | 4 |
| HtmlPreview.unit.test.ts | 17 |
| **Unit Tests 합계** | **171** |

### 6.2 Integration Tests

| 파일 | 테스트 수 |
|-----|----------|
| LumirEditor.integration.test.tsx | 22 |
| FloatingMenu.integration.test.tsx | 15 |
| HtmlPreview.integration.test.tsx | 10 |
| **Integration Tests 합계** | **47** |

### 6.3 총계

| 분류 | 테스트 수 |
|-----|----------|
| Unit Tests | 171 |
| Integration Tests | 47 |
| **총 테스트 수** | **218** |

---

## 7. 실행 계획

### Phase 1: 환경 설정 및 순수 함수 테스트
1. 테스트 의존성 설치
2. vitest.config.ts 설정
3. __tests__/setup.ts 생성
4. cn, LumirEditorError, colors, limits 테스트 작성

### Phase 2: 유틸리티 함수 테스트
1. s3-uploader 테스트 (fetch mock 필요)
2. ContentUtils, EditorConfig 테스트
3. 내부 함수 export 및 테스트

### Phase 3: React 컴포넌트 통합 테스트
1. BlockNote mock 설정
2. LumirEditor 통합 테스트
3. FloatingMenu 통합 테스트
4. HtmlPreviewBlock 통합 테스트

### Phase 4: 커버리지 검증
1. `npm run test:coverage` 실행
2. 미달 영역 식별 및 테스트 추가
3. 100% 커버리지 달성 확인

---

## 8. 설정 파일

### 8.1 vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './__tests__/setup.ts',
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'examples'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/types/**',
        'src/index.ts',
        'src/components/FloatingMenu/components/index.ts',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
```

### 8.2 __tests__/setup.ts

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// crypto.randomUUID mock
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
});

// URL.createObjectURL / revokeObjectURL mock
const originalURL = globalThis.URL;
vi.stubGlobal('URL', class extends originalURL {
  static createObjectURL = vi.fn(() => 'blob:mock-url');
  static revokeObjectURL = vi.fn();
});

// ResizeObserver mock
vi.stubGlobal('ResizeObserver', class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
});

// matchMedia mock
vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})));
```

### 8.3 package.json scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## 9. 100% 커버리지를 위한 필수 조치

### 9.1 내부 함수 export

```typescript
// src/components/LumirEditor.tsx
/** @internal 테스트용 */
export { isImageFile, isHtmlFile, escapeHtml, extractImageUrls, findDeletedImageUrls };

// src/blocks/HtmlPreview.tsx  
/** @internal 테스트용 */
export { ensureCharset, sanitizeFileName, createSecureBlobUrl, MIN_HEIGHT, MAX_HEIGHT };
```

### 9.2 커버리지 제외 파일

- `src/types/**` - TypeScript 타입 정의만 포함
- `src/index.ts` - re-export만 포함
- `src/components/FloatingMenu/components/index.ts` - re-export만 포함

---

*최종 업데이트: 2025-01-21*
