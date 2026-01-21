import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icons, BlockTypeIcons } from '../../src/components/FloatingMenu/Icons';

describe('Icons', () => {
  describe('Icons 객체', () => {
    const iconKeys = [
      'undo',
      'redo',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'alignLeft',
      'alignCenter',
      'alignRight',
      'bulletList',
      'numberedList',
      'image',
      'expandMore',
      'textColor',
      'bgColor',
      'link',
      'chevronRight',
      'chevronLeft',
      'table',
      'htmlFile',
    ];

    it('모든 아이콘 키가 존재한다', () => {
      iconKeys.forEach((key) => {
        expect(Icons).toHaveProperty(key);
      });
    });

    it('각 아이콘이 렌더링 가능하다', () => {
      iconKeys.forEach((key) => {
        const icon = Icons[key as keyof typeof Icons];
        const { container } = render(<>{icon}</>);
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('아이콘이 SVG 요소이다', () => {
      const { container } = render(<>{Icons.undo}</>);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('undo 아이콘이 올바른 크기를 가진다', () => {
      const { container } = render(<>{Icons.undo}</>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '20');
      expect(svg).toHaveAttribute('height', '20');
    });

    it('expandMore 아이콘은 18x18 크기이다', () => {
      const { container } = render(<>{Icons.expandMore}</>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '18');
      expect(svg).toHaveAttribute('height', '18');
    });
  });

  describe('BlockTypeIcons 객체', () => {
    const blockTypeKeys = [
      'paragraph',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'toggleH1',
      'toggleH2',
      'toggleH3',
      'quote',
      'codeBlock',
      'toggleList',
      'bulletList',
      'numberedList',
      'checkList',
    ];

    it('모든 블록 타입 키가 존재한다', () => {
      blockTypeKeys.forEach((key) => {
        expect(BlockTypeIcons).toHaveProperty(key);
      });
    });

    it('각 블록 타입 아이콘이 렌더링 가능하다', () => {
      blockTypeKeys.forEach((key) => {
        const icon = BlockTypeIcons[key];
        const { container } = render(<>{icon}</>);
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('paragraph 아이콘이 SVG이다', () => {
      const { container } = render(<>{BlockTypeIcons.paragraph}</>);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('h1 아이콘이 텍스트 span이다', () => {
      const { container } = render(<>{BlockTypeIcons.h1}</>);
      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span).toHaveTextContent('H1');
    });

    it('h2 아이콘이 텍스트 span이다', () => {
      const { container } = render(<>{BlockTypeIcons.h2}</>);
      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span).toHaveTextContent('H2');
    });

    it('toggleH1 아이콘이 화살표와 H1을 포함한다', () => {
      const { container } = render(<>{BlockTypeIcons.toggleH1}</>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(container.textContent).toContain('H1');
    });

    it('quote 아이콘이 SVG이다', () => {
      const { container } = render(<>{BlockTypeIcons.quote}</>);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('codeBlock 아이콘이 SVG이다', () => {
      const { container } = render(<>{BlockTypeIcons.codeBlock}</>);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
