"use client";

// 컴포넌트 및 유틸리티 export
export {
  default as LumirEditor,
  ContentUtils,
  EditorConfig,
} from "./components/LumirEditor";
export { cn } from "./utils/cn";
export { createS3Uploader } from "./utils/s3-uploader";
export { HtmlPreviewBlock, schema as HtmlPreviewSchema } from "./blocks/HtmlPreview";

// FloatingMenu 및 관련 컴포넌트 export
export { FloatingMenu } from "./components/FloatingMenu";

// 에러 클래스 export
export { LumirEditorError } from "./errors/LumirEditorError";
export type { LumirErrorCode, LumirErrorDetails } from "./errors/LumirEditorError";

// 색상 상수 export
export {
  TEXT_COLORS,
  BACKGROUND_COLORS,
  getHexFromColorValue,
} from "./constants/colors";
export type { ColorItem } from "./constants/colors";

// 타입 export (별도 파일에서 관리)
export type {
  LumirEditorProps,
  EditorType,
  DefaultPartialBlock,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  PartialBlock,
  BlockNoteEditor,
} from "./types";
export type { S3UploaderConfig } from "./utils/s3-uploader";
