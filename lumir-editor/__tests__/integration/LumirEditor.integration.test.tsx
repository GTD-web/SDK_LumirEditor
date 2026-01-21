import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// BlockNote의 복잡한 의존성으로 인해 모듈을 mock
vi.mock('@blocknote/react', () => ({
  useCreateBlockNote: vi.fn(() => ({
    document: [],
    topLevelBlocks: [],
    getTextCursorPosition: vi.fn(() => ({
      block: { type: 'paragraph' },
    })),
    insertBlocks: vi.fn(),
    updateBlock: vi.fn(),
    removeBlocks: vi.fn(),
    replaceBlocks: vi.fn(),
    focus: vi.fn(),
    onSelectionChange: vi.fn(() => vi.fn()),
    onEditorContentChange: vi.fn(() => vi.fn()),
    schema: {
      blockSchema: {},
    },
  })),
  BlockNoteView: vi.fn(({ children }) => (
    <div data-testid="blocknote-view">{children}</div>
  )),
  SideMenu: vi.fn(() => null),
  SideMenuController: vi.fn(() => null),
  DragHandleButton: vi.fn(() => null),
  SuggestionMenuController: vi.fn(() => null),
  getDefaultReactSlashMenuItems: vi.fn(() => []),
  createReactBlockSpec: vi.fn((config, options) => ({
    config,
    render: options?.render || (() => null),
  })),
}));

vi.mock('@blocknote/mantine', () => ({
  BlockNoteView: vi.fn(({ children }) => (
    <div data-testid="blocknote-mantine-view">{children}</div>
  )),
}));

vi.mock('@blocknote/core', () => ({
  BlockNoteSchema: {
    create: vi.fn(() => ({
      blockSpecs: {},
      inlineContentSpecs: {},
      styleSpecs: {},
    })),
  },
  defaultBlockSpecs: {},
  defaultInlineContentSpecs: {},
  defaultStyleSpecs: {},
  filterSuggestionItems: vi.fn(() => []),
}));

// ContentUtils와 EditorConfig 클래스 테스트
import { ContentUtils, EditorConfig } from '../../src/components/LumirEditor';

describe('LumirEditor Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ContentUtils 클래스', () => {
    describe('isValidJSONString', () => {
      it('유효한 JSON 배열이면 true를 반환한다', () => {
        const validJson = '[{"type":"paragraph","content":[]}]';
        expect(ContentUtils.isValidJSONString(validJson)).toBe(true);
      });

      it('유효하지 않은 JSON이면 false를 반환한다', () => {
        expect(ContentUtils.isValidJSONString('invalid')).toBe(false);
      });

      it('빈 문자열이면 false를 반환한다', () => {
        expect(ContentUtils.isValidJSONString('')).toBe(false);
      });

      it('배열이 아닌 JSON 객체면 false를 반환한다', () => {
        expect(ContentUtils.isValidJSONString('{"key":"value"}')).toBe(false);
      });

      it('빈 배열이면 true를 반환한다', () => {
        expect(ContentUtils.isValidJSONString('[]')).toBe(true);
      });
    });

    describe('parseJSONContent', () => {
      it('유효한 JSON 배열을 파싱한다', () => {
        const json = '[{"type":"paragraph"}]';
        const result = ContentUtils.parseJSONContent(json);
        expect(result).toEqual([{ type: 'paragraph' }]);
      });

      it('파싱 실패 시 null을 반환한다', () => {
        expect(ContentUtils.parseJSONContent('invalid')).toBeNull();
      });

      it('배열이 아닌 경우 null을 반환한다', () => {
        expect(ContentUtils.parseJSONContent('{"type":"paragraph"}')).toBeNull();
      });
    });

    describe('createDefaultBlock', () => {
      it('paragraph 타입 블록을 생성한다', () => {
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

      it('빈 children 배열을 포함한다', () => {
        const block = ContentUtils.createDefaultBlock();
        expect(block.children).toEqual([]);
      });
    });

    describe('validateContent', () => {
      it('빈 문자열이면 기본 블록을 생성한다', () => {
        const result = ContentUtils.validateContent('');
        expect(result.length).toBe(3);
        expect(result[0].type).toBe('paragraph');
      });

      it('유효한 JSON 문자열을 파싱한다', () => {
        const json = '[{"type":"heading","props":{"level":1}}]';
        const result = ContentUtils.validateContent(json);
        expect(result.length).toBe(1);
        expect(result[0].type).toBe('heading');
      });

      it('유효한 배열은 그대로 반환한다', () => {
        const content = [{ type: 'paragraph' as const, content: [] }];
        const result = ContentUtils.validateContent(content);
        expect(result).toEqual(content);
      });

      it('undefined면 기본 블록을 생성한다', () => {
        const result = ContentUtils.validateContent(undefined);
        expect(result.length).toBe(3);
      });

      it('emptyBlockCount 파라미터를 적용한다', () => {
        const result = ContentUtils.validateContent('', 5);
        expect(result.length).toBe(5);
      });
    });
  });

  describe('EditorConfig 클래스', () => {
    describe('getDefaultTableConfig', () => {
      it('설정 없으면 모든 옵션이 true이다', () => {
        const config = EditorConfig.getDefaultTableConfig();
        expect(config).toEqual({
          splitCells: true,
          cellBackgroundColor: true,
          cellTextColor: true,
          headers: true,
        });
      });

      it('일부 설정 시 병합한다', () => {
        const config = EditorConfig.getDefaultTableConfig({ splitCells: false });
        expect(config.splitCells).toBe(false);
        expect(config.cellBackgroundColor).toBe(true);
      });
    });

    describe('getDefaultHeadingConfig', () => {
      it('설정 없으면 기본 레벨을 반환한다', () => {
        const config = EditorConfig.getDefaultHeadingConfig();
        expect(config.levels).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it('사용자 설정을 유지한다', () => {
        const config = EditorConfig.getDefaultHeadingConfig({ levels: [1, 2] });
        expect(config.levels).toEqual([1, 2]);
      });
    });

    describe('getDisabledExtensions', () => {
      it('기본값으로 모든 미디어를 비활성화한다', () => {
        const extensions = EditorConfig.getDisabledExtensions();
        expect(extensions).toContain('video');
        expect(extensions).toContain('audio');
        expect(extensions).toContain('file');
      });

      it('allowVideo=true면 video를 포함하지 않는다', () => {
        const extensions = EditorConfig.getDisabledExtensions([], true, false, false);
        expect(extensions).not.toContain('video');
        expect(extensions).toContain('audio');
        expect(extensions).toContain('file');
      });

      it('사용자 확장을 병합한다', () => {
        const extensions = EditorConfig.getDisabledExtensions(['custom'], true, true, true);
        expect(extensions).toEqual(['custom']);
      });

      it('중복을 제거한다', () => {
        const extensions = EditorConfig.getDisabledExtensions(['video'], false, true, true);
        const videoCount = extensions.filter((e) => e === 'video').length;
        expect(videoCount).toBe(1);
      });
    });
  });
});
