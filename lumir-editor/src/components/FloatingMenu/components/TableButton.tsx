"use client";

import React, { useCallback } from "react";
import type { EditorType } from "../../../types";
import { Icons } from "../Icons";

interface TableButtonProps {
  editor: EditorType | any;
}

/**
 * 테이블 삽입 버튼
 */
export const TableButton: React.FC<TableButtonProps> = ({ editor }) => {
  const handleClick = useCallback(() => {
    try {
      const block = editor?.getTextCursorPosition()?.block;
      if (!block || !editor?.insertBlocks) return;

      // 3x3 기본 테이블 생성
      const defaultCell = [{ type: "text", text: "", styles: {} }];
      const tableContent = {
        type: "tableContent",
        rows: [
          { cells: [defaultCell, defaultCell, defaultCell] },
          { cells: [defaultCell, defaultCell, defaultCell] },
          { cells: [defaultCell, defaultCell, defaultCell] },
        ],
      };

      editor.insertBlocks(
        [{ type: "table", content: tableContent }] as any,
        block,
        "after"
      );
    } catch (err) {
      console.error("Table insert failed:", err);
    }
  }, [editor]);

  // 버튼 클릭 시 에디터 포커스/선택 영역 유지
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <button
      className="lumir-toolbar-btn"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      title="테이블 삽입"
      type="button"
    >
      {Icons.table}
    </button>
  );
};
