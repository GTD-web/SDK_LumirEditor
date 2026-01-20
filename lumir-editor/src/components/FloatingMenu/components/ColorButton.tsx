"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { EditorType } from "../../../types";
import { Icons } from "../Icons";
import { cn } from "../../../utils/cn";
import {
  TEXT_COLORS,
  BACKGROUND_COLORS,
  getHexFromColorValue,
} from "../../../constants/colors";

type ColorType = "text" | "background";

interface ColorButtonProps {
  editor: EditorType | any;
  type: ColorType;
}

/**
 * 색상 선택 버튼 (텍스트/배경 색상)
 */
export const ColorButton: React.FC<ColorButtonProps> = ({ editor, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState("default");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const colors = type === "text" ? TEXT_COLORS : BACKGROUND_COLORS;

  const getCurrentColor = useCallback((): string => {
    try {
      const activeStyles = editor?.getActiveStyles?.() || {};
      if (type === "text" && activeStyles.textColor) {
        return activeStyles.textColor;
      } else if (type === "background" && activeStyles.backgroundColor) {
        return activeStyles.backgroundColor;
      }
    } catch {
      // ignore
    }
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

  const handleColorSelect = useCallback(
    (color: string) => {
      try {
        if (!editor) return;

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
    },
    [editor, type]
  );

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
          style={{
            backgroundColor: getHexFromColorValue(currentColor, type),
          }}
        />
      </button>
      {isOpen && (
        <div className="lumir-dropdown-menu lumir-color-menu">
          <div className="lumir-color-grid">
            {colors.map((color) => (
              <button
                key={color.value}
                className={cn(
                  "lumir-color-swatch",
                  currentColor === color.value && "is-active"
                )}
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
