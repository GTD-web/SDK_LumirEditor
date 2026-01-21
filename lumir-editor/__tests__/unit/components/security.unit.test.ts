import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../../../src/components/LumirEditor';

describe('escapeHtml', () => {
  it('&를 &amp;로 변환한다', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('<를 &lt;로 변환한다', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b');
  });

  it('>를 &gt;로 변환한다', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('"를 &quot;로 변환한다', () => {
    expect(escapeHtml('a "b" c')).toBe('a &quot;b&quot; c');
  });

  it("'를 &#39;로 변환한다", () => {
    expect(escapeHtml("a 'b' c")).toBe('a &#39;b&#39; c');
  });

  it('복합 문자열을 처리한다', () => {
    const input = '<script>alert("xss" & \'attack\')</script>';
    const expected = '&lt;script&gt;alert(&quot;xss&quot; &amp; &#39;attack&#39;)&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  it('일반 문자열은 그대로 반환한다', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('빈 문자열을 처리한다', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('숫자와 특수문자 혼합을 처리한다', () => {
    expect(escapeHtml('1 < 2 & 3 > 0')).toBe('1 &lt; 2 &amp; 3 &gt; 0');
  });

  it('HTML 태그를 이스케이프한다', () => {
    expect(escapeHtml('<div class="test">content</div>')).toBe(
      '&lt;div class=&quot;test&quot;&gt;content&lt;/div&gt;'
    );
  });

  it('연속된 특수문자를 처리한다', () => {
    expect(escapeHtml('<<<>>>')).toBe('&lt;&lt;&lt;&gt;&gt;&gt;');
  });

  it('URL 파라미터를 이스케이프한다', () => {
    expect(escapeHtml('url?a=1&b=2')).toBe('url?a=1&amp;b=2');
  });
});
