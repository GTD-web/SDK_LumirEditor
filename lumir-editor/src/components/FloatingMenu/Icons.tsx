"use client";

import React from "react";

/**
 * FloatingMenu에서 사용하는 SVG 아이콘 컴포넌트들
 */
export const Icons = {
  undo: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
    </svg>
  ),
  redo: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
    </svg>
  ),
  bold: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
    </svg>
  ),
  italic: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
    </svg>
  ),
  underline: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
    </svg>
  ),
  strikethrough: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
    </svg>
  ),
  alignLeft: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
    </svg>
  ),
  alignCenter: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
    </svg>
  ),
  alignRight: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
    </svg>
  ),
  bulletList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
    </svg>
  ),
  numberedList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  ),
  expandMore: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
    </svg>
  ),
  textColor: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z" />
    </svg>
  ),
  bgColor: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z" />
      <path fillOpacity=".36" d="M0 20h24v4H0z" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM10 17H5v-2h5v2zm0-4H5v-2h5v2zm0-4H5V7h5v2zm9 8h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V7h7v2z" />
    </svg>
  ),
  htmlFile: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2v5h5l-5-5zm-4 14H7v-1h2v1zm0-2H7v-1h2v1zm-2-2h2v1H7v-1zm4 4h-2v-1h2v1zm0-2h-2v-1h2v1zm0-2h-2v-1h2v1zm6 4h-4v-1h4v1zm0-2h-4v-1h4v1zm0-2h-4v-1h4v1z" />
    </svg>
  ),
};

/**
 * 블록 타입 아이콘들
 */
export const BlockTypeIcons: Record<string, React.ReactNode> = {
  paragraph: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M5 5h14v2H5zM5 11h14v2H5zM5 17h10v2H5z" />
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
        <path d="M8 5v14l11-7z" />
      </svg>
      <span>H1</span>
    </span>
  ),
  toggleH2: (
    <span className="lumir-block-icon-toggle">
      <svg viewBox="0 0 24 24" fill="currentColor" width="8" height="8">
        <path d="M8 5v14l11-7z" />
      </svg>
      <span>H2</span>
    </span>
  ),
  toggleH3: (
    <span className="lumir-block-icon-toggle">
      <svg viewBox="0 0 24 24" fill="currentColor" width="8" height="8">
        <path d="M8 5v14l11-7z" />
      </svg>
      <span>H3</span>
    </span>
  ),
  quote: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
    </svg>
  ),
  codeBlock: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </svg>
  ),
  toggleList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M10 6h10v2H10zM10 11h10v2H10zM10 16h10v2H10z" />
      <path
        d="M4 8l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bulletList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <circle cx="4" cy="6" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="4" cy="18" r="1.5" />
      <path d="M8 5h12v2H8zM8 11h12v2H8zM8 17h12v2H8z" />
    </svg>
  ),
  numberedList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
    </svg>
  ),
  checkList: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <rect
        x="3"
        y="4"
        width="6"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4.5 7l1.5 1.5 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 6h8v2h-8z" />
      <rect
        x="3"
        y="14"
        width="6"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M12 16h8v2h-8z" />
    </svg>
  ),
};
