"use client";

import React, { useCallback } from "react";
import type { EditorType } from "../../../types";
import { Icons } from "../Icons";

interface ImageButtonProps {
  editor: EditorType | any;
  onImageUpload?: () => void;
}

/**
 * 이미지 업로드 버튼
 */
export const ImageButton: React.FC<ImageButtonProps> = ({
  editor,
  onImageUpload,
}) => {
  const handleClick = useCallback(() => {
    if (onImageUpload) {
      onImageUpload();
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file && editor?.uploadFile) {
          try {
            const url = await editor.uploadFile(file);
            editor.insertBlocks(
              [{ type: "image", props: { url: url as string } }] as any,
              editor.getTextCursorPosition().block,
              "after"
            );
          } catch (err) {
            console.error("Image upload failed:", err);
          }
        }
      };
      input.click();
    }
  }, [editor, onImageUpload]);

  // 버튼 클릭 시 에디터 포커스/선택 영역 유지
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <button
      className="lumir-toolbar-btn"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      title="이미지 삽입"
      type="button"
    >
      {Icons.image}
    </button>
  );
};
