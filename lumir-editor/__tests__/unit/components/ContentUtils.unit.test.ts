import { describe, it, expect } from 'vitest';
import { ContentUtils } from '../../../src/components/LumirEditor';

describe('ContentUtils', () => {
  describe('isValidJSONString', () => {
    it('유효한 JSON 배열이면 true를 반환한다', () => {
      expect(ContentUtils.isValidJSONString('[{"type": "paragraph"}]')).toBe(true);
    });

    it('유효하지 않은 JSON이면 false를 반환한다', () => {
      expect(ContentUtils.isValidJSONString('not json')).toBe(false);
    });

    it('빈 문자열이면 false를 반환한다', () => {
      expect(ContentUtils.isValidJSONString('')).toBe(false);
    });

    it('배열 아닌 JSON 객체면 false를 반환한다', () => {
      expect(ContentUtils.isValidJSONString('{"type": "paragraph"}')).toBe(false);
    });

    it('빈 배열이면 true를 반환한다', () => {
      expect(ContentUtils.isValidJSONString('[]')).toBe(true);
    });

    it('중첩된 배열도 true를 반환한다', () => {
      expect(ContentUtils.isValidJSONString('[[1, 2], [3, 4]]')).toBe(true);
    });

    it('숫자 JSON이면 false를 반환한다', () => {
      expect(ContentUtils.isValidJSONString('123')).toBe(false);
    });

    it('문자열 JSON이면 false를 반환한다', () => {
      expect(ContentUtils.isValidJSONString('"hello"')).toBe(false);
    });
  });

  describe('parseJSONContent', () => {
    it('유효한 JSON 배열을 파싱한다', () => {
      const content = '[{"type": "paragraph", "content": []}]';
      const result = ContentUtils.parseJSONContent(content);
      expect(result).toEqual([{ type: 'paragraph', content: [] }]);
    });

    it('파싱 실패 시 null을 반환한다', () => {
      expect(ContentUtils.parseJSONContent('invalid json')).toBeNull();
    });

    it('배열 아닌 경우 null을 반환한다', () => {
      expect(ContentUtils.parseJSONContent('{"type": "paragraph"}')).toBeNull();
    });

    it('빈 배열을 파싱한다', () => {
      expect(ContentUtils.parseJSONContent('[]')).toEqual([]);
    });

    it('복잡한 블록 구조를 파싱한다', () => {
      const content = JSON.stringify([
        {
          type: 'paragraph',
          props: { textColor: 'default' },
          content: [{ type: 'text', text: 'Hello' }],
          children: [],
        },
      ]);
      const result = ContentUtils.parseJSONContent(content);
      expect(result).toHaveLength(1);
      expect(result![0].type).toBe('paragraph');
    });
  });

  describe('createDefaultBlock', () => {
    it('paragraph 타입을 생성한다', () => {
      const block = ContentUtils.createDefaultBlock();
      expect(block.type).toBe('paragraph');
    });

    it('기본 props를 포함한다', () => {
      const block = ContentUtils.createDefaultBlock();
      expect(block.props).toEqual({
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      });
    });

    it('빈 content 배열을 포함한다', () => {
      const block = ContentUtils.createDefaultBlock();
      expect(block.content).toEqual([{ type: 'text', text: '', styles: {} }]);
    });

    it('빈 children 배열을 포함한다', () => {
      const block = ContentUtils.createDefaultBlock();
      expect(block.children).toEqual([]);
    });

    it('새로운 객체를 반환한다 (불변성)', () => {
      const block1 = ContentUtils.createDefaultBlock();
      const block2 = ContentUtils.createDefaultBlock();
      expect(block1).not.toBe(block2);
    });
  });

  describe('validateContent', () => {
    it('빈 문자열이면 기본 블록을 생성한다', () => {
      const result = ContentUtils.validateContent('');
      expect(result).toHaveLength(3); // 기본 emptyBlockCount
      expect(result[0].type).toBe('paragraph');
    });

    it('공백 문자열이면 기본 블록을 생성한다', () => {
      const result = ContentUtils.validateContent('   ');
      expect(result).toHaveLength(3);
    });

    it('유효한 JSON 문자열을 파싱한다', () => {
      const content = '[{"type": "heading", "props": {"level": 1}}]';
      const result = ContentUtils.validateContent(content);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('heading');
    });

    it('파싱 실패 시 기본 블록을 생성한다', () => {
      const result = ContentUtils.validateContent('invalid json');
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('paragraph');
    });

    it('빈 배열이면 기본 블록을 생성한다', () => {
      const result = ContentUtils.validateContent([]);
      expect(result).toHaveLength(3);
    });

    it('유효한 배열은 그대로 반환한다', () => {
      const content = [{ type: 'paragraph' as const, content: [] }];
      const result = ContentUtils.validateContent(content);
      expect(result).toEqual(content);
    });

    it('undefined면 기본 블록을 생성한다', () => {
      const result = ContentUtils.validateContent(undefined);
      expect(result).toHaveLength(3);
    });

    it('emptyBlockCount 파라미터를 적용한다', () => {
      const result = ContentUtils.validateContent('', 5);
      expect(result).toHaveLength(5);
    });

    it('emptyBlockCount가 1이면 1개의 블록을 생성한다', () => {
      const result = ContentUtils.validateContent('', 1);
      expect(result).toHaveLength(1);
    });

    it('JSON 배열이 비어있으면 기본 블록을 생성한다', () => {
      const result = ContentUtils.validateContent('[]');
      expect(result).toHaveLength(3);
    });
  });
});
