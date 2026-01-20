/**
 * LumirEditor 커스텀 에러 클래스
 */

export type LumirErrorCode =
  | "UPLOAD_FAILED"
  | "INVALID_FILE_TYPE"
  | "S3_CONFIG_ERROR"
  | "PRESIGNED_URL_ERROR"
  | "NETWORK_ERROR"
  | "EDITOR_ERROR"
  | "UNKNOWN_ERROR";

export interface LumirErrorDetails {
  code: LumirErrorCode;
  originalError?: Error;
  context?: Record<string, unknown>;
}

/**
 * LumirEditor에서 발생하는 에러를 위한 커스텀 에러 클래스
 */
export class LumirEditorError extends Error {
  public readonly code: LumirErrorCode;
  public readonly originalError?: Error;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, details: Partial<LumirErrorDetails> = {}) {
    super(message);
    this.name = "LumirEditorError";
    this.code = details.code || "UNKNOWN_ERROR";
    this.originalError = details.originalError;
    this.context = details.context;

    // Error 클래스 확장 시 프로토타입 체인 유지
    Object.setPrototypeOf(this, LumirEditorError.prototype);
  }

  /**
   * 에러 정보를 JSON 형태로 반환
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack,
    };
  }

  /**
   * 사용자 친화적 에러 메시지 반환
   */
  getUserMessage(): string {
    switch (this.code) {
      case "UPLOAD_FAILED":
        return "파일 업로드에 실패했습니다. 다시 시도해주세요.";
      case "INVALID_FILE_TYPE":
        return "지원하지 않는 파일 형식입니다. 이미지 파일만 업로드 가능합니다.";
      case "S3_CONFIG_ERROR":
        return "S3 설정이 올바르지 않습니다. 관리자에게 문의하세요.";
      case "PRESIGNED_URL_ERROR":
        return "업로드 URL 생성에 실패했습니다. 다시 시도해주세요.";
      case "NETWORK_ERROR":
        return "네트워크 연결을 확인해주세요.";
      case "EDITOR_ERROR":
        return "에디터 오류가 발생했습니다. 페이지를 새로고침해주세요.";
      default:
        return "알 수 없는 오류가 발생했습니다.";
    }
  }

  /**
   * 일반 Error를 LumirEditorError로 변환
   */
  static fromError(
    error: Error,
    code: LumirErrorCode = "UNKNOWN_ERROR",
    context?: Record<string, unknown>
  ): LumirEditorError {
    return new LumirEditorError(error.message, {
      code,
      originalError: error,
      context,
    });
  }

  /**
   * 업로드 실패 에러 생성
   */
  static uploadFailed(
    message: string,
    originalError?: Error
  ): LumirEditorError {
    return new LumirEditorError(message, {
      code: "UPLOAD_FAILED",
      originalError,
    });
  }

  /**
   * 잘못된 파일 형식 에러 생성
   */
  static invalidFileType(fileName: string): LumirEditorError {
    return new LumirEditorError(
      `Invalid file type: ${fileName}. Only image files are allowed.`,
      {
        code: "INVALID_FILE_TYPE",
        context: { fileName },
      }
    );
  }

  /**
   * S3 설정 에러 생성
   */
  static s3ConfigError(message: string): LumirEditorError {
    return new LumirEditorError(message, {
      code: "S3_CONFIG_ERROR",
    });
  }

  /**
   * 네트워크 에러 생성
   */
  static networkError(originalError?: Error): LumirEditorError {
    return new LumirEditorError("Network request failed", {
      code: "NETWORK_ERROR",
      originalError,
    });
  }
}
