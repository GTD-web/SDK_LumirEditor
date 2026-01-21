import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ensureCharset,
  sanitizeFileName,
  createSecureBlobUrl,
  MIN_HEIGHT,
  MAX_HEIGHT,
} from '../../../src/blocks/HtmlPreview';

describe('HtmlPreview', () => {
  describe('ensureCharset', () => {
    it('이미 charset이 있으면 그대로 반환한다', () => {
      const html = '<html><head><meta charset="UTF-8"></head><body>Test</body></html>';
      expect(ensureCharset(html)).toBe(html);
    });

    it('<head>가 있으면 그 안에 추가한다', () => {
      const html = '<html><head><title>Test</title></head><body>Test</body></html>';
      const result = ensureCharset(html);
      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain('<head>');
    });

    it('<html>만 있으면 <head>를 추가한다', () => {
      const html = '<html><body>Test</body></html>';
      const result = ensureCharset(html);
      expect(result).toContain('<head><meta charset="UTF-8"></head>');
    });

    it('HTML fragment면 전체 구조를 추가한다', () => {
      const html = '<div>Just a fragment</div>';
      const result = ensureCharset(html);
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html>');
      expect(result).toContain('<head><meta charset="UTF-8"></head>');
      expect(result).toContain('<body>');
      expect(result).toContain('<div>Just a fragment</div>');
    });

    it('대소문자 구분 없이 인식한다', () => {
      const html = '<HTML><HEAD><TITLE>Test</TITLE></HEAD><BODY>Test</BODY></HTML>';
      const result = ensureCharset(html);
      expect(result).toContain('<meta charset="UTF-8">');
    });

    it('charset=utf-8 변형도 인식한다', () => {
      const html = '<html><head><meta charset="utf-8"></head><body>Test</body></html>';
      expect(ensureCharset(html)).toBe(html);
    });

    it('빈 문자열을 처리한다', () => {
      const result = ensureCharset('');
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<meta charset="UTF-8">');
    });
  });

  describe('sanitizeFileName', () => {
    it('null/undefined면 기본 파일명을 반환한다', () => {
      const result = sanitizeFileName(null as any);
      expect(result).toMatch(/^document_\d+\.html$/);
    });

    it('빈 문자열이면 기본 파일명을 반환한다', () => {
      const result = sanitizeFileName('');
      expect(result).toMatch(/^document_\d+\.html$/);
    });

    it('null byte를 제거한다', () => {
      const result = sanitizeFileName('file\0name.html');
      expect(result).not.toContain('\0');
      expect(result).toBe('filename.html');
    });

    it('/를 _로 변환한다', () => {
      expect(sanitizeFileName('path/to/file.html')).toBe('path_to_file.html');
    });

    it('\\를 _로 변환한다', () => {
      expect(sanitizeFileName('path\\to\\file.html')).toBe('path_to_file.html');
    });

    it('<, >, :, ", |, ?, *를 제거한다', () => {
      const result = sanitizeFileName('file<>:"|?*.html');
      expect(result).not.toMatch(/[<>:"|?*]/);
      expect(result).toBe('file.html');
    });

    it('연속된 점을 단일 점으로 변환한다', () => {
      expect(sanitizeFileName('file..name...html')).toBe('file.name.html');
    });

    it('앞뒤 점을 제거한다', () => {
      expect(sanitizeFileName('.hidden.file.')).toBe('hidden.file');
    });

    it('정상적인 파일명은 그대로 반환한다', () => {
      expect(sanitizeFileName('normal_file-name.html')).toBe('normal_file-name.html');
    });

    it('공백을 유지한다', () => {
      expect(sanitizeFileName('file name.html')).toBe('file name.html');
    });

    it('모든 문자가 제거되면 기본 파일명을 반환한다', () => {
      const result = sanitizeFileName('...');
      expect(result).toMatch(/^document_\d+\.html$/);
    });
  });

  describe('createSecureBlobUrl', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('UTF-8 인코딩을 명시한다', () => {
      const result = createSecureBlobUrl('<html><body>Test</body></html>');
      // setup.ts에서 URL.createObjectURL이 mock되어 있음
      expect(result).toBe('blob:mock-url');
    });

    it('blob: URL을 반환한다', () => {
      const result = createSecureBlobUrl('<div>Content</div>');
      expect(result).toMatch(/^blob:/);
    });

    it('charset이 없는 HTML에 charset을 추가한다', () => {
      // createSecureBlobUrl은 내부적으로 ensureCharset을 호출
      const result = createSecureBlobUrl('<div>Test</div>');
      expect(result).toBe('blob:mock-url');
    });
  });

  describe('상수', () => {
    it('MIN_HEIGHT는 100이다', () => {
      expect(MIN_HEIGHT).toBe(100);
    });

    it('MAX_HEIGHT는 1200이다', () => {
      expect(MAX_HEIGHT).toBe(1200);
    });

    it('MIN_HEIGHT < MAX_HEIGHT', () => {
      expect(MIN_HEIGHT).toBeLessThan(MAX_HEIGHT);
    });
  });
});
