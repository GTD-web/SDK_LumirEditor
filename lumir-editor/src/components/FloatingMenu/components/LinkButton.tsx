"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { EditorType } from "../../../types";
import { Icons } from "../Icons";

interface LinkButtonProps {
  editor: EditorType | any;
}

/**
 * URL 프로토콜 자동 추가 유틸리티
 */
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

/**
 * 링크 삽입 버튼
 */
export const LinkButton: React.FC<LinkButtonProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
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
    },
    [editor, linkUrl]
  );

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setLinkUrl("");
  }, []);

  // 버튼 클릭 시 에디터 포커스/선택 영역 유지
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSubmit, handleCancel]
  );

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
