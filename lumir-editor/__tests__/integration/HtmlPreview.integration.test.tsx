import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ensureCharset,
  sanitizeFileName,
  createSecureBlobUrl,
  MIN_HEIGHT,
  MAX_HEIGHT,
} from '../../src/blocks/HtmlPreview';

describe('HtmlPreview Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ensureCharset 함수', () => {
    it('이미 charset이 있으면 그대로 반환한다', () => {
      const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>Test</body></html>';
      expect(ensureCharset(html)).toBe(html);
    });

    it('charset이 없고 head가 있으면 head에 추가한다', () => {
      const html = '<html><head><title>Test</title></head><body>Content</body></html>';
      const result = ensureCharset(html);
      expect(result).toContain('<meta charset="UTF-8">');
      expect(result.indexOf('<meta charset="UTF-8">')).toBeGreaterThan(result.indexOf('<head>'));
    });

    it('head가 없고 html만 있으면 head를 생성한다', () => {
      const html = '<html><body>Content</body></html>';
      const result = ensureCharset(html);
      expect(result).toContain('<head><meta charset="UTF-8"></head>');
    });

    it('HTML fragment면 완전한 구조를 생성한다', () => {
      const html = '<p>Simple paragraph</p>';
      const result = ensureCharset(html);
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html>');
      expect(result).toContain('<head><meta charset="UTF-8"></head>');
      expect(result).toContain('<body>');
      expect(result).toContain('<p>Simple paragraph</p>');
    });

    it('대소문자를 구분하지 않는다', () => {
      const html = '<HTML><HEAD></HEAD><BODY>Test</BODY></HTML>';
      const result = ensureCharset(html);
      expect(result).toContain('<meta charset="UTF-8">');
    });

    it('빈 문자열도 처리한다', () => {
      const result = ensureCharset('');
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<meta charset="UTF-8">');
    });

    it('복잡한 HTML 구조를 처리한다', () => {
      const html = `
        <html lang="ko">
          <head>
            <title>Complex Page</title>
            <style>body { margin: 0; }</style>
          </head>
          <body>
            <div id="app">
              <h1>Title</h1>
              <p>Content</p>
            </div>
          </body>
        </html>
      `;
      const result = ensureCharset(html);
      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain('<title>Complex Page</title>');
    });
  });

  describe('sanitizeFileName 함수', () => {
    it('정상적인 파일명은 그대로 반환한다', () => {
      expect(sanitizeFileName('document.html')).toBe('document.html');
    });

    it('경로 구분자를 제거한다', () => {
      // .. -> _ 로 변환 후 연속점 축소로 ._ 형태가 됨
      expect(sanitizeFileName('../../../etc/passwd')).toBe('_._._etc_passwd');
      expect(sanitizeFileName('folder\\file.html')).toBe('folder_file.html');
    });

    it('위험한 문자를 제거한다', () => {
      expect(sanitizeFileName('file<script>.html')).toBe('filescript.html');
      expect(sanitizeFileName('file|name.html')).toBe('filename.html');
      expect(sanitizeFileName('file:name.html')).toBe('filename.html');
    });

    it('null byte를 제거한다', () => {
      expect(sanitizeFileName('file\x00.html')).toBe('file.html');
    });

    it('연속된 점을 단일 점으로 변환한다', () => {
      expect(sanitizeFileName('file..name...html')).toBe('file.name.html');
    });

    it('앞뒤 점을 제거한다', () => {
      expect(sanitizeFileName('.hidden.')).toBe('hidden');
      expect(sanitizeFileName('...file...')).toBe('file');
    });

    it('빈 문자열이면 기본 파일명을 반환한다', () => {
      const result = sanitizeFileName('');
      expect(result).toMatch(/^document_\d+\.html$/);
    });

    it('null이면 기본 파일명을 반환한다', () => {
      const result = sanitizeFileName(null as any);
      expect(result).toMatch(/^document_\d+\.html$/);
    });

    it('undefined면 기본 파일명을 반환한다', () => {
      const result = sanitizeFileName(undefined as any);
      expect(result).toMatch(/^document_\d+\.html$/);
    });

    it('공백은 유지한다', () => {
      expect(sanitizeFileName('my file name.html')).toBe('my file name.html');
    });

    it('한글 파일명을 유지한다', () => {
      expect(sanitizeFileName('문서.html')).toBe('문서.html');
    });

    it('모든 문자가 제거되면 기본 파일명을 반환한다', () => {
      const result = sanitizeFileName('<>:"|?*');
      expect(result).toMatch(/^document_\d+\.html$/);
    });
  });

  describe('createSecureBlobUrl 함수', () => {
    it('blob: URL을 반환한다', () => {
      const result = createSecureBlobUrl('<html><body>Test</body></html>');
      expect(result).toMatch(/^blob:/);
    });

    it('빈 HTML도 처리한다', () => {
      const result = createSecureBlobUrl('');
      expect(result).toMatch(/^blob:/);
    });

    it('charset이 없는 HTML에 charset을 추가한다', () => {
      // 내부적으로 ensureCharset을 호출하므로 blob URL만 확인
      const result = createSecureBlobUrl('<div>Content</div>');
      expect(result).toBe('blob:mock-url'); // setup.ts의 mock 값
    });
  });

  describe('상수 값', () => {
    it('MIN_HEIGHT는 100이다', () => {
      expect(MIN_HEIGHT).toBe(100);
    });

    it('MAX_HEIGHT는 1200이다', () => {
      expect(MAX_HEIGHT).toBe(1200);
    });

    it('MIN_HEIGHT < MAX_HEIGHT 관계가 성립한다', () => {
      expect(MIN_HEIGHT).toBeLessThan(MAX_HEIGHT);
    });

    it('높이 상수가 양수이다', () => {
      expect(MIN_HEIGHT).toBeGreaterThan(0);
      expect(MAX_HEIGHT).toBeGreaterThan(0);
    });
  });

  describe('보안 시나리오', () => {
    it('XSS 페이로드를 포함한 HTML을 안전하게 처리한다', () => {
      const maliciousHtml = '<script>alert("xss")</script>';
      const result = ensureCharset(maliciousHtml);
      
      // ensureCharset은 콘텐츠를 수정하지 않고 charset만 추가
      expect(result).toContain(maliciousHtml);
      expect(result).toContain('<meta charset="UTF-8">');
    });

    it('path traversal 공격을 방어한다', () => {
      const maliciousPath = '../../../etc/passwd';
      const result = sanitizeFileName(maliciousPath);
      
      // 경로 구분자가 _ 로 치환되어 경로 조작이 불가능해짐
      expect(result).not.toContain('/');
      expect(result).toBe('_._._etc_passwd');
    });

    it('null byte injection을 방어한다', () => {
      const maliciousName = 'file.html\x00.exe';
      const result = sanitizeFileName(maliciousName);
      
      expect(result).not.toContain('\x00');
      expect(result).toBe('file.html.exe');
    });
  });
});
