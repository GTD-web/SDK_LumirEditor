import '@testing-library/jest-dom';
import { vi } from 'vitest';

// crypto.randomUUID mock
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
});

// URL.createObjectURL / revokeObjectURL mock
const originalURL = globalThis.URL;
vi.stubGlobal('URL', class extends originalURL {
  static createObjectURL = vi.fn(() => 'blob:mock-url');
  static revokeObjectURL = vi.fn();
});

// ResizeObserver mock
vi.stubGlobal('ResizeObserver', class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
});

// matchMedia mock
vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})));

// fetch mock 기본 설정
global.fetch = vi.fn();
