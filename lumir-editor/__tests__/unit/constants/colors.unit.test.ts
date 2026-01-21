import { describe, it, expect } from 'vitest';
import {
  TEXT_COLORS,
  BACKGROUND_COLORS,
  getHexFromColorValue,
  ColorItem,
} from '../../../src/constants/colors';

describe('colors', () => {
  describe('TEXT_COLORS', () => {
    it('10개의 색상을 포함한다', () => {
      expect(TEXT_COLORS).toHaveLength(10);
    });

    it('각 항목이 name, value, hex 속성을 가진다', () => {
      TEXT_COLORS.forEach((color: ColorItem) => {
        expect(color).toHaveProperty('name');
        expect(color).toHaveProperty('value');
        expect(color).toHaveProperty('hex');
        expect(typeof color.name).toBe('string');
        expect(typeof color.value).toBe('string');
        expect(typeof color.hex).toBe('string');
      });
    });

    it('default 색상이 존재한다', () => {
      const defaultColor = TEXT_COLORS.find((c) => c.value === 'default');
      expect(defaultColor).toBeDefined();
      expect(defaultColor?.hex).toBe('#3f3f3f');
    });

    it('hex가 올바른 형식이다 (#RRGGBB)', () => {
      TEXT_COLORS.forEach((color: ColorItem) => {
        expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('모든 색상 값이 고유하다', () => {
      const values = TEXT_COLORS.map((c) => c.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('BACKGROUND_COLORS', () => {
    it('10개의 색상을 포함한다', () => {
      expect(BACKGROUND_COLORS).toHaveLength(10);
    });

    it('각 항목이 name, value, hex 속성을 가진다', () => {
      BACKGROUND_COLORS.forEach((color: ColorItem) => {
        expect(color).toHaveProperty('name');
        expect(color).toHaveProperty('value');
        expect(color).toHaveProperty('hex');
      });
    });

    it('default 색상이 transparent이다', () => {
      const defaultColor = BACKGROUND_COLORS.find((c) => c.value === 'default');
      expect(defaultColor).toBeDefined();
      expect(defaultColor?.hex).toBe('transparent');
    });

    it('default 외의 색상은 hex 형식이다', () => {
      BACKGROUND_COLORS.filter((c) => c.value !== 'default').forEach((color: ColorItem) => {
        expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('getHexFromColorValue', () => {
    it('텍스트 색상 - red를 #e03e3e로 변환한다', () => {
      expect(getHexFromColorValue('red', 'text')).toBe('#e03e3e');
    });

    it('텍스트 색상 - default를 #3f3f3f로 변환한다', () => {
      expect(getHexFromColorValue('default', 'text')).toBe('#3f3f3f');
    });

    it('텍스트 색상 - 존재하지 않는 값은 #000000을 반환한다', () => {
      expect(getHexFromColorValue('nonexistent', 'text')).toBe('#000000');
    });

    it('배경 색상 - red를 #fbe4e4로 변환한다', () => {
      expect(getHexFromColorValue('red', 'background')).toBe('#fbe4e4');
    });

    it('배경 색상 - default를 transparent로 변환한다', () => {
      expect(getHexFromColorValue('default', 'background')).toBe('transparent');
    });

    it('배경 색상 - 존재하지 않는 값은 transparent를 반환한다', () => {
      expect(getHexFromColorValue('nonexistent', 'background')).toBe('transparent');
    });

    it('모든 TEXT_COLORS에 대해 올바른 hex를 반환한다', () => {
      TEXT_COLORS.forEach((color: ColorItem) => {
        expect(getHexFromColorValue(color.value, 'text')).toBe(color.hex);
      });
    });

    it('모든 BACKGROUND_COLORS에 대해 올바른 hex를 반환한다', () => {
      BACKGROUND_COLORS.forEach((color: ColorItem) => {
        expect(getHexFromColorValue(color.value, 'background')).toBe(color.hex);
      });
    });

    it('gray 텍스트 색상을 올바르게 반환한다', () => {
      expect(getHexFromColorValue('gray', 'text')).toBe('#9b9a97');
    });

    it('blue 배경 색상을 올바르게 반환한다', () => {
      expect(getHexFromColorValue('blue', 'background')).toBe('#ddebf1');
    });
  });
});
