"use client";

import React, { useCallback } from "react";
import type { EditorType } from "../../../types";
import { Icons } from "../Icons";
import { cn } from "../../../utils/cn";

type ListType = "bullet" | "numbered";

interface ListButtonProps {
  editor: EditorType | any;
  type: ListType;
}

const iconMap: Record<ListType, React.ReactNode> = {
  bullet: Icons.bulletList,
  numbered: Icons.numberedList,
};

const titleMap: Record<ListType, string> = {
  bullet: "글머리 기호 목록",
  numbered: "번호 목록",
};

/**
 * 리스트 버튼 (글머리 기호, 번호 목록)
 */
export const ListButton: React.FC<ListButtonProps> = ({ editor, type }) => {
  // 현재 리스트 상태를 직접 계산
  const getIsActive = (): boolean => {
    try {
      const block = editor?.getTextCursorPosition()?.block;
      const blockType =
        type === "bullet" ? "bulletListItem" : "numberedListItem";
      return block?.type === blockType;
    } catch {
      return false;
    }
  };

  const isActive = getIsActive();

  const handleClick = useCallback(() => {
    try {
      const block = editor?.getTextCursorPosition()?.block;
      if (block && editor?.updateBlock) {
        const targetType =
          type === "bullet" ? "bulletListItem" : "numberedListItem";
        const newType = block.type === targetType ? "paragraph" : targetType;
        editor.updateBlock(block, { type: newType as any });
      }
    } catch (err) {
      console.error(`List toggle failed:`, err);
    }
  }, [editor, type]);

  // 버튼 클릭 시 에디터 포커스/선택 영역 유지
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <button
      className={cn("lumir-toolbar-btn", isActive && "is-active")}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      title={titleMap[type]}
      type="button"
    >
      {iconMap[type]}
    </button>
  );
};
