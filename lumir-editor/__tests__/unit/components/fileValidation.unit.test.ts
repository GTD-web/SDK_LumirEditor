import { describe, it, expect } from 'vitest';
import { isImageFile, isHtmlFile } from '../../../src/components/LumirEditor';
import { MAX_FILE_SIZE } from '../../../src/constants/limits';

// Mock File 생성 헬퍼
const createMockFile = (
  name: string,
  size: number,
  type: string
): File => {
  const content = new Array(Math.min(size, 100)).fill('a').join('');
  const file = new File([content], name, { type });
  // File의 size를 직접 조작할 수 없으므로 getter를 override
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('isImageFile', () => {
  it('0 바이트 파일을 거부한다', () => {
    const file = createMockFile('test.png', 0, 'image/png');
    expect(isImageFile(file)).toBe(false);
  });

  it('MAX_FILE_SIZE 초과 파일을 거부한다', () => {
    const file = createMockFile('test.png', MAX_FILE_SIZE + 1, 'image/png');
    expect(isImageFile(file)).toBe(false);
  });

  it('SVG MIME 타입을 거부한다', () => {
    const file = createMockFile('test.svg', 1024, 'image/svg+xml');
    expect(isImageFile(file)).toBe(false);
  });

  it('.svg 확장자를 거부한다', () => {
    const file = createMockFile('test.svg', 1024, 'image/png');
    expect(isImageFile(file)).toBe(false);
  });

  it('.svgz 확장자를 거부한다', () => {
    const file = createMockFile('test.svgz', 1024, 'image/png');
    expect(isImageFile(file)).toBe(false);
  });

  it('image/jpeg를 허용한다', () => {
    const file = createMockFile('test.jpg', 1024, 'image/jpeg');
    expect(isImageFile(file)).toBe(true);
  });

  it('image/png를 허용한다', () => {
    const file = createMockFile('test.png', 1024, 'image/png');
    expect(isImageFile(file)).toBe(true);
  });

  it('image/gif를 허용한다', () => {
    const file = createMockFile('test.gif', 1024, 'image/gif');
    expect(isImageFile(file)).toBe(true);
  });

  it('image/webp를 허용한다', () => {
    const file = createMockFile('test.webp', 1024, 'image/webp');
    expect(isImageFile(file)).toBe(true);
  });

  it('image/bmp를 허용한다', () => {
    const file = createMockFile('test.bmp', 1024, 'image/bmp');
    expect(isImageFile(file)).toBe(true);
  });

  it('MIME 없지만 확장자로 인식한다', () => {
    const file = createMockFile('test.png', 1024, '');
    expect(isImageFile(file)).toBe(true);
  });

  it('비이미지 MIME을 거부한다', () => {
    const file = createMockFile('test.txt', 1024, 'text/plain');
    expect(isImageFile(file)).toBe(false);
  });

  it('대소문자 구분 없이 확장자를 인식한다', () => {
    const file = createMockFile('test.PNG', 1024, '');
    expect(isImageFile(file)).toBe(true);
  });

  it('대소문자 SVG 확장자도 거부한다', () => {
    const file = createMockFile('test.SVG', 1024, 'image/png');
    expect(isImageFile(file)).toBe(false);
  });

  it('MAX_FILE_SIZE 경계값 파일을 허용한다', () => {
    const file = createMockFile('test.png', MAX_FILE_SIZE, 'image/png');
    expect(isImageFile(file)).toBe(true);
  });

  it('application/octet-stream MIME과 이미지 확장자 허용', () => {
    const file = createMockFile('test.jpg', 1024, 'application/octet-stream');
    expect(isImageFile(file)).toBe(false);
  });
});

describe('isHtmlFile', () => {
  it('0 바이트 파일을 거부한다', () => {
    const file = createMockFile('test.html', 0, 'text/html');
    expect(isHtmlFile(file)).toBe(false);
  });

  it('text/html MIME을 허용한다', () => {
    const file = createMockFile('test.html', 1024, 'text/html');
    expect(isHtmlFile(file)).toBe(true);
  });

  it('.html 확장자를 허용한다', () => {
    const file = createMockFile('test.html', 1024, '');
    expect(isHtmlFile(file)).toBe(true);
  });

  it('.htm 확장자를 허용한다', () => {
    const file = createMockFile('test.htm', 1024, '');
    expect(isHtmlFile(file)).toBe(true);
  });

  it('대소문자 구분 없이 인식한다', () => {
    const file = createMockFile('test.HTML', 1024, '');
    expect(isHtmlFile(file)).toBe(true);
  });

  it('비HTML 파일을 거부한다', () => {
    const file = createMockFile('test.txt', 1024, 'text/plain');
    expect(isHtmlFile(file)).toBe(false);
  });

  it('.HTM 대소문자 혼합 확장자를 허용한다', () => {
    const file = createMockFile('test.HtM', 1024, '');
    expect(isHtmlFile(file)).toBe(true);
  });

  it('text/html MIME과 다른 확장자도 허용한다', () => {
    const file = createMockFile('data.txt', 1024, 'text/html');
    expect(isHtmlFile(file)).toBe(true);
  });
});
