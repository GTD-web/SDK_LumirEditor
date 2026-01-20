"use client";

import React, { useCallback, useRef } from "react";
import type { EditorType } from "../../../types";
import { Icons } from "../Icons";

interface HTMLImportButtonProps {
  editor: EditorType | any;
}

/**
 * HTML 파일 Import 버튼
 */
export const HTMLImportButton: React.FC<HTMLImportButtonProps> = ({
  editor,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;

        try {
          if (!editor || !content.trim()) return;

          const block = editor?.getTextCursorPosition()?.block;
          if (!block || !editor?.insertBlocks) return;

          // htmlPreview 블록 삽입
          editor.insertBlocks(
            [
              {
                type: "htmlPreview",
                props: {
                  htmlContent: content,
                  fileName: file.name,
                  height: "400px",
                },
              } as any,
            ],
            block,
            "after"
          );

          // file input 초기화
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (err) {
          console.error("HTML insert failed:", err);
        }
      };
      reader.readAsText(file);
    },
    [editor]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 버튼 클릭 시 에디터 포커스/선택 영역 유지
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.htm"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <button
        className="lumir-toolbar-btn"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        title="HTML Import"
        type="button"
      >
        {Icons.htmlFile}
      </button>
    </>
  );
};
