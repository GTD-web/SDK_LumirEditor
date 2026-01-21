import { describe, it, expect } from 'vitest';
import { LumirEditorError, LumirErrorCode } from '../../../src/errors/LumirEditorError';

describe('LumirEditorError', () => {
  describe('constructor', () => {
    it('에러 메시지를 설정한다', () => {
      const error = new LumirEditorError('Test error message');
      expect(error.message).toBe('Test error message');
    });

    it('에러 코드를 설정한다', () => {
      const error = new LumirEditorError('Test error', { code: 'UPLOAD_FAILED' });
      expect(error.code).toBe('UPLOAD_FAILED');
    });

    it('코드 미지정 시 UNKNOWN_ERROR 기본값을 사용한다', () => {
      const error = new LumirEditorError('Test error');
      expect(error.code).toBe('UNKNOWN_ERROR');
    });

    it('originalError를 저장한다', () => {
      const originalError = new Error('Original error');
      const error = new LumirEditorError('Wrapped error', { originalError });
      expect(error.originalError).toBe(originalError);
    });

    it('context를 저장한다', () => {
      const context = { fileName: 'test.png', size: 1024 };
      const error = new LumirEditorError('Test error', { context });
      expect(error.context).toEqual(context);
    });

    it('instanceof 검증이 동작한다', () => {
      const error = new LumirEditorError('Test error');
      expect(error).toBeInstanceOf(LumirEditorError);
      expect(error).toBeInstanceOf(Error);
    });

    it('name이 LumirEditorError이다', () => {
      const error = new LumirEditorError('Test error');
      expect(error.name).toBe('LumirEditorError');
    });

    it('stack trace를 가진다', () => {
      const error = new LumirEditorError('Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('toJSON', () => {
    it('모든 필드를 포함한 JSON을 반환한다', () => {
      const originalError = new Error('Original');
      const context = { key: 'value' };
      const error = new LumirEditorError('Test error', {
        code: 'UPLOAD_FAILED',
        originalError,
        context,
      });

      const json = error.toJSON();

      expect(json.name).toBe('LumirEditorError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('UPLOAD_FAILED');
      expect(json.context).toEqual(context);
      expect(json.stack).toBeDefined();
    });

    it('context 없이도 정상 동작한다', () => {
      const error = new LumirEditorError('Test error');
      const json = error.toJSON();

      expect(json.name).toBe('LumirEditorError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('UNKNOWN_ERROR');
      expect(json.context).toBeUndefined();
    });
  });

  describe('getUserMessage', () => {
    const testCases: { code: LumirErrorCode; expectedMessage: string }[] = [
      { code: 'UPLOAD_FAILED', expectedMessage: '파일 업로드에 실패했습니다. 다시 시도해주세요.' },
      { code: 'INVALID_FILE_TYPE', expectedMessage: '지원하지 않는 파일 형식입니다. 이미지 파일만 업로드 가능합니다.' },
      { code: 'S3_CONFIG_ERROR', expectedMessage: 'S3 설정이 올바르지 않습니다. 관리자에게 문의하세요.' },
      { code: 'PRESIGNED_URL_ERROR', expectedMessage: '업로드 URL 생성에 실패했습니다. 다시 시도해주세요.' },
      { code: 'NETWORK_ERROR', expectedMessage: '네트워크 연결을 확인해주세요.' },
      { code: 'EDITOR_ERROR', expectedMessage: '에디터 오류가 발생했습니다. 페이지를 새로고침해주세요.' },
      { code: 'UNKNOWN_ERROR', expectedMessage: '알 수 없는 오류가 발생했습니다.' },
    ];

    testCases.forEach(({ code, expectedMessage }) => {
      it(`${code} 코드에 대한 메시지를 반환한다`, () => {
        const error = new LumirEditorError('Test', { code });
        expect(error.getUserMessage()).toBe(expectedMessage);
      });
    });
  });

  describe('static factories', () => {
    describe('fromError', () => {
      it('Error를 LumirEditorError로 변환한다', () => {
        const originalError = new Error('Original error');
        const error = LumirEditorError.fromError(originalError, 'NETWORK_ERROR');

        expect(error).toBeInstanceOf(LumirEditorError);
        expect(error.message).toBe('Original error');
        expect(error.code).toBe('NETWORK_ERROR');
        expect(error.originalError).toBe(originalError);
      });

      it('코드 미지정 시 UNKNOWN_ERROR 사용', () => {
        const originalError = new Error('Original error');
        const error = LumirEditorError.fromError(originalError);

        expect(error.code).toBe('UNKNOWN_ERROR');
      });

      it('context를 포함할 수 있다', () => {
        const originalError = new Error('Original error');
        const context = { detail: 'test' };
        const error = LumirEditorError.fromError(originalError, 'EDITOR_ERROR', context);

        expect(error.context).toEqual(context);
      });
    });

    describe('uploadFailed', () => {
      it('originalError 포함', () => {
        const originalError = new Error('Upload failed');
        const error = LumirEditorError.uploadFailed('Failed to upload', originalError);

        expect(error.code).toBe('UPLOAD_FAILED');
        expect(error.message).toBe('Failed to upload');
        expect(error.originalError).toBe(originalError);
      });

      it('originalError 없음', () => {
        const error = LumirEditorError.uploadFailed('Failed to upload');

        expect(error.code).toBe('UPLOAD_FAILED');
        expect(error.message).toBe('Failed to upload');
        expect(error.originalError).toBeUndefined();
      });
    });

    describe('invalidFileType', () => {
      it('fileName을 context에 포함', () => {
        const error = LumirEditorError.invalidFileType('test.exe');

        expect(error.code).toBe('INVALID_FILE_TYPE');
        expect(error.message).toContain('test.exe');
        expect(error.context).toEqual({ fileName: 'test.exe' });
      });
    });

    describe('s3ConfigError', () => {
      it('메시지 설정', () => {
        const error = LumirEditorError.s3ConfigError('Missing API endpoint');

        expect(error.code).toBe('S3_CONFIG_ERROR');
        expect(error.message).toBe('Missing API endpoint');
      });
    });

    describe('networkError', () => {
      it('originalError 포함', () => {
        const originalError = new Error('Network timeout');
        const error = LumirEditorError.networkError(originalError);

        expect(error.code).toBe('NETWORK_ERROR');
        expect(error.message).toBe('Network request failed');
        expect(error.originalError).toBe(originalError);
      });

      it('originalError 없음', () => {
        const error = LumirEditorError.networkError();

        expect(error.code).toBe('NETWORK_ERROR');
        expect(error.message).toBe('Network request failed');
        expect(error.originalError).toBeUndefined();
      });
    });
  });
});
