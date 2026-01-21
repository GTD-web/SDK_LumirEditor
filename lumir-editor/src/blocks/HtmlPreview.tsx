import { createReactBlockSpec } from "@blocknote/react";
import {
  defaultBlockSpecs,
  BlockNoteSchema,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import { useState, useRef, useCallback, useEffect } from "react";

// HTML 미리보기 블록 속성 타입
export interface HtmlPreviewProps {
  htmlContent: string;
  fileName?: string;
  height?: string;
}

// 최소/최대 높이 상수
/** @internal 테스트용 export */
export const MIN_HEIGHT = 100;
/** @internal 테스트용 export */
export const MAX_HEIGHT = 1200;

// ============================================
// 보안 유틸리티 함수
// ============================================

/**
 * HTML에 charset이 없으면 UTF-8 meta 태그 추가
 * (원본 HTML을 최소한으로만 수정하여 인코딩 깨짐 방지)
 * @internal 테스트용 export
 */
export const ensureCharset = (html: string): string => {
  // 이미 charset이 있으면 원본 그대로 반환
  const hasCharset = /<meta[^>]+charset\s*=/i.test(html);
  if (hasCharset) {
    return html;
  }

  // <head> 태그가 있으면 그 안에 추가
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/(<head[^>]*>)/i, '$1\n<meta charset="UTF-8">');
  }

  // <html> 태그만 있으면 <head> 추가
  if (/<html[^>]*>/i.test(html)) {
    return html.replace(
      /(<html[^>]*>)/i,
      '$1\n<head><meta charset="UTF-8"></head>'
    );
  }

  // HTML fragment인 경우 최소한의 구조 추가
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body>
${html}
</body>
</html>`;
};

/**
 * 파일명 새니타이제이션 (경로 조작 방지)
 * @internal 테스트용 export
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== "string") {
    return `document_${Date.now()}.html`;
  }

  return (
    fileName
      .replace(/\0/g, "") // Null byte 제거
      .replace(/[\/\\]/g, "_") // 경로 구분자 제거
      .replace(/[<>:"|?*\x00-\x1f]/g, "") // 위험한 문자 제거
      .replace(/\.{2,}/g, ".") // 연속된 점 제거
      .trim()
      .replace(/^\.+|\.+$/g, "") || `document_${Date.now()}.html` // 앞뒤 점 제거
  );
};

/**
 * Blob URL 생성 (UTF-8 인코딩 명시)
 * @internal 테스트용 export
 */
export const createSecureBlobUrl = (htmlContent: string): string => {
  const htmlWithCharset = ensureCharset(htmlContent);

  // UTF-8 인코딩 명시
  const blob = new Blob([htmlWithCharset], {
    type: "text/html;charset=utf-8",
  });

  return URL.createObjectURL(blob);
};

// ============================================
// HTML 미리보기 블록 스펙
// ============================================

export const HtmlPreviewBlock = createReactBlockSpec(
  {
    type: "htmlPreview",
    propSchema: {
      htmlContent: {
        default: "",
      },
      fileName: {
        default: "",
      },
      height: {
        default: "400px",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const [isExpanded, setIsExpanded] = useState(true);
      const [isResizing, setIsResizing] = useState(false);
      const [blobUrl, setBlobUrl] = useState<string>("");
      const containerRef = useRef<HTMLDivElement>(null);

      const htmlContent = props.block.props.htmlContent || "";
      const fileName = props.block.props.fileName || "HTML Document";
      const savedHeight = props.block.props.height || "400px";

      // 현재 높이 (숫자로 파싱)
      const currentHeight = parseInt(savedHeight, 10) || 400;

      // UTF-8 인코딩 보장된 Blob URL 생성
      useEffect(() => {
        if (htmlContent) {
          const url = createSecureBlobUrl(htmlContent);
          setBlobUrl(url);

          return () => {
            URL.revokeObjectURL(url);
          };
        }
      }, [htmlContent]);

      // 리사이즈 시작
      const handleResizeStart = useCallback(
        (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsResizing(true);

          const startY = e.clientY;
          const startHeight = currentHeight;

          const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const newHeight = Math.min(
              MAX_HEIGHT,
              Math.max(MIN_HEIGHT, startHeight + deltaY)
            );

            // 블록 props 업데이트 (저장됨)
            props.editor.updateBlock(props.block, {
              props: { height: `${newHeight}px` },
            });
          };

          const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        },
        [currentHeight, props.editor, props.block]
      );

      // HTML 파일 다운로드 (원본 그대로 + 인코딩 보장)
      const handleExport = useCallback(
        (e: React.MouseEvent) => {
          e.stopPropagation();

          // 파일명 새니타이제이션 (경로 조작 방지)
          const safeFileName = sanitizeFileName(fileName);
          const downloadName = safeFileName.endsWith(".html")
            ? safeFileName
            : `${safeFileName}.html`;

          // UTF-8 인코딩 명시
          const htmlWithCharset = ensureCharset(htmlContent);
          const blob = new Blob([htmlWithCharset], {
            type: "text/html;charset=utf-8",
          });

          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = downloadName;
          a.rel = "noopener noreferrer"; // 보안 속성 추가

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },
        [htmlContent, fileName]
      );

      // 새 창에서 열기 (Blob URL 방식 - XSS 방지)
      const handleOpenNewWindow = useCallback(
        (e: React.MouseEvent) => {
          e.stopPropagation();

          // 클라이언트 사이드에서만 실행
          if (typeof window === "undefined") return;

          // Blob URL 생성 (UTF-8 인코딩 보장)
          const url = createSecureBlobUrl(htmlContent);

          // noopener, noreferrer로 보안 강화
          const newWindow = window.open(url, "_blank", "noopener,noreferrer");

          // Blob URL 정리
          if (newWindow) {
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          } else {
            URL.revokeObjectURL(url);
          }
        },
        [htmlContent]
      );

      return (
        <div
          ref={containerRef}
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "#f9f9f9",
            marginBottom: "2px",
            width: "100%",
            userSelect: isResizing ? "none" : "auto",
            outline: "none",
            boxShadow: "none",
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 16px",
              backgroundColor: "#fff",
              borderBottom: isExpanded ? "1px solid #e0e0e0" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                flex: 1,
              }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>

              <span style={{ fontWeight: 500, fontSize: "14px" }}>
                {fileName}
              </span>
            </div>

            {/* 액션 버튼들 */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {/* 새 창에서 열기 버튼 */}
              <button
                onClick={handleOpenNewWindow}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                  borderRadius: "4px",
                }}
                title="새 창에서 열기"
                type="button"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#f0f0f0";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </button>

              {/* 다운로드 버튼 */}
              <button
                onClick={handleExport}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                  borderRadius: "4px",
                }}
                title="HTML 다운로드"
                type="button"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#f0f0f0";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* iframe 미리보기 */}
          {isExpanded && (
            <div
              style={{
                padding: "0",
                backgroundColor: "#fff",
                position: "relative",
              }}
            >
              {/* 🔒 보안 강화: JavaScript 완전 차단 + 부모 페이지 접근 차단 */}
              <iframe
                src={blobUrl || "about:blank"}
                style={{
                  width: "100%",
                  height: `${currentHeight}px`,
                  border: "none",
                  display: "block",
                  pointerEvents: isResizing ? "none" : "auto",
                }}
                // 🔒 allow-scripts 제거 = JavaScript 실행 차단
                // 🔒 allow-same-origin 제거 = 부모 페이지 접근 차단
                // ✅ HTML + CSS만 렌더링 (안전)
                sandbox="allow-popups allow-forms"
                title={fileName}
                referrerPolicy="no-referrer"
                loading="lazy"
              />

              {/* 리사이즈 핸들 */}
              <div
                onMouseDown={handleResizeStart}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "12px",
                  cursor: "ns-resize",
                  backgroundColor: isResizing
                    ? "rgba(59, 130, 246, 0.3)"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "rgba(59, 130, 246, 0.2)";
                }}
                onMouseLeave={(e) => {
                  if (!isResizing) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor =
                      "transparent";
                  }
                }}
              >
                {/* 리사이즈 핸들 아이콘 */}
                <div
                  style={{
                    width: "40px",
                    height: "4px",
                    backgroundColor: "#ccc",
                    borderRadius: "2px",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      );
    },
  }
);

// HTML 미리보기가 포함된 커스텀 스키마 생성
export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    htmlPreview: HtmlPreviewBlock,
  },
  inlineContentSpecs: defaultInlineContentSpecs,
  styleSpecs: defaultStyleSpecs,
});

// 스키마 타입 export
export type HtmlPreviewSchema = typeof schema;
