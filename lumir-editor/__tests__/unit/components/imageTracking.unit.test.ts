import { describe, it, expect } from 'vitest';
import { extractImageUrls, findDeletedImageUrls } from '../../../src/components/LumirEditor';

describe('extractImageUrls', () => {
  it('빈 배열이면 빈 Set을 반환한다', () => {
    const result = extractImageUrls([]);
    expect(result.size).toBe(0);
  });

  it('이미지 블록에서 URL을 추출한다', () => {
    const blocks = [
      {
        type: 'image' as const,
        props: { url: 'https://example.com/image1.png' },
      },
    ];
    const result = extractImageUrls(blocks);
    expect(result.has('https://example.com/image1.png')).toBe(true);
    expect(result.size).toBe(1);
  });

  it('중첩된 children에서 URL을 추출한다', () => {
    const blocks = [
      {
        type: 'paragraph' as const,
        children: [
          {
            type: 'image' as const,
            props: { url: 'https://example.com/nested.png' },
          },
        ],
      },
    ];
    const result = extractImageUrls(blocks);
    expect(result.has('https://example.com/nested.png')).toBe(true);
  });

  it('중복 URL을 제거한다', () => {
    const blocks = [
      {
        type: 'image' as const,
        props: { url: 'https://example.com/same.png' },
      },
      {
        type: 'image' as const,
        props: { url: 'https://example.com/same.png' },
      },
    ];
    const result = extractImageUrls(blocks);
    expect(result.size).toBe(1);
  });

  it('비이미지 블록을 무시한다', () => {
    const blocks = [
      {
        type: 'paragraph' as const,
        props: { textColor: 'default' },
      },
      {
        type: 'heading' as const,
        props: { level: 1 },
      },
    ];
    const result = extractImageUrls(blocks);
    expect(result.size).toBe(0);
  });

  it('여러 이미지 URL을 추출한다', () => {
    const blocks = [
      {
        type: 'image' as const,
        props: { url: 'https://example.com/image1.png' },
      },
      {
        type: 'paragraph' as const,
        props: {},
      },
      {
        type: 'image' as const,
        props: { url: 'https://example.com/image2.png' },
      },
    ];
    const result = extractImageUrls(blocks);
    expect(result.size).toBe(2);
    expect(result.has('https://example.com/image1.png')).toBe(true);
    expect(result.has('https://example.com/image2.png')).toBe(true);
  });

  it('빈 URL을 무시한다', () => {
    const blocks = [
      {
        type: 'image' as const,
        props: { url: '' },
      },
    ];
    const result = extractImageUrls(blocks);
    expect(result.size).toBe(0);
  });

  it('공백만 있는 URL을 무시한다', () => {
    const blocks = [
      {
        type: 'image' as const,
        props: { url: '   ' },
      },
    ];
    const result = extractImageUrls(blocks);
    expect(result.size).toBe(0);
  });

  it('url 속성이 없는 이미지 블록을 무시한다', () => {
    const blocks = [
      {
        type: 'image' as const,
        props: {},
      },
    ];
    const result = extractImageUrls(blocks);
    expect(result.size).toBe(0);
  });
});

describe('findDeletedImageUrls', () => {
  it('이전에만 있던 URL을 반환한다', () => {
    const previous = new Set(['url1', 'url2', 'url3']);
    const current = new Set(['url1', 'url3']);
    const result = findDeletedImageUrls(previous, current);
    expect(result).toEqual(['url2']);
  });

  it('두 Set이 동일하면 빈 배열을 반환한다', () => {
    const urls = new Set(['url1', 'url2']);
    const result = findDeletedImageUrls(urls, urls);
    expect(result).toEqual([]);
  });

  it('새로 추가된 URL을 무시한다', () => {
    const previous = new Set(['url1']);
    const current = new Set(['url1', 'url2']);
    const result = findDeletedImageUrls(previous, current);
    expect(result).toEqual([]);
  });

  it('모든 URL이 삭제된 경우', () => {
    const previous = new Set(['url1', 'url2']);
    const current = new Set<string>();
    const result = findDeletedImageUrls(previous, current);
    expect(result).toHaveLength(2);
    expect(result).toContain('url1');
    expect(result).toContain('url2');
  });

  it('빈 이전 Set은 빈 배열을 반환한다', () => {
    const previous = new Set<string>();
    const current = new Set(['url1', 'url2']);
    const result = findDeletedImageUrls(previous, current);
    expect(result).toEqual([]);
  });

  it('여러 URL이 삭제된 경우', () => {
    const previous = new Set(['a', 'b', 'c', 'd']);
    const current = new Set(['a', 'd']);
    const result = findDeletedImageUrls(previous, current);
    expect(result).toHaveLength(2);
    expect(result).toContain('b');
    expect(result).toContain('c');
  });
});
