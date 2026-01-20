"use client";

import React, { useCallback } from "react";
import type { EditorType } from "../../../types";
import { Icons } from "../Icons";
import { cn } from "../../../utils/cn";

type TextStyle = "bold" | "italic" | "underline" | "strike";

interface TextStyleButtonProps {
  editor: EditorType | any;
  style: TextStyle;
}

const iconMap: Record<TextStyle, React.ReactNode> = {
  bold: Icons.bold,
  italic: Icons.italic,
  underline: Icons.underline,
  strike: Icons.strikethrough,
};

const titleMap: Record<TextStyle, string> = {
  bold: "굵게",
  italic: "기울임",
  underline: "밑줄",
  strike: "취소선",
};

/**
 * 텍스트 스타일 버튼 (굵게, 기울임, 밑줄, 취소선)
 */
export const TextStyleButton: React.FC<TextStyleButtonProps> = ({
  editor,
  style,
}) => {
  // 현재 스타일 상태를 직접 계산
  const getIsActive = (): boolean => {
    try {
      const activeStyles = editor?.getActiveStyles?.() || {};
      return activeStyles[style] === true;
    } catch {
      return false;
    }
  };

  const isActive = getIsActive();

  const handleClick = useCallback(() => {
    try {
      editor?.toggleStyles?.({ [style]: true });
    } catch (err) {
      console.error(`Toggle ${style} failed:`, err);
    }
  }, [editor, style]);

  // 버튼 클릭 시 에디터 포커스/선택 영역 유지
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <button
      className={cn("lumir-toolbar-btn", isActive && "is-active")}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      title={titleMap[style]}
      type="button"
    >
      {iconMap[style]}
    </button>
  );
};
