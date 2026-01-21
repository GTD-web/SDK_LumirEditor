/**
 * 보안 및 성능 제한 상수
 */

/** 최대 파일 크기: 10MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** 업로드 타임아웃: 30초 */
export const UPLOAD_TIMEOUT = 30000;

/** 허용된 이미지 MIME 타입 (SVG 제외) */
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
]);

/** 차단된 파일 확장자 */
export const BLOCKED_EXTENSIONS = [".svg", ".svgz"];

/** 허용된 이미지 확장자 */
export const ALLOWED_IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".bmp",
];
