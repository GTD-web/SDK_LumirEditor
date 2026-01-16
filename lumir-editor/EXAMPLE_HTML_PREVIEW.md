# HTML 미리보기 기능 사용 예제

## 개요

LumirEditor에 HTML 파일을 드래그 앤 드롭하여 iframe으로 미리보기하는 기능이 추가되었습니다.

## 주요 기능

1. **드래그 앤 드롭**: HTML 파일을 에디터에 드래그하면 자동으로 미리보기 블록 삽입
2. **슬래시 메뉴**: `/` 입력 후 "HTML Preview" 선택
3. **접기/펼치기**: 헤더 클릭으로 미리보기 영역 토글
4. **안전한 렌더링**: iframe sandbox로 보안 강화

## 테스트 방법

### 1. 테스트용 HTML 파일 생성

다음 내용으로 `test.html` 파일을 만들어보세요:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>테스트 HTML</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 {
            margin-top: 0;
            font-size: 2.5em;
        }
        button {
            background: white;
            color: #667eea;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
        }
        button:hover {
            background: #f0f0f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 HTML 미리보기 테스트</h1>
        <p>이것은 LumirEditor의 HTML 미리보기 기능입니다.</p>
        <ul>
            <li>✅ 드래그 앤 드롭 지원</li>
            <li>✅ iframe 기반 렌더링</li>
            <li>✅ 접기/펼치기 가능</li>
            <li>✅ 안전한 sandbox 처리</li>
        </ul>
        <button onclick="alert('버튼이 작동합니다!')">클릭해보세요</button>
    </div>
    
    <script>
        console.log('HTML 미리보기가 로드되었습니다!');
        
        // 동적 콘텐츠 추가
        setTimeout(() => {
            const p = document.createElement('p');
            p.textContent = '⏰ 2초 후 동적으로 추가된 텍스트';
            p.style.marginTop = '20px';
            p.style.fontWeight = 'bold';
            document.querySelector('.container').appendChild(p);
        }, 2000);
    </script>
</body>
</html>
```

### 2. 에디터에서 테스트

1. 에디터를 실행합니다
2. 위에서 만든 `test.html` 파일을 에디터에 드래그 앤 드롭합니다
3. HTML 미리보기 블록이 자동으로 생성됩니다
4. 헤더를 클릭하여 접기/펼치기를 테스트합니다
5. 버튼을 클릭하여 JavaScript가 작동하는지 확인합니다

### 3. 슬래시 메뉴로 테스트

1. 에디터에서 `/` 입력
2. "HTML Preview" 또는 "html" 입력하여 검색
3. 항목 선택하면 예제 HTML 블록 생성

## 구현 파일

- `src/blocks/HtmlPreview.tsx`: HTML 미리보기 커스텀 블록 정의
- `src/components/LumirEditor.tsx`: 드래그 앤 드롭 핸들러 및 슬래시 메뉴 통합
- `src/index.ts`: HtmlPreview export

## 보안

iframe은 다음 sandbox 속성으로 보호됩니다:
- `allow-scripts`: JavaScript 실행 허용
- `allow-same-origin`: 동일 출처 정책 적용

## 제한사항

- 외부 리소스(CSS, JS, 이미지)의 상대 경로는 작동하지 않을 수 있습니다
- 인라인 스타일과 스크립트를 권장합니다
- 편집 불가능 (순수 미리보기 전용)
