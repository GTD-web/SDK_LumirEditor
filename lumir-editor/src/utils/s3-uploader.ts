export interface S3UploaderConfig {
  apiEndpoint: string; // '/api/s3/presigned'(필수)
  env: "production" | "development"; // 환경 (필수)
  path: string; // 파일 경로 (필수)
  /** 파일명 변환 콜백 - 업로드 전 파일명을 변경할 수 있습니다 */
  fileNameTransform?: (originalName: string, file: File) => string;
  /** true일 경우 파일명 뒤에 UUID를 자동으로 추가합니다 (예: image_abc123.png) */
  appendUUID?: boolean;
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
  const { apiEndpoint, env, path, fileNameTransform, appendUUID } = config;

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
    let filename = file.name;

    // 1. 사용자 정의 파일명 변환 콜백 적용
    if (fileNameTransform) {
      filename = fileNameTransform(filename, file);
    }

    // 2. UUID 자동 추가 (appendUUID가 true인 경우)
    if (appendUUID) {
      filename = appendUUIDToFileName(filename);
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

      // 3. S3에 업로드
      const uploadResponse = await fetch(presignedUrl, {
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
      return publicUrl;
    } catch (error) {
      console.error("S3 upload failed:", error);
      throw error;
    }
  };
};
