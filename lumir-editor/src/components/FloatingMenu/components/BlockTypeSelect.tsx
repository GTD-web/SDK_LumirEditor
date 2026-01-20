"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { EditorType } from "../../../types";
import { Icons, BlockTypeIcons } from "../Icons";
import { cn } from "../../../utils/cn";

interface BlockTypeSelectProps {
  editor: EditorType | any;
}

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

// 평탄화된 블록 타입 목록
const blockTypes: BlockTypeItem[] = blockTypeCategories.flatMap(
  (cat) => cat.items
);

/**
 * 블록 타입 선택 드롭다운
 */
export const BlockTypeSelect: React.FC<BlockTypeSelectProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 현재 블록 타입을 직접 계산
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
  const isCurrentToggle =
    currentType === "heading" && currentBlock?.props?.isToggleable === true;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTypeChange = (
    type: string,
    level?: number,
    isToggle?: boolean
  ) => {
    try {
      const block = editor?.getTextCursorPosition()?.block;
      if (!block || !editor) return;

      const props: any = {};
      if (level) props.level = level;

      if (type === "heading" && isToggle !== undefined) {
        props.isToggleable = isToggle;
        editor.updateBlock(block, {
          type: "heading" as any,
          props,
        });
      } else {
        editor.updateBlock(block, { type: type as any, props });
      }

      setIsOpen(false);
    } catch (err) {
      console.error("Block type change failed:", err);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const getCurrentLabel = () => {
    if (currentType === "heading" && currentLevel) {
      const found = blockTypes.find(
        (bt) =>
          bt.type === "heading" &&
          bt.level === currentLevel &&
          bt.isToggle === isCurrentToggle
      );
      return found?.label || "Heading";
    }
    const found = blockTypes.find((bt) => bt.type === currentType);
    return found?.label || "Paragraph";
  };

  const getCurrentIcon = () => {
    if (currentType === "heading" && currentLevel) {
      const found = blockTypes.find(
        (bt) =>
          bt.type === "heading" &&
          bt.level === currentLevel &&
          bt.isToggle === isCurrentToggle
      );
      return found?.icon || `h${currentLevel}`;
    }
    const found = blockTypes.find((bt) => bt.type === currentType);
    return found?.icon || "paragraph";
  };

  const isActiveItem = (bt: BlockTypeItem) => {
    if (bt.type === "heading" && bt.level) {
      const isLevelMatch =
        currentType === "heading" && currentLevel === bt.level;
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
        <span className="lumir-block-icon">
          {BlockTypeIcons[getCurrentIcon()]}
        </span>
        <span className="lumir-block-label">{getCurrentLabel()}</span>
        {Icons.expandMore}
      </button>
      {isOpen && (
        <div className="lumir-dropdown-menu lumir-block-menu">
          {blockTypeCategories.map((category) => (
            <div key={category.category} className="lumir-block-category">
              <div className="lumir-block-category-title">
                {category.category}
              </div>
              {category.items.map((bt) => (
                <button
                  key={bt.icon}
                  className={cn(
                    "lumir-dropdown-item lumir-block-item",
                    isActiveItem(bt) && "is-active"
                  )}
                  onClick={() => handleTypeChange(bt.type, bt.level, bt.isToggle)}
                  onMouseDown={handleMouseDown}
                >
                  <span className="lumir-block-icon">
                    {BlockTypeIcons[bt.icon]}
                  </span>
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
