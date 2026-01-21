import { describe, it, expect } from 'vitest';
import { cn } from '../../../src/utils/cn';

describe('cn', () => {
  it('여러 문자열을 공백으로 병합한다', () => {
    expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
  });

  it('undefined 값을 필터링한다', () => {
    expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
  });

  it('null 값을 필터링한다', () => {
    expect(cn('class1', null, 'class2')).toBe('class1 class2');
  });

  it('false 값을 필터링한다', () => {
    expect(cn('class1', false, 'class2')).toBe('class1 class2');
  });

  it('빈 문자열을 필터링한다', () => {
    expect(cn('class1', '', 'class2')).toBe('class1 class2');
  });

  it('모든 falsy 값을 필터링한다', () => {
    expect(cn('class1', undefined, null, false, '', 'class2')).toBe('class1 class2');
  });

  it('인자 없으면 빈 문자열을 반환한다', () => {
    expect(cn()).toBe('');
  });

  it('공백 포함 클래스명을 처리한다', () => {
    expect(cn('class1 class2', 'class3')).toBe('class1 class2 class3');
  });

  it('단일 클래스명을 반환한다', () => {
    expect(cn('single-class')).toBe('single-class');
  });

  it('모든 값이 falsy면 빈 문자열을 반환한다', () => {
    expect(cn(undefined, null, false, '')).toBe('');
  });
});
