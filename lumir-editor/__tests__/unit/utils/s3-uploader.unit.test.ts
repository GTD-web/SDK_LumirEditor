import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createS3Uploader, S3UploaderConfig } from '../../../src/utils/s3-uploader';

// Mock File 생성 헬퍼
const createMockFile = (name: string, size: number = 1024, type: string = 'image/png'): File => {
  const content = new Array(size).fill('a').join('');
  return new File([content], name, { type });
};

// URL에서 key 파라미터 추출 헬퍼
const getKeyFromUrl = (url: string): string => {
  const urlObj = new URL(url, 'http://localhost');
  const key = urlObj.searchParams.get('key');
  return key ? decodeURIComponent(key) : '';
};

describe('createS3Uploader', () => {
  const validConfig: S3UploaderConfig = {
    apiEndpoint: '/api/s3/presigned',
    env: 'production',
    path: 'images',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('필수 파라미터 검증', () => {
    it('apiEndpoint 빈 문자열이면 에러를 던진다', () => {
      expect(() => createS3Uploader({ ...validConfig, apiEndpoint: '' }))
        .toThrow('apiEndpoint is required');
    });

    it('apiEndpoint 공백만 있으면 에러를 던진다', () => {
      expect(() => createS3Uploader({ ...validConfig, apiEndpoint: '   ' }))
        .toThrow('apiEndpoint is required');
    });

    it('env가 undefined면 에러를 던진다', () => {
      expect(() => createS3Uploader({ ...validConfig, env: undefined as any }))
        .toThrow('env is required');
    });

    it('path 빈 문자열이면 에러를 던진다', () => {
      expect(() => createS3Uploader({ ...validConfig, path: '' }))
        .toThrow('path is required');
    });

    it('path 공백만 있으면 에러를 던진다', () => {
      expect(() => createS3Uploader({ ...validConfig, path: '   ' }))
        .toThrow('path is required');
    });
  });

  describe('파일명 생성', () => {
    it('기본 파일명을 생성한다 (env/path/filename)', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            presignedUrl: 'https://s3.example.com/upload?token=abc',
            publicUrl: 'https://cdn.example.com/production/images/test.png',
          }),
        })
        .mockResolvedValueOnce({ ok: true });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');
      await uploader(file);

      const firstCallUrl = mockFetch.mock.calls[0][0];
      const key = getKeyFromUrl(firstCallUrl);
      expect(key).toBe('production/images/test.png');
    });

    it('fileNameTransform 콜백을 적용한다', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            presignedUrl: 'https://s3.example.com/upload?token=abc',
            publicUrl: 'https://cdn.example.com/production/images/transformed.png',
          }),
        })
        .mockResolvedValueOnce({ ok: true });

      global.fetch = mockFetch;

      const uploader = createS3Uploader({
        ...validConfig,
        fileNameTransform: (name) => `prefix_${name}`,
      });
      const file = createMockFile('test.png');
      await uploader(file);

      const firstCallUrl = mockFetch.mock.calls[0][0];
      const key = getKeyFromUrl(firstCallUrl);
      expect(key).toBe('production/images/prefix_test.png');
    });

    it('appendUUID=true면 UUID를 추가한다', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            presignedUrl: 'https://s3.example.com/upload?token=abc',
            publicUrl: 'https://cdn.example.com/production/images/test_uuid.png',
          }),
        })
        .mockResolvedValueOnce({ ok: true });

      global.fetch = mockFetch;

      const uploader = createS3Uploader({
        ...validConfig,
        appendUUID: true,
      });
      const file = createMockFile('test.png');
      await uploader(file);

      const firstCallUrl = mockFetch.mock.calls[0][0];
      const key = getKeyFromUrl(firstCallUrl);
      expect(key).toContain('test_');
      expect(key).toContain('.png');
      expect(key).toMatch(/test_[a-f0-9-]+\.png$/);
    });

    it('preserveExtension=false면 확장자를 제거한다', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            presignedUrl: 'https://s3.example.com/upload?token=abc',
            publicUrl: 'https://cdn.example.com/production/images/test',
          }),
        })
        .mockResolvedValueOnce({ ok: true });

      global.fetch = mockFetch;

      const uploader = createS3Uploader({
        ...validConfig,
        preserveExtension: false,
      });
      const file = createMockFile('test.png');
      await uploader(file);

      const firstCallUrl = mockFetch.mock.calls[0][0];
      const key = getKeyFromUrl(firstCallUrl);
      expect(key).toBe('production/images/test');
      expect(key).not.toContain('.png');
    });

    it('확장자 없는 파일을 처리한다', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            presignedUrl: 'https://s3.example.com/upload?token=abc',
            publicUrl: 'https://cdn.example.com/production/images/noext',
          }),
        })
        .mockResolvedValueOnce({ ok: true });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('noext', 1024, 'application/octet-stream');
      await uploader(file);

      const firstCallUrl = mockFetch.mock.calls[0][0];
      const key = getKeyFromUrl(firstCallUrl);
      expect(key).toBe('production/images/noext');
    });
  });

  describe('업로드 플로우', () => {
    it('성공적으로 업로드하고 publicUrl을 반환한다', async () => {
      const expectedPublicUrl = 'https://cdn.example.com/production/images/test.png';
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            presignedUrl: 'https://s3.example.com/upload?token=abc',
            publicUrl: expectedPublicUrl,
          }),
        })
        .mockResolvedValueOnce({ ok: true });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');
      const result = await uploader(file);

      expect(result).toBe(expectedPublicUrl);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('presigned URL 요청 실패 시 에러를 던진다', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
        text: () => Promise.resolve('Access denied'),
      });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow('Failed to get presigned URL');
    });

    it('S3 업로드 실패 시 에러를 던진다', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            presignedUrl: 'https://s3.example.com/upload?token=abc',
            publicUrl: 'https://cdn.example.com/production/images/test.png',
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: 'Internal Server Error',
        });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow('Failed to upload file');
    });

    it('네트워크 에러를 처리한다', async () => {
      const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow('Network error');
    });
  });

  describe('URL 검증 (SSRF 방지)', () => {
    it('HTTP presignedUrl을 거부한다', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          presignedUrl: 'http://s3.example.com/upload',
          publicUrl: 'https://cdn.example.com/test.png',
        }),
      });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow('must use HTTPS');
    });

    it('HTTP publicUrl을 거부한다', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          presignedUrl: 'https://s3.example.com/upload',
          publicUrl: 'http://cdn.example.com/test.png',
        }),
      });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow('must use HTTPS');
    });

    it('localhost URL을 거부한다', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          presignedUrl: 'https://localhost/upload',
          publicUrl: 'https://cdn.example.com/test.png',
        }),
      });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow('cannot point to internal');
    });

    it('127.x.x.x IP를 거부한다', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          presignedUrl: 'https://127.0.0.1/upload',
          publicUrl: 'https://cdn.example.com/test.png',
        }),
      });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow('cannot point to internal');
    });

    it('192.168.x.x IP를 거부한다', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          presignedUrl: 'https://192.168.1.1/upload',
          publicUrl: 'https://cdn.example.com/test.png',
        }),
      });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow('cannot point to internal');
    });

    it('10.x.x.x IP를 거부한다', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          presignedUrl: 'https://10.0.0.1/upload',
          publicUrl: 'https://cdn.example.com/test.png',
        }),
      });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow('cannot point to internal');
    });

    it('AWS 메타데이터 서버(169.254.169.254)를 거부한다', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          presignedUrl: 'https://169.254.169.254/upload',
          publicUrl: 'https://cdn.example.com/test.png',
        }),
      });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow('cannot point to internal');
    });

    it('빈 문자열 URL을 거부한다', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          presignedUrl: '',
          publicUrl: 'https://cdn.example.com/test.png',
        }),
      });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow('is required');
    });

    it('유효하지 않은 URL 형식을 거부한다', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          presignedUrl: 'not-a-valid-url',
          publicUrl: 'https://cdn.example.com/test.png',
        }),
      });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png');

      await expect(uploader(file)).rejects.toThrow();
    });
  });

  describe('환경별 경로', () => {
    it('production 환경 경로를 생성한다', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            presignedUrl: 'https://s3.example.com/upload',
            publicUrl: 'https://cdn.example.com/production/images/test.png',
          }),
        })
        .mockResolvedValueOnce({ ok: true });

      global.fetch = mockFetch;

      const uploader = createS3Uploader({ ...validConfig, env: 'production' });
      const file = createMockFile('test.png');
      await uploader(file);

      const firstCallUrl = mockFetch.mock.calls[0][0];
      const key = getKeyFromUrl(firstCallUrl);
      expect(key).toContain('production/');
    });

    it('development 환경 경로를 생성한다', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            presignedUrl: 'https://s3.example.com/upload',
            publicUrl: 'https://cdn.example.com/development/images/test.png',
          }),
        })
        .mockResolvedValueOnce({ ok: true });

      global.fetch = mockFetch;

      const uploader = createS3Uploader({ ...validConfig, env: 'development' });
      const file = createMockFile('test.png');
      await uploader(file);

      const firstCallUrl = mockFetch.mock.calls[0][0];
      const key = getKeyFromUrl(firstCallUrl);
      expect(key).toContain('development/');
    });
  });

  describe('Content-Type', () => {
    it('file.type이 있으면 사용한다', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            presignedUrl: 'https://s3.example.com/upload',
            publicUrl: 'https://cdn.example.com/test.png',
          }),
        })
        .mockResolvedValueOnce({ ok: true });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test.png', 1024, 'image/png');
      await uploader(file);

      const uploadCall = mockFetch.mock.calls[1];
      expect(uploadCall[1].headers['Content-Type']).toBe('image/png');
    });

    it('file.type이 없으면 기본값을 사용한다', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            presignedUrl: 'https://s3.example.com/upload',
            publicUrl: 'https://cdn.example.com/test',
          }),
        })
        .mockResolvedValueOnce({ ok: true });

      global.fetch = mockFetch;

      const uploader = createS3Uploader(validConfig);
      const file = createMockFile('test', 1024, '');
      await uploader(file);

      const uploadCall = mockFetch.mock.calls[1];
      expect(uploadCall[1].headers['Content-Type']).toBe('application/octet-stream');
    });
  });
});
