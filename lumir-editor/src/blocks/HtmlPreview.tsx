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
const MIN_HEIGHT = 100;
const MAX_HEIGHT = 1200;

// HTML 미리보기 블록 스펙
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

      // HTML 내용을 Blob URL로 변환 (CORS 문제 해결)
      useEffect(() => {
        if (htmlContent) {
          const blob = new Blob([htmlContent], { type: "text/html" });
          const url = URL.createObjectURL(blob);
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

      // HTML 파일 다운로드 (Export)
      const handleExport = useCallback(
        (e: React.MouseEvent) => {
          e.stopPropagation();
          const blob = new Blob([htmlContent], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName.endsWith(".html")
            ? fileName
            : `${fileName}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },
        [htmlContent, fileName]
      );

      // 새 창에서 열기
      const handleOpenNewWindow = useCallback(
        (e: React.MouseEvent) => {
          e.stopPropagation();
          const newWindow = window.open("", "_blank");
          if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
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
              <iframe
                src={blobUrl || "about:blank"}
                style={{
                  width: "100%",
                  height: `${currentHeight}px`,
                  border: "none",
                  display: "block",
                  pointerEvents: isResizing ? "none" : "auto",
                }}
                sandbox="allow-same-origin"
                title={fileName}
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
