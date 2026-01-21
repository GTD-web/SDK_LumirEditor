import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FloatingMenu } from '../../src/components/FloatingMenu';

// Mock editor 생성
const createMockEditor = (overrides = {}) => ({
  canUndo: vi.fn(() => true),
  canRedo: vi.fn(() => true),
  undo: vi.fn(),
  redo: vi.fn(),
  getActiveStyles: vi.fn(() => ({})),
  toggleStyles: vi.fn(),
  getTextCursorPosition: vi.fn(() => ({
    block: { type: 'paragraph', props: { textAlignment: 'left' } },
  })),
  updateBlock: vi.fn(),
  getSelection: vi.fn(() => ({
    blocks: [{ type: 'paragraph', props: {} }],
  })),
  createLink: vi.fn(),
  insertBlocks: vi.fn(),
  focus: vi.fn(),
  onSelectionChange: vi.fn(() => vi.fn()),
  onEditorContentChange: vi.fn(() => vi.fn()),
  schema: {
    blockSchema: {
      paragraph: {},
      heading: {},
      bulletListItem: {},
      numberedListItem: {},
    },
  },
  ...overrides,
});

describe('FloatingMenu Integration', () => {
  let mockEditor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditor = createMockEditor();
  });

  describe('렌더링', () => {
    it('FloatingMenu가 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const wrapper = document.querySelector('.lumir-floating-toolbar-wrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('툴바가 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const toolbar = document.querySelector('.lumir-floating-toolbar');
      expect(toolbar).toBeInTheDocument();
    });

    it('className prop이 적용된다', () => {
      render(<FloatingMenu editor={mockEditor} className="custom-class" />);
      
      const wrapper = document.querySelector('.lumir-floating-toolbar-wrapper');
      expect(wrapper).toHaveClass('custom-class');
    });

    it('position prop이 data-position 속성으로 설정된다', () => {
      render(<FloatingMenu editor={mockEditor} position="fixed" />);
      
      const wrapper = document.querySelector('.lumir-floating-toolbar-wrapper');
      expect(wrapper).toHaveAttribute('data-position', 'fixed');
    });

    it('기본 position은 sticky이다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const wrapper = document.querySelector('.lumir-floating-toolbar-wrapper');
      expect(wrapper).toHaveAttribute('data-position', 'sticky');
    });
  });

  describe('Undo/Redo 버튼', () => {
    it('Undo 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const undoButton = screen.getByTitle('실행 취소');
      expect(undoButton).toBeInTheDocument();
    });

    it('Redo 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const redoButton = screen.getByTitle('다시 실행');
      expect(redoButton).toBeInTheDocument();
    });

    it('Undo 버튼 클릭 시 editor.undo()가 호출된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const undoButton = screen.getByTitle('실행 취소');
      fireEvent.click(undoButton);
      
      expect(mockEditor.undo).toHaveBeenCalled();
    });

    it('Redo 버튼 클릭 시 editor.redo()가 호출된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const redoButton = screen.getByTitle('다시 실행');
      fireEvent.click(redoButton);
      
      expect(mockEditor.redo).toHaveBeenCalled();
    });
  });

  describe('텍스트 스타일 버튼', () => {
    it('Bold 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const boldButton = screen.getByTitle('굵게');
      expect(boldButton).toBeInTheDocument();
    });

    it('Italic 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const italicButton = screen.getByTitle('기울임');
      expect(italicButton).toBeInTheDocument();
    });

    it('Underline 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const underlineButton = screen.getByTitle('밑줄');
      expect(underlineButton).toBeInTheDocument();
    });

    it('Strikethrough 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const strikeButton = screen.getByTitle('취소선');
      expect(strikeButton).toBeInTheDocument();
    });

    it('Bold 버튼 클릭 시 toggleStyles가 호출된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const boldButton = screen.getByTitle('굵게');
      fireEvent.click(boldButton);
      
      expect(mockEditor.toggleStyles).toHaveBeenCalledWith({ bold: true });
    });
  });

  describe('정렬 버튼', () => {
    it('왼쪽 정렬 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const alignLeftButton = screen.getByTitle('왼쪽 정렬');
      expect(alignLeftButton).toBeInTheDocument();
    });

    it('가운데 정렬 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const alignCenterButton = screen.getByTitle('가운데 정렬');
      expect(alignCenterButton).toBeInTheDocument();
    });

    it('오른쪽 정렬 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const alignRightButton = screen.getByTitle('오른쪽 정렬');
      expect(alignRightButton).toBeInTheDocument();
    });
  });

  describe('리스트 버튼', () => {
    it('글머리 기호 목록 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const bulletListButton = screen.getByTitle('글머리 기호 목록');
      expect(bulletListButton).toBeInTheDocument();
    });

    it('번호 목록 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const numberedListButton = screen.getByTitle('번호 목록');
      expect(numberedListButton).toBeInTheDocument();
    });
  });

  describe('색상 버튼', () => {
    it('텍스트 색상 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const textColorButton = screen.getByTitle('텍스트 색상');
      expect(textColorButton).toBeInTheDocument();
    });

    it('배경 색상 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const bgColorButton = screen.getByTitle('배경 색상');
      expect(bgColorButton).toBeInTheDocument();
    });
  });

  describe('기타 버튼', () => {
    it('이미지 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const imageButton = screen.getByTitle('이미지 삽입');
      expect(imageButton).toBeInTheDocument();
    });

    it('링크 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const linkButton = screen.getByTitle('링크 삽입');
      expect(linkButton).toBeInTheDocument();
    });

    it('테이블 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const tableButton = screen.getByTitle('테이블 삽입');
      expect(tableButton).toBeInTheDocument();
    });

    it('HTML 가져오기 버튼이 렌더링된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      const htmlButton = screen.getByTitle('HTML Import');
      expect(htmlButton).toBeInTheDocument();
    });
  });

  describe('이미지 업로드', () => {
    it('이미지 버튼 클릭 시 onImageUpload 콜백이 호출된다', () => {
      const onImageUpload = vi.fn();
      render(<FloatingMenu editor={mockEditor} onImageUpload={onImageUpload} />);
      
      const imageButton = screen.getByTitle('이미지 삽입');
      fireEvent.click(imageButton);
      
      expect(onImageUpload).toHaveBeenCalled();
    });
  });

  describe('선택 변경 감지', () => {
    it('editor.onSelectionChange가 등록된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      expect(mockEditor.onSelectionChange).toHaveBeenCalled();
    });

    it('editor.onEditorContentChange가 등록된다', () => {
      render(<FloatingMenu editor={mockEditor} />);
      
      expect(mockEditor.onEditorContentChange).toHaveBeenCalled();
    });
  });

  describe('editor가 없을 때', () => {
    it('editor가 null이어도 에러 없이 렌더링된다', () => {
      expect(() => {
        render(<FloatingMenu editor={null} />);
      }).not.toThrow();
    });
  });
});
