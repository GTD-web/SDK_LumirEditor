"use client";

import React, { useCallback } from "react";
import type { EditorType } from "../../../types";
import { Icons } from "../Icons";

interface UndoRedoButtonsProps {
  editor: EditorType | any;
}

/**
 * 실행 취소 / 다시 실행 버튼 컴포넌트
 */
export const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({ editor }) => {
  const handleUndo = useCallback(() => {
    try {
      editor?.undo?.();
    } catch (err) {
      console.error("Undo failed:", err);
    }
  }, [editor]);

  const handleRedo = useCallback(() => {
    try {
      editor?.redo?.();
    } catch (err) {
      console.error("Redo failed:", err);
    }
  }, [editor]);

  // 버튼 클릭 시 에디터 포커스/선택 영역 유지
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="lumir-toolbar-group">
      <button
        className="lumir-toolbar-btn"
        onClick={handleUndo}
        onMouseDown={handleMouseDown}
        title="실행 취소"
        type="button"
      >
        {Icons.undo}
      </button>
      <button
        className="lumir-toolbar-btn"
        onClick={handleRedo}
        onMouseDown={handleMouseDown}
        title="다시 실행"
        type="button"
      >
        {Icons.redo}
      </button>
    </div>
  );
};
