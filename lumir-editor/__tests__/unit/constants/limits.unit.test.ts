import { describe, it, expect } from 'vitest';
import {
  MAX_FILE_SIZE,
  UPLOAD_TIMEOUT,
  ALLOWED_IMAGE_MIME_TYPES,
  BLOCKED_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS,
} from '../../../src/constants/limits';

describe('limits', () => {
  describe('MAX_FILE_SIZE', () => {
    it('10MB (10485760)이다', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
      expect(MAX_FILE_SIZE).toBe(10485760);
    });
  });

  describe('UPLOAD_TIMEOUT', () => {
    it('30000ms이다', () => {
      expect(UPLOAD_TIMEOUT).toBe(30000);
    });
  });

  describe('ALLOWED_IMAGE_MIME_TYPES', () => {
    it('Set 타입이다', () => {
      expect(ALLOWED_IMAGE_MIME_TYPES).toBeInstanceOf(Set);
    });

    it('image/jpeg를 포함한다', () => {
      expect(ALLOWED_IMAGE_MIME_TYPES.has('image/jpeg')).toBe(true);
    });

    it('image/png를 포함한다', () => {
      expect(ALLOWED_IMAGE_MIME_TYPES.has('image/png')).toBe(true);
    });

    it('image/gif를 포함한다', () => {
      expect(ALLOWED_IMAGE_MIME_TYPES.has('image/gif')).toBe(true);
    });

    it('image/webp를 포함한다', () => {
      expect(ALLOWED_IMAGE_MIME_TYPES.has('image/webp')).toBe(true);
    });

    it('image/bmp를 포함한다', () => {
      expect(ALLOWED_IMAGE_MIME_TYPES.has('image/bmp')).toBe(true);
    });

    it('image/svg+xml을 포함하지 않는다 (보안)', () => {
      expect(ALLOWED_IMAGE_MIME_TYPES.has('image/svg+xml')).toBe(false);
    });

    it('5개의 MIME 타입만 포함한다', () => {
      expect(ALLOWED_IMAGE_MIME_TYPES.size).toBe(5);
    });

    it('비이미지 MIME 타입을 포함하지 않는다', () => {
      expect(ALLOWED_IMAGE_MIME_TYPES.has('text/html')).toBe(false);
      expect(ALLOWED_IMAGE_MIME_TYPES.has('application/pdf')).toBe(false);
      expect(ALLOWED_IMAGE_MIME_TYPES.has('video/mp4')).toBe(false);
    });
  });

  describe('BLOCKED_EXTENSIONS', () => {
    it('배열 타입이다', () => {
      expect(Array.isArray(BLOCKED_EXTENSIONS)).toBe(true);
    });

    it('.svg를 포함한다', () => {
      expect(BLOCKED_EXTENSIONS).toContain('.svg');
    });

    it('.svgz를 포함한다', () => {
      expect(BLOCKED_EXTENSIONS).toContain('.svgz');
    });

    it('2개의 확장자를 포함한다', () => {
      expect(BLOCKED_EXTENSIONS).toHaveLength(2);
    });
  });

  describe('ALLOWED_IMAGE_EXTENSIONS', () => {
    it('배열 타입이다', () => {
      expect(Array.isArray(ALLOWED_IMAGE_EXTENSIONS)).toBe(true);
    });

    it('.png를 포함한다', () => {
      expect(ALLOWED_IMAGE_EXTENSIONS).toContain('.png');
    });

    it('.jpg를 포함한다', () => {
      expect(ALLOWED_IMAGE_EXTENSIONS).toContain('.jpg');
    });

    it('.jpeg를 포함한다', () => {
      expect(ALLOWED_IMAGE_EXTENSIONS).toContain('.jpeg');
    });

    it('.gif를 포함한다', () => {
      expect(ALLOWED_IMAGE_EXTENSIONS).toContain('.gif');
    });

    it('.webp를 포함한다', () => {
      expect(ALLOWED_IMAGE_EXTENSIONS).toContain('.webp');
    });

    it('.bmp를 포함한다', () => {
      expect(ALLOWED_IMAGE_EXTENSIONS).toContain('.bmp');
    });

    it('.svg를 포함하지 않는다', () => {
      expect(ALLOWED_IMAGE_EXTENSIONS).not.toContain('.svg');
    });

    it('.svgz를 포함하지 않는다', () => {
      expect(ALLOWED_IMAGE_EXTENSIONS).not.toContain('.svgz');
    });

    it('6개의 확장자를 포함한다', () => {
      expect(ALLOWED_IMAGE_EXTENSIONS).toHaveLength(6);
    });
  });
});
