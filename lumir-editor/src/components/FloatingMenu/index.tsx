"use client";

import React, { useState, useEffect, useRef } from "react";
import type { EditorType } from "../../types";
import { cn } from "../../utils/cn";
import { Icons } from "./Icons";
import {
  ToolbarDivider,
  UndoRedoButtons,
  TextStyleButton,
  AlignButton,
  ListButton,
  ImageButton,
  ColorButton,
  LinkButton,
  TableButton,
  HTMLImportButton,
  BlockTypeSelect,
} from "./components";

// 반응형 브레이크포인트 (px)
const COMPACT_BREAKPOINT = 700;
const MINIMIZED_BREAKPOINT = 400;

export interface FloatingMenuProps {
  editor: EditorType | any;
  position?: "sticky" | "fixed";
  className?: string;
  onImageUpload?: () => void;
}

/**
 * FloatingMenu - 에디터 상단 고정 툴바
 */
export const FloatingMenu: React.FC<FloatingMenuProps> = ({
  editor,
  position = "sticky",
  className,
  onImageUpload,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isMinimizable, setIsMinimizable] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  // 선택 변경 시 리렌더링을 위한 카운터
  const [, setSelectionTick] = useState(0);

  // 선택 변경 감지 - 스타일 버튼 상태 업데이트를 위해 (디바운싱 적용)
  useEffect(() => {
    if (!editor) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const DEBOUNCE_DELAY = 150;

    const handleSelectionChange = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        setSelectionTick((prev) => prev + 1);
      }, DEBOUNCE_DELAY);
    };

    const unsubscribe = editor.onSelectionChange?.(handleSelectionChange);
    const unsubscribeContent = editor.onEditorContentChange?.(() => {
      setSelectionTick((prev) => prev + 1);
    });

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      unsubscribe?.();
      unsubscribeContent?.();
    };
  }, [editor]);

  // 컨테이너 너비 감지
  useEffect(() => {
    const checkWidth = () => {
      if (wrapperRef.current) {
        const width = wrapperRef.current.offsetWidth;
        setIsCompact(width < COMPACT_BREAKPOINT);
        setIsMinimizable(width < MINIMIZED_BREAKPOINT);
      }
    };

    checkWidth();

    const resizeObserver = new ResizeObserver(checkWidth);
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 최소화된 레이아웃 (400px 이하)
  const MinimizedLayout = () => (
    <>
      <button
        className="lumir-toolbar-button lumir-toggle-button"
        onClick={() => setIsMinimized(!isMinimized)}
        onMouseDown={(e) => e.preventDefault()}
        type="button"
        title={isMinimized ? "메뉴 펼치기" : "메뉴 접기"}
      >
        {isMinimized ? Icons.chevronRight : Icons.chevronLeft}
      </button>
      {!isMinimized && (
        <>
          <ToolbarDivider />
          <UndoRedoButtons editor={editor} />
          <ToolbarDivider />
          <div className="lumir-toolbar-group">
            <BlockTypeSelect editor={editor} />
          </div>
          <ToolbarDivider />
          <div className="lumir-toolbar-group">
            <TextStyleButton editor={editor} style="bold" />
            <TextStyleButton editor={editor} style="italic" />
            <TextStyleButton editor={editor} style="underline" />
            <TextStyleButton editor={editor} style="strike" />
          </div>
          <ToolbarDivider />
          <div className="lumir-toolbar-group">
            <AlignButton editor={editor} alignment="left" />
            <AlignButton editor={editor} alignment="center" />
            <AlignButton editor={editor} alignment="right" />
          </div>
          <ToolbarDivider />
          <div className="lumir-toolbar-group">
            <ListButton editor={editor} type="bullet" />
            <ListButton editor={editor} type="numbered" />
          </div>
          <ToolbarDivider />
          <div className="lumir-toolbar-group">
            <ColorButton editor={editor} type="text" />
            <ColorButton editor={editor} type="background" />
          </div>
          <ToolbarDivider />
          <div className="lumir-toolbar-group">
            <ImageButton editor={editor} onImageUpload={onImageUpload} />
            <LinkButton editor={editor} />
            <TableButton editor={editor} />
            <HTMLImportButton editor={editor} />
          </div>
        </>
      )}
    </>
  );

  // 1단 레이아웃
  const SingleRowLayout = () => (
    <>
      <UndoRedoButtons editor={editor} />
      <ToolbarDivider />
      <div className="lumir-toolbar-group">
        <BlockTypeSelect editor={editor} />
      </div>
      <ToolbarDivider />
      <div className="lumir-toolbar-group">
        <TextStyleButton editor={editor} style="bold" />
        <TextStyleButton editor={editor} style="italic" />
        <TextStyleButton editor={editor} style="underline" />
        <TextStyleButton editor={editor} style="strike" />
      </div>
      <ToolbarDivider />
      <div className="lumir-toolbar-group">
        <AlignButton editor={editor} alignment="left" />
        <AlignButton editor={editor} alignment="center" />
        <AlignButton editor={editor} alignment="right" />
      </div>
      <ToolbarDivider />
      <div className="lumir-toolbar-group">
        <ListButton editor={editor} type="bullet" />
        <ListButton editor={editor} type="numbered" />
      </div>
      <ToolbarDivider />
      <div className="lumir-toolbar-group">
        <ColorButton editor={editor} type="text" />
        <ColorButton editor={editor} type="background" />
      </div>
      <ToolbarDivider />
      <div className="lumir-toolbar-group">
        <ImageButton editor={editor} onImageUpload={onImageUpload} />
        <LinkButton editor={editor} />
        <TableButton editor={editor} />
        <HTMLImportButton editor={editor} />
      </div>
    </>
  );

  // 2단 레이아웃
  const TwoRowLayout = () => (
    <>
      <div className="lumir-toolbar-row">
        <UndoRedoButtons editor={editor} />
        <ToolbarDivider />
        <div className="lumir-toolbar-group">
          <TextStyleButton editor={editor} style="bold" />
          <TextStyleButton editor={editor} style="italic" />
          <TextStyleButton editor={editor} style="underline" />
          <TextStyleButton editor={editor} style="strike" />
        </div>
        <ToolbarDivider />
        <div className="lumir-toolbar-group">
          <AlignButton editor={editor} alignment="left" />
          <AlignButton editor={editor} alignment="center" />
          <AlignButton editor={editor} alignment="right" />
        </div>
        <ToolbarDivider />
        <div className="lumir-toolbar-group">
          <ListButton editor={editor} type="bullet" />
          <ListButton editor={editor} type="numbered" />
        </div>
      </div>
      <div className="lumir-toolbar-row">
        <div className="lumir-toolbar-group">
          <BlockTypeSelect editor={editor} />
        </div>
        <ToolbarDivider />
        <div className="lumir-toolbar-group">
          <ColorButton editor={editor} type="text" />
          <ColorButton editor={editor} type="background" />
        </div>
        <ToolbarDivider />
        <div className="lumir-toolbar-group">
          <ImageButton editor={editor} onImageUpload={onImageUpload} />
          <LinkButton editor={editor} />
          <TableButton editor={editor} />
          <HTMLImportButton editor={editor} />
        </div>
      </div>
    </>
  );

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "lumir-floating-toolbar-wrapper",
        isMinimizable && "is-minimizable",
        className
      )}
      data-position={position}
    >
      <div
        className={cn(
          "lumir-floating-toolbar",
          isCompact && "is-compact",
          isMinimizable && "is-minimizable",
          isMinimized && "is-minimized"
        )}
      >
        {isMinimizable ? (
          <MinimizedLayout />
        ) : isCompact ? (
          <TwoRowLayout />
        ) : (
          <SingleRowLayout />
        )}
      </div>
    </div>
  );
};

// 하위 호환성을 위한 default export
export default FloatingMenu;
