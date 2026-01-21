export interface S3UploaderConfig {
  apiEndpoint: string; // '/api/s3/presigned'(필수)
  env: "production" | "development"; // 환경 (필수)
  path: string; // 파일 경로 (필수)
  /** 파일명 변환 콜백 - 확장자를 제외한 파일명을 받아 변환합니다 */
  fileNameTransform?: (nameWithoutExt: string, file: File) => string;
  /** true일 경우 파일명 뒤에 UUID를 자동으로 추가합니다 (예: image_abc123.png) */
  appendUUID?: boolean;
  /** false로 설정하면 확장자를 자동으로 붙이지 않음 (기본: true) */
  preserveExtension?: boolean;
}

/**
 * 🔒 보안: S3 URL 검증
 * HTTPS 프로토콜 강제 및 URL 형식 검증
 */
function validateS3Url(url: unknown, fieldName: string): string {
  // 타입 검증
  if (typeof url !== "string" || !url || url.trim() === "") {
    throw new Error(
      `${fieldName} is required and must be a non-empty string`
    );
  }

  // HTTPS 프로토콜 강제 (SSRF 방지)
  if (!url.startsWith("https://")) {
    throw new Error(`${fieldName} must use HTTPS protocol`);
  }

  // URL 형식 검증
  try {
    const urlObj = new URL(url);
    // 추가 검증: localhost, private IP 차단
    const hostname = urlObj.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.startsWith("127.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname === "169.254.169.254" // AWS 메타데이터 서버
    ) {
      throw new Error(`${fieldName} cannot point to internal/private networks`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("cannot point to")) {
      throw error;
    }
    throw new Error(`${fieldName} is not a valid URL format`);
  }

  return url;
}

// UUID 생성 함수 (crypto.randomUUID 또는 폴백)
const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 폴백: 간단한 UUID v4 형식 생성
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const createS3Uploader = (config: S3UploaderConfig) => {
  const {
    apiEndpoint,
    env,
    path,
    fileNameTransform,
    appendUUID,
    preserveExtension = true,
  } = config;

  // 필수 파라미터 검증
  if (!apiEndpoint || apiEndpoint.trim() === "") {
    throw new Error(
      "apiEndpoint is required for S3 upload. Please provide a valid API endpoint."
    );
  }

  if (!env) {
    throw new Error("env is required. Must be 'development' or 'production'.");
  }

  if (!path || path.trim() === "") {
    throw new Error("path is required and cannot be empty.");
  }

  // 파일명에 UUID 추가하는 함수
  const appendUUIDToFileName = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1) {
      // 확장자가 없는 경우
      return `${filename}_${generateUUID()}`;
    }
    const name = filename.substring(0, lastDotIndex);
    const ext = filename.substring(lastDotIndex);
    return `${name}_${generateUUID()}${ext}`;
  };

  // 계층 구조 파일명 생성 함수
  const generateHierarchicalFileName = (file: File): string => {
    // 0. 확장자 분리
    const originalName = file.name;
    const lastDotIndex = originalName.lastIndexOf(".");
    const nameWithoutExt =
      lastDotIndex === -1
        ? originalName
        : originalName.substring(0, lastDotIndex);
    const extension =
      lastDotIndex === -1 ? "" : originalName.substring(lastDotIndex);

    let filename = nameWithoutExt;

    // 1. 사용자 정의 파일명 변환 콜백 적용 (확장자 제외한 이름만)
    if (fileNameTransform) {
      filename = fileNameTransform(filename, file);
    }

    // 2. UUID 자동 추가 (appendUUID가 true인 경우)
    if (appendUUID) {
      filename = `${filename}_${generateUUID()}`;
    }

    // 3. 확장자 다시 붙이기 (preserveExtension이 true인 경우만)
    if (preserveExtension) {
      filename = `${filename}${extension}`;
    }

    // {env}/{path}/{filename}
    return `${env}/${path}/${filename}`;
  };

  return async (file: File): Promise<string> => {
    try {
      // 파일 업로드 시에도 apiEndpoint 재검증
      if (!apiEndpoint || apiEndpoint.trim() === "") {
        throw new Error(
          "Invalid apiEndpoint: Cannot upload file without a valid API ENDPOINT"
        );
      }

      // 1. 계층 구조 파일명 생성
      const fileName = generateHierarchicalFileName(file);

      // 2. presigned URL 요청
      const response = await fetch(
        `${apiEndpoint}?key=${encodeURIComponent(fileName)}`
      );

      if (!response.ok) {
        const errorText = (await response.text()) || "";
        throw new Error(
          `Failed to get presigned URL: ${response.statusText}, ${errorText}`
        );
      }

      const responseData = await response.json();
      const { presignedUrl, publicUrl } = responseData;

      // 🔒 보안: S3 URL 검증 (SSRF 방지)
      const validatedPresignedUrl = validateS3Url(presignedUrl, "presignedUrl");
      const validatedPublicUrl = validateS3Url(publicUrl, "publicUrl");

      // 3. S3에 업로드
      const uploadResponse = await fetch(validatedPresignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
      }

      // 4. 공개 URL 반환
      return validatedPublicUrl;
    } catch (error) {
      console.error("S3 upload failed:", error);
      throw error;
    }
  };
};
