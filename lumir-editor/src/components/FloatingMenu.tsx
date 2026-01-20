"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import type { EditorType } from "../types";
import { cn } from "../utils/cn";

// 기본 폰트 목록
const DEFAULT_FONTS = [
  { label: "Noto Sans KR", value: "Noto Sans KR" },
  { label: "Pretendard", value: "Pretendard" },
  { label: "Spoqa Han Sans", value: "Spoqa Han Sans Neo" },
  { label: "Malgun Gothic", value: "Malgun Gothic" },
  { label: "Arial", value: "Arial" },
  { label: "Georgia", value: "Georgia" },
];

// SVG 아이콘 컴포넌트들
const Icons = {
  undo: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
    </svg>
  ),
  redo: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
    </svg>
  ),
  bold: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
    </svg>
  ),
  italic: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
    </svg>
  ),
  underline: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
    </svg>
  ),
  strikethrough: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>
    </svg>
  ),
  alignLeft: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
    </svg>
  ),
  alignCenter: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
    </svg>
  ),
  bulletList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
    </svg>
  ),
  numberedList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
    </svg>
  ),
  expandMore: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
    </svg>
  ),
  add: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  ),
  remove: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M19 13H5v-2h14v2z"/>
    </svg>
  ),
  alignRight: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
    </svg>
  ),
  textColor: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z"/>
    </svg>
  ),
  bgColor: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/>
      <path fillOpacity=".36" d="M0 20h24v4H0z"/>
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
    </svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM10 17H5v-2h5v2zm0-4H5v-2h5v2zm0-4H5V7h5v2zm9 8h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V7h7v2z"/>
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
    </svg>
  ),
  htmlFile: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2v5h5l-5-5zm-4 14H7v-1h2v1zm0-2H7v-1h2v1zm-2-2h2v1H7v-1zm4 4h-2v-1h2v1zm0-2h-2v-1h2v1zm0-2h-2v-1h2v1zm6 4h-4v-1h4v1zm0-2h-4v-1h4v1zm0-2h-4v-1h4v1z"/>
    </svg>
  ),
};

export interface FloatingMenuProps {
  editor: EditorType | any;
  position?: "sticky" | "fixed";
  className?: string;
  onImageUpload?: () => void;
}

// Divider 컴포넌트
const ToolbarDivider: React.FC = () => (
  <div className="lumir-toolbar-divider" />
);

// Undo/Redo 버튼
const UndoRedoButtons: React.FC<{ editor: EditorType | any }> = ({ editor }) => {
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
      <button className="lumir-toolbar-btn" onClick={handleUndo} onMouseDown={handleMouseDown} title="실행 취소" type="button">
        {Icons.undo}
      </button>
      <button className="lumir-toolbar-btn" onClick={handleRedo} onMouseDown={handleMouseDown} title="다시 실행" type="button">
        {Icons.redo}
      </button>
    </div>
  );
};

// Block Type 아이콘
const BlockTypeIcons: Record<string, React.ReactNode> = {
  paragraph: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M5 5h14v2H5zM5 11h14v2H5zM5 17h10v2H5z"/>
    </svg>
  ),
  h1: <span className="lumir-block-icon-text">H1</span>,
  h2: <span className="lumir-block-icon-text">H2</span>,
  h3: <span className="lumir-block-icon-text">H3</span>,
  h4: <span className="lumir-block-icon-text">H4</span>,
  h5: <span className="lumir-block-icon-text">H5</span>,
  h6: <span className="lumir-block-icon-text">H6</span>,
  toggleH1: (
    <span className="lumir-block-icon-toggle">
      <svg viewBox="0 0 24 24" fill="currentColor" width="8" height="8">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <span>H1</span>
    </span>
  ),
  toggleH2: (
    <span className="lumir-block-icon-toggle">
      <svg viewBox="0 0 24 24" fill="currentColor" width="8" height="8">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <span>H2</span>
    </span>
  ),
  toggleH3: (
    <span className="lumir-block-icon-toggle">
      <svg viewBox="0 0 24 24" fill="currentColor" width="8" height="8">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <span>H3</span>
    </span>
  ),
  quote: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
    </svg>
  ),
  codeBlock: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
    </svg>
  ),
  toggleList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M10 6h10v2H10zM10 11h10v2H10zM10 16h10v2H10z"/>
      <path d="M4 8l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  bulletList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <circle cx="4" cy="6" r="1.5"/>
      <circle cx="4" cy="12" r="1.5"/>
      <circle cx="4" cy="18" r="1.5"/>
      <path d="M8 5h12v2H8zM8 11h12v2H8zM8 17h12v2H8z"/>
    </svg>
  ),
  numberedList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
    </svg>
  ),
  checkList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <rect x="3" y="4" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4.5 7l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 6h8v2h-8z"/>
      <rect x="3" y="14" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 16h8v2h-8z"/>
    </svg>
  ),
};

// Block Type 선택 버튼
const BlockTypeSelect: React.FC<{ editor: EditorType | any }> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 블록 타입 정의
  type BlockTypeItem = {
    type: string;
    label: string;
    icon: string;
    level?: number;
    isToggle?: boolean;
  };

  // 카테고리별 블록 타입
  const blockTypeCategories: { category: string; items: BlockTypeItem[] }[] = [
    {
      category: "Headings",
      items: [
        { type: "heading", label: "Heading 1", level: 1, icon: "h1", isToggle: false },
        { type: "heading", label: "Heading 2", level: 2, icon: "h2", isToggle: false },
        { type: "heading", label: "Heading 3", level: 3, icon: "h3", isToggle: false },
        { type: "heading", label: "Toggle Heading 1", level: 1, icon: "toggleH1", isToggle: true },
        { type: "heading", label: "Toggle Heading 2", level: 2, icon: "toggleH2", isToggle: true },
        { type: "heading", label: "Toggle Heading 3", level: 3, icon: "toggleH3", isToggle: true },
      ],
    },
    {
      category: "Basic blocks",
      items: [
        { type: "paragraph", label: "Paragraph", icon: "paragraph" },
        { type: "quote", label: "Quote", icon: "quote" },
        { type: "codeBlock", label: "Code Block", icon: "codeBlock" },
        { type: "bulletListItem", label: "Bullet List", icon: "bulletList" },
        { type: "numberedListItem", label: "Numbered List", icon: "numberedList" },
        { type: "checkListItem", label: "Check List", icon: "checkList" },
        { type: "toggleListItem", label: "Toggle List", icon: "toggleList" },
      ],
    },
  ];

  // 평탄화된 블록 타입 목록 (검색/매칭용)
  const blockTypes: BlockTypeItem[] = blockTypeCategories.flatMap(cat => cat.items);

  // 현재 블록 타입을 직접 계산 (깜빡임 방지)
  const getCurrentBlock = () => {
    try {
      return editor?.getTextCursorPosition()?.block;
    } catch {
      return null;
    }
  };

  const currentBlock = getCurrentBlock();
  const currentType = currentBlock?.type || "paragraph";
  const currentLevel = currentBlock?.props?.level;
  // heading 블록의 isToggleable prop 확인
  const isCurrentToggle = currentType === "heading" && currentBlock?.props?.isToggleable === true;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTypeChange = (type: string, level?: number, isToggle?: boolean) => {
    try {
      const block = editor?.getTextCursorPosition()?.block;
      if (!block || !editor) return;
      
      const props: any = {};
      if (level) props.level = level;
      
      // Heading 타입이고 toggle 설정이 명시된 경우
      if (type === "heading" && isToggle !== undefined) {
        // isToggleable prop 설정
        props.isToggleable = isToggle;
        
        // updateBlock으로 props 업데이트
        editor.updateBlock(block, { 
          type: "heading" as any, 
          props 
        });
      } else {
        // 다른 블록 타입으로 일반 변경
        editor.updateBlock(block, { type: type as any, props });
      }
      
      setIsOpen(false);
    } catch (err) {
      console.error("Block type change failed:", err);
    }
  };

  // 버튼 클릭 시 에디터 포커스/선택 영역 유지
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const getCurrentLabel = () => {
    if (currentType === "heading" && currentLevel) {
      const found = blockTypes.find(
        bt => bt.type === "heading" && bt.level === currentLevel && bt.isToggle === isCurrentToggle
      );
      return found?.label || "Heading";
    }
    const found = blockTypes.find(bt => bt.type === currentType);
    return found?.label || "Paragraph";
  };

  const getCurrentIcon = () => {
    if (currentType === "heading" && currentLevel) {
      const found = blockTypes.find(
        bt => bt.type === "heading" && bt.level === currentLevel && bt.isToggle === isCurrentToggle
      );
      return found?.icon || `h${currentLevel}`;
    }
    const found = blockTypes.find(bt => bt.type === currentType);
    return found?.icon || "paragraph";
  };

  const isActiveItem = (bt: typeof blockTypes[0]) => {
    if (bt.type === "heading" && bt.level) {
      const isLevelMatch = currentType === "heading" && currentLevel === bt.level;
      const isToggleMatch = bt.isToggle === isCurrentToggle;
      return isLevelMatch && isToggleMatch;
    }
    return currentType === bt.type;
  };

  return (
    <div className="lumir-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="lumir-dropdown-btn lumir-block-type-btn"
        onClick={() => setIsOpen(!isOpen)}
        onMouseDown={handleMouseDown}
        type="button"
      >
        <span className="lumir-block-icon">{BlockTypeIcons[getCurrentIcon()]}</span>
        <span className="lumir-block-label">{getCurrentLabel()}</span>
        {Icons.expandMore}
      </button>
      {isOpen && (
        <div className="lumir-dropdown-menu lumir-block-menu">
          {blockTypeCategories.map((category) => (
            <div key={category.category} className="lumir-block-category">
              <div className="lumir-block-category-title">{category.category}</div>
              {category.items.map((bt) => (
                <button
                  key={bt.icon}
                  className={cn("lumir-dropdown-item lumir-block-item", isActiveItem(bt) && "is-active")}
                  onClick={() => handleTypeChange(bt.type, bt.level, bt.isToggle)}
                  onMouseDown={handleMouseDown}
                >
                  <span className="lumir-block-icon">{BlockTypeIcons[bt.icon]}</span>
                  <span className="lumir-block-item-title">{bt.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 폰트 선택 버튼
const FontSelect: React.FC<{
  editor: EditorType | any;
  fonts?: { label: string; value: string }[];
}> = ({ editor, fonts = DEFAULT_FONTS }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFont, setCurrentFont] = useState(fonts[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFontChange = (font: { label: string; value: string }) => {
    setCurrentFont(font);
    setIsOpen(false);
  };

  return (
    <div className="lumir-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="lumir-dropdown-btn lumir-font-btn"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        style={{ fontFamily: currentFont.value }}
      >
        <span>{currentFont.label}</span>
        {Icons.expandMore}
      </button>
      {isOpen && (
        <div className="lumir-dropdown-menu">
          {fonts.map((font) => (
            <button
              key={font.value}
              className={cn("lumir-dropdown-item", currentFont.value === font.value && "is-active")}
              onClick={() => handleFontChange(font)}
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 폰트 사이즈 조절 (+/- 버튼)
const FontSizeControl: React.FC<{ editor: EditorType | any }> = ({ editor }) => {
  const [fontSize, setFontSize] = useState(11);

  const handleDecrease = () => {
    if (fontSize > 8) setFontSize(fontSize - 1);
  };

  const handleIncrease = () => {
    if (fontSize < 72) setFontSize(fontSize + 1);
  };

  return (
    <div className="lumir-fontsize-control">
      <button className="lumir-fontsize-btn" onClick={handleDecrease} type="button" title="글자 크기 줄이기">
        {Icons.remove}
      </button>
      <span className="lumir-fontsize-value">{fontSize}</span>
      <button className="lumir-fontsize-btn" onClick={handleIncrease} type="button" title="글자 크기 늘리기">
        {Icons.add}
      </button>
    </div>
  );
};

// 텍스트 스타일 버튼 - 직접 계산으로 깜빡임 방지
const TextStyleButton: React.FC<{
  editor: EditorType | any;
  style: "bold" | "italic" | "underline" | "strike";
}> = ({ editor, style }) => {
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

  const iconMap: Record<string, React.ReactNode> = {
    bold: Icons.bold,
    italic: Icons.italic,
    underline: Icons.underline,
    strike: Icons.strikethrough,
  };

  const titleMap: Record<string, string> = {
    bold: "굵게",
    italic: "기울임",
    underline: "밑줄",
    strike: "취소선",
  };

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

// 정렬 버튼 - 현재 정렬 상태를 직접 계산하여 깜빡임 방지
const AlignButton: React.FC<{
  editor: EditorType | any;
  alignment: "left" | "center" | "right";
}> = ({ editor, alignment }) => {
  // 현재 정렬 상태를 직접 계산 (상태 대신 직접 계산으로 깜빡임 방지)
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

  const iconMap: Record<string, React.ReactNode> = {
    left: Icons.alignLeft,
    center: Icons.alignCenter,
    right: Icons.alignRight,
  };

  const titleMap: Record<string, string> = {
    left: "왼쪽 정렬",
    center: "가운데 정렬",
    right: "오른쪽 정렬",
  };

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

// 리스트 버튼 - 직접 계산으로 깜빡임 방지
const ListButton: React.FC<{
  editor: EditorType | any;
  type: "bullet" | "numbered";
}> = ({ editor, type }) => {
  // 현재 리스트 상태를 직접 계산
  const getIsActive = (): boolean => {
    try {
      const block = editor?.getTextCursorPosition()?.block;
      const blockType = type === "bullet" ? "bulletListItem" : "numberedListItem";
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
        const targetType = type === "bullet" ? "bulletListItem" : "numberedListItem";
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

  const iconMap: Record<string, React.ReactNode> = {
    bullet: Icons.bulletList,
    numbered: Icons.numberedList,
  };

  const titleMap: Record<string, string> = {
    bullet: "글머리 기호 목록",
    numbered: "번호 목록",
  };

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

// 이미지 업로드 버튼
const ImageButton: React.FC<{
  editor: EditorType | any;
  onImageUpload?: () => void;
}> = ({ editor, onImageUpload }) => {
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
    <button className="lumir-toolbar-btn" onClick={handleClick} onMouseDown={handleMouseDown} title="이미지 삽입" type="button">
      {Icons.image}
    </button>
  );
};

// 색상 버튼 (텍스트/배경)
const ColorButton: React.FC<{
  editor: EditorType | any;
  type: "text" | "background";
}> = ({ editor, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 색상 팔레트 - BlockNote 기본 색상 팔레트와 일치
  const textColors = [
    { name: "기본", value: "default", hex: "#3f3f3f" },
    { name: "회색", value: "gray", hex: "#9b9a97" },
    { name: "갈색", value: "brown", hex: "#64473a" },
    { name: "빨간색", value: "red", hex: "#e03e3e" },
    { name: "주황색", value: "orange", hex: "#d9730d" },
    { name: "노란색", value: "yellow", hex: "#dfab01" },
    { name: "초록색", value: "green", hex: "#4d6461" },
    { name: "파란색", value: "blue", hex: "#0b6e99" },
    { name: "보라색", value: "purple", hex: "#6940a5" },
    { name: "분홍색", value: "pink", hex: "#ad1a72" },
  ];

  const backgroundColors = [
    { name: "기본", value: "default", hex: "transparent" },
    { name: "회색", value: "gray", hex: "#ebeced" },
    { name: "갈색", value: "brown", hex: "#e9e5e3" },
    { name: "빨간색", value: "red", hex: "#fbe4e4" },
    { name: "주황색", value: "orange", hex: "#f6e9d9" },
    { name: "노란색", value: "yellow", hex: "#fbf3db" },
    { name: "초록색", value: "green", hex: "#ddedea" },
    { name: "파란색", value: "blue", hex: "#ddebf1" },
    { name: "보라색", value: "purple", hex: "#eae4f2" },
    { name: "분홍색", value: "pink", hex: "#f4dfeb" },
  ];

  const colors = type === "text" ? textColors : backgroundColors;

  // 현재 색상 감지 - 에디터 상태 변경 시 직접 계산
  // 색상 이름으로 hex 값 찾기
  const getHexFromValue = useCallback((value: string): string => {
    const colorItem = colors.find(c => c.value === value);
    return colorItem?.hex || (type === "text" ? "#000000" : "transparent");
  }, [colors, type]);

  const getCurrentColor = useCallback((): string => {
    try {
      const activeStyles = editor?.getActiveStyles?.() || {};
      if (type === "text" && activeStyles.textColor) {
        return activeStyles.textColor;
      } else if (type === "background" && activeStyles.backgroundColor) {
        return activeStyles.backgroundColor;
      }
    } catch {}
    return "default";
  }, [editor, type]);

  // 드롭다운 열릴 때 현재 색상 업데이트
  useEffect(() => {
    if (isOpen) {
      const color = getCurrentColor();
      setCurrentColor(color);
    }
  }, [isOpen, getCurrentColor]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleColorSelect = useCallback((color: string) => {
    try {
      if (!editor) return;
      
      // BlockNote는 toggleStyles를 통해 색상 적용
      if (type === "text") {
        (editor as any).toggleStyles({ textColor: color });
      } else {
        (editor as any).toggleStyles({ backgroundColor: color });
      }
      setCurrentColor(color);
      setIsOpen(false);
    } catch (err) {
      console.error(`Color apply failed:`, err);
    }
  }, [editor, type]);

  const handleRemoveColor = useCallback(() => {
    try {
      if (!editor) return;
      
      // 기본값으로 설정
      if (type === "text") {
        (editor as any).toggleStyles({ textColor: "default" });
      } else {
        (editor as any).toggleStyles({ backgroundColor: "default" });
      }
      setCurrentColor("default");
      setIsOpen(false);
    } catch (err) {
      console.error(`Color remove failed:`, err);
    }
  }, [editor, type]);

  // 버튼 클릭 시 에디터 포커스/선택 영역 유지
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="lumir-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="lumir-toolbar-btn lumir-color-btn"
        onClick={() => setIsOpen(!isOpen)}
        onMouseDown={handleMouseDown}
        title={type === "text" ? "텍스트 색상" : "배경 색상"}
        type="button"
      >
        {type === "text" ? Icons.textColor : Icons.bgColor}
        <span
          className="lumir-color-indicator"
          style={{ backgroundColor: getHexFromValue(currentColor) }}
        />
      </button>
      {isOpen && (
        <div className="lumir-dropdown-menu lumir-color-menu">
          <div className="lumir-color-grid">
            {colors.map((color) => (
              <button
                key={color.value}
                className={cn("lumir-color-swatch", currentColor === color.value && "is-active")}
                onClick={() => handleColorSelect(color.value)}
                onMouseDown={handleMouseDown}
                title={color.name}
                style={{ backgroundColor: color.hex }}
                type="button"
              />
            ))}
          </div>
          
        </div>
      )}
    </div>
  );
};

// URL 프로토콜 자동 추가 유틸리티
const normalizeUrl = (url: string): string => {
  const trimmedUrl = url.trim();
  
  // 이미 프로토콜이 있는 경우 그대로 반환
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // mailto: 또는 tel: 링크인 경우 그대로 반환
  if (/^(mailto:|tel:)/i.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // 프로토콜이 없는 경우 https:// 추가
  return `https://${trimmedUrl}`;
};

// 링크 버튼
const LinkButton: React.FC<{ editor: EditorType | any }> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setLinkUrl("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 드롭다운 열릴 때 input에 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      if (linkUrl.trim() && editor?.createLink) {
        const normalizedUrl = normalizeUrl(linkUrl);
        editor.createLink(normalizedUrl);
        setIsOpen(false);
        setLinkUrl("");
      }
    } catch (err) {
      console.error("Create link failed:", err);
    }
  }, [editor, linkUrl]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setLinkUrl("");
  }, []);

  // 버튼 클릭 시 에디터 포커스/선택 영역 유지
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }, [handleSubmit, handleCancel]);

  return (
    <div className="lumir-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="lumir-toolbar-btn"
        onClick={() => setIsOpen(!isOpen)}
        onMouseDown={handleMouseDown}
        title="링크 삽입"
        type="button"
      >
        {Icons.link}
      </button>
      {isOpen && (
        <div className="lumir-dropdown-menu lumir-link-menu">
          <form onSubmit={handleSubmit} className="lumir-link-form">
            <input
              ref={inputRef}
              type="text"
              className="lumir-link-input"
              placeholder="링크 URL을 입력하세요"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              onMouseDown={handleMouseDown}
            />
            <div className="lumir-link-actions">
              <button
                type="button"
                className="lumir-link-btn lumir-link-cancel"
                onClick={handleCancel}
                onMouseDown={handleMouseDown}
              >
                취소
              </button>
              <button
                type="submit"
                className="lumir-link-btn lumir-link-submit"
                onMouseDown={handleMouseDown}
                disabled={!linkUrl.trim()}
              >
                확인
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// 테이블 버튼
const TableButton: React.FC<{ editor: EditorType | any }> = ({ editor }) => {
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
    <button className="lumir-toolbar-btn" onClick={handleClick} onMouseDown={handleMouseDown} title="테이블 삽입" type="button">
      {Icons.table}
    </button>
  );
};

// HTML Import 버튼
const HTMLImportButton: React.FC<{ editor: EditorType | any }> = ({ editor }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [editor]);

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

// 반응형 브레이크포인트 (px)
const COMPACT_BREAKPOINT = 700;
const MINIMIZED_BREAKPOINT = 400;

// 메인 FloatingMenu 컴포넌트
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
    const DEBOUNCE_DELAY = 150; // 150ms 디바운스 - 드래그 중 깜빡임 방지

    const handleSelectionChange = () => {
      // 기존 타이머 취소
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      // 디바운스 적용 - 드래그 완료 후에만 상태 업데이트
      debounceTimer = setTimeout(() => {
        setSelectionTick((prev) => prev + 1);
      }, DEBOUNCE_DELAY);
    };

    // editor의 선택 변경 이벤트 구독
    const unsubscribe = editor.onSelectionChange?.(handleSelectionChange);

    // 콘텐츠 변경 시에도 스타일 상태 업데이트 (즉시 반영)
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
      {/* 1단: 실행취소, 텍스트 스타일, 정렬, 리스트 */}
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
      {/* 2단: 블록타입, 색상, 삽입 */}
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
      <div className={cn(
        "lumir-floating-toolbar",
        isCompact && "is-compact",
        isMinimizable && "is-minimizable",
        isMinimized && "is-minimized"
      )}>
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
