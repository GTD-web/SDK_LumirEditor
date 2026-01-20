"use client";

import React, { useCallback } from "react";
import type { EditorType } from "../../../types";
import { Icons } from "../Icons";
import { cn } from "../../../utils/cn";

type Alignment = "left" | "center" | "right";

interface AlignButtonProps {
  editor: EditorType | any;
  alignment: Alignment;
}

const iconMap: Record<Alignment, React.ReactNode> = {
  left: Icons.alignLeft,
  center: Icons.alignCenter,
  right: Icons.alignRight,
};

const titleMap: Record<Alignment, string> = {
  left: "왼쪽 정렬",
  center: "가운데 정렬",
  right: "오른쪽 정렬",
};

/**
 * 텍스트 정렬 버튼 (왼쪽, 가운데, 오른쪽)
 */
export const AlignButton: React.FC<AlignButtonProps> = ({
  editor,
  alignment,
}) => {
  // 현재 정렬 상태를 직접 계산
  const getCurrentAlignment = (): string => {
    try {
      const block = editor?.getTextCursorPosition()?.block;
      return block?.props?.textAlignment || "left";
    } catch {
      return "left";
    }
  };

  const isActive = getCurrentAlignment() === alignment;

  const handleClick = useCallback(() => {
    try {
      const block = editor?.getTextCursorPosition()?.block;
      if (block && editor?.updateBlock) {
        editor.updateBlock(block, { props: { textAlignment: alignment } });
      }
    } catch (err) {
      console.error(`Set alignment ${alignment} failed:`, err);
    }
  }, [editor, alignment]);

  // 버튼 클릭 시 에디터 포커스/선택 영역 유지
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <button
      className={cn("lumir-toolbar-btn", isActive && "is-active")}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      title={titleMap[alignment]}
      type="button"
    >
      {iconMap[alignment]}
    </button>
  );
};
