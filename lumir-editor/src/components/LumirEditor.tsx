"use client";

import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import {
  useCreateBlockNote,
  SideMenu as BlockSideMenu,
  SideMenuController,
  DragHandleButton,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { cn } from "../utils/cn";

import type { DefaultPartialBlock, LumirEditorProps } from "../types";

import { createS3Uploader } from "../utils/s3-uploader";
import { schema } from "../blocks/HtmlPreview";
import { FloatingMenu } from "./FloatingMenu";
import { LumirEditorError } from "../errors/LumirEditorError";

// ==========================================
// 유틸리티 클래스들
// ==========================================

/**
 * 콘텐츠 관리 유틸리티
 * 기본 블록 생성 및 콘텐츠 검증 로직을 담당
 */
export class ContentUtils {
  /**
   * JSON 문자열의 유효성을 검증합니다
   * @param jsonString 검증할 JSON 문자열
   * @returns 유효한 JSON 문자열인지 여부
   */
  static isValidJSONString(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  }

  /**
   * JSON 문자열을 DefaultPartialBlock 배열로 파싱합니다
   * @param jsonString JSON 문자열
   * @returns 파싱된 블록 배열 또는 null (파싱 실패 시)
   */
  static parseJSONContent(jsonString: string): DefaultPartialBlock[] | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        return parsed as DefaultPartialBlock[];
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 기본 paragraph 블록 생성
   * @returns 기본 설정이 적용된 DefaultPartialBlock
   */
  static createDefaultBlock(): DefaultPartialBlock {
    return {
      type: "paragraph",
      props: {
        textColor: "default",
        backgroundColor: "default",
        textAlignment: "left",
      },
      content: [{ type: "text", text: "", styles: {} }],
      children: [],
    };
  }

  /**
   * 콘텐츠 유효성 검증 및 기본값 설정
   * @param content 사용자 제공 콘텐츠 (객체 배열 또는 JSON 문자열)
   * @param emptyBlockCount 빈 블록 개수 (기본값: 3)
   * @returns 검증된 콘텐츠 배열
   */
  static validateContent(
    content?: DefaultPartialBlock[] | string,
    emptyBlockCount: number = 3
  ): DefaultPartialBlock[] {
    // 1. 문자열인 경우 JSON 파싱 시도
    if (typeof content === "string") {
      if (content.trim() === "") {
        return this.createEmptyBlocks(emptyBlockCount);
      }

      const parsedContent = this.parseJSONContent(content);
      if (parsedContent && parsedContent.length > 0) {
        return parsedContent;
      }

      // 파싱 실패 시 빈 블록 생성
      return this.createEmptyBlocks(emptyBlockCount);
    }

    // 2. 배열인 경우 기존 로직
    if (!content || content.length === 0) {
      return this.createEmptyBlocks(emptyBlockCount);
    }

    return content;
  }

  /**
   * 빈 블록들을 생성합니다
   * @param emptyBlockCount 생성할 블록 개수
   * @returns 생성된 빈 블록 배열
   */
  private static createEmptyBlocks(
    emptyBlockCount: number
  ): DefaultPartialBlock[] {
    return Array.from({ length: emptyBlockCount }, () =>
      this.createDefaultBlock()
    );
  }
}

/**
 * 에디터 설정 관리 유틸리티
 * 각종 설정의 기본값과 검증 로직을 담당
 */
export class EditorConfig {
  /**
   * 테이블 설정 기본값 적용
   * @param userTables 사용자 테이블 설정
   * @returns 기본값이 적용된 테이블 설정
   */
  static getDefaultTableConfig(userTables?: LumirEditorProps["tables"]) {
    return {
      splitCells: userTables?.splitCells ?? true,
      cellBackgroundColor: userTables?.cellBackgroundColor ?? true,
      cellTextColor: userTables?.cellTextColor ?? true,
      headers: userTables?.headers ?? true,
    };
  }

  /**
   * 헤딩 설정 기본값 적용
   * @param userHeading 사용자 헤딩 설정
   * @returns 기본값이 적용된 헤딩 설정
   */
  static getDefaultHeadingConfig(userHeading?: LumirEditorProps["heading"]) {
    return userHeading?.levels && userHeading.levels.length > 0
      ? userHeading
      : { levels: [1, 2, 3, 4, 5, 6] as (1 | 2 | 3 | 4 | 5 | 6)[] };
  }

  /**
   * 비활성화할 확장 기능 목록 생성
   * @param userExtensions 사용자 정의 비활성 확장
   * @param allowVideo 비디오 업로드 허용 여부
   * @param allowAudio 오디오 업로드 허용 여부
   * @param allowFile 일반 파일 업로드 허용 여부
   * @returns 비활성화할 확장 기능 목록
   */
  static getDisabledExtensions(
    userExtensions?: string[],
    allowVideo = false,
    allowAudio = false,
    allowFile = false
  ): string[] {
    const set = new Set<string>(userExtensions ?? []);
    if (!allowVideo) set.add("video");
    if (!allowAudio) set.add("audio");
    if (!allowFile) set.add("file");
    return Array.from(set);
  }
}

// 파일 타입 검증 함수
const isImageFile = (file: File): boolean => {
  return (
    file.size > 0 &&
    (file.type?.startsWith("image/") ||
      (!file.type && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name || "")))
  );
};

const isHtmlFile = (file: File): boolean => {
  return (
    file.size > 0 &&
    (file.type === "text/html" ||
      file.name?.toLowerCase().endsWith(".html") ||
      file.name?.toLowerCase().endsWith(".htm"))
  );
};

export default function LumirEditor({
  // editor options
  initialContent,
  initialEmptyBlocks = 3,
  uploadFile,
  s3Upload,
  tables,
  heading,
  defaultStyles = true,
  disableExtensions,
  tabBehavior = "prefer-navigate-ui",
  trailingBlock = true,
  allowVideoUpload = false,
  allowAudioUpload = false,
  allowFileUpload = false,
  // view options
  editable = true,
  theme = "light",
  formattingToolbar = true,
  linkToolbar = true,
  sideMenu = true,
  emojiPicker = true,
  filePanel = true,
  tableHandles = true,
  onSelectionChange,
  className = "",
  sideMenuAddButton = false,
  floatingMenu = false,
  floatingMenuPosition = "sticky",
  // callbacks / refs
  onContentChange,
  onError,
}: LumirEditorProps) {
  // 이미지 업로드 로딩 상태
  const [isUploading, setIsUploading] = useState(false);
  // 에러 상태 (사용자에게 표시할 에러 메시지)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 에러 처리 핸들러
  const handleError = useCallback(
    (error: LumirEditorError) => {
      // 콜백이 있으면 호출
      onError?.(error);
      // 사용자에게 에러 메시지 표시
      setErrorMessage(error.getUserMessage());
      // 3초 후 에러 메시지 자동 숨김
      setTimeout(() => setErrorMessage(null), 3000);
    },
    [onError]
  );
  const validatedContent = useMemo<DefaultPartialBlock[]>(() => {
    return ContentUtils.validateContent(initialContent, initialEmptyBlocks);
  }, [initialContent, initialEmptyBlocks]);

  // 테이블 설정 메모이제이션
  const tableConfig = useMemo(() => {
    return EditorConfig.getDefaultTableConfig(tables);
  }, [
    tables?.splitCells,
    tables?.cellBackgroundColor,
    tables?.cellTextColor,
    tables?.headers,
  ]);

  // 헤딩 설정 메모이제이션
  const headingConfig = useMemo(() => {
    return EditorConfig.getDefaultHeadingConfig(heading);
  }, [heading?.levels?.join(",") ?? ""]);

  // 비활성화 확장 메모이제이션
  const disabledExtensions = useMemo(() => {
    return EditorConfig.getDisabledExtensions(
      disableExtensions,
      allowVideoUpload,
      allowAudioUpload,
      allowFileUpload
    );
  }, [disableExtensions, allowVideoUpload, allowAudioUpload, allowFileUpload]);

  // fileNameTransform 콜백을 ref로 관리 (에디터 재생성 방지)
  const fileNameTransformRef = useRef(s3Upload?.fileNameTransform);
  useEffect(() => {
    fileNameTransformRef.current = s3Upload?.fileNameTransform;
  }, [s3Upload?.fileNameTransform]);

  // S3 업로드 설정 메모이제이션 (객체 참조 안정화)
  // 주의: fileNameTransform은 ref로 관리하므로 의존성에서 제외
  const memoizedS3Upload = useMemo(() => {
    if (!s3Upload) return undefined;
    return {
      apiEndpoint: s3Upload.apiEndpoint,
      env: s3Upload.env,
      path: s3Upload.path,
      appendUUID: s3Upload.appendUUID,
      preserveExtension: s3Upload.preserveExtension,
      // 최신 콜백을 항상 사용하도록 ref를 통해 접근
      fileNameTransform: ((originalName: string, file: File) => {
        return fileNameTransformRef.current
          ? fileNameTransformRef.current(originalName, file)
          : originalName;
      }) as ((originalName: string, file: File) => string) | undefined,
    };
  }, [
    s3Upload?.apiEndpoint,
    s3Upload?.env,
    s3Upload?.path,
    s3Upload?.appendUUID,
    s3Upload?.preserveExtension,
  ]);

  const editor = useCreateBlockNote(
    {
      // HTML 미리보기 블록이 포함된 커스텀 스키마 사용
      schema,
      initialContent: validatedContent as any,
      tables: tableConfig,
      heading: headingConfig,
      animations: false, // 기본적으로 애니메이션 비활성화
      defaultStyles,
      // 확장 비활성: 비디오/오디오/파일 제어
      disableExtensions: disabledExtensions,
      tabBehavior,
      trailingBlock,
      uploadFile: async (file) => {
        // 이미지 파일만 허용 (이미지 전용 에디터)
        if (!isImageFile(file)) {
          const error = LumirEditorError.invalidFileType(file.name);
          handleError(error);
          throw error;
        }

        try {
          let imageUrl: string;

          // 1. 사용자 정의 uploadFile 우선
          if (uploadFile) {
            imageUrl = await uploadFile(file);
          }
          // 2. S3 업로드 (uploadFile 없을 때)
          else if (memoizedS3Upload?.apiEndpoint) {
            const s3Uploader = createS3Uploader(memoizedS3Upload);
            imageUrl = await s3Uploader(file);
          }
          // 3. 업로드 방법이 없으면 에러
          else {
            const error = LumirEditorError.s3ConfigError(
              "No upload method available. Please provide uploadFile or s3Upload configuration."
            );
            handleError(error);
            throw error;
          }

          // BlockNote가 자동으로 이미지 블록을 생성하도록 URL만 반환
          return imageUrl;
        } catch (error) {
          // 이미 LumirEditorError인 경우 다시 처리하지 않음
          if (error instanceof LumirEditorError) {
            throw error;
          }
          const lumirError = LumirEditorError.uploadFailed(
            error instanceof Error ? error.message : String(error),
            error instanceof Error ? error : undefined
          );
          handleError(lumirError);
          throw lumirError;
        }
      },
      pasteHandler: (ctx) => {
        const { event, editor, defaultPasteHandler } = ctx as any;
        const fileList =
          (event?.clipboardData?.files as FileList | null) ?? null;
        const files: File[] = fileList ? Array.from(fileList) : [];
        const acceptedFiles: File[] = files.filter(isImageFile);

        // 파일이 있지만 이미지가 없으면 기본 처리 막고 무시
        if (files.length > 0 && acceptedFiles.length === 0) {
          event.preventDefault();
          return true;
        }

        // 이미지가 없으면 기본 처리
        if (acceptedFiles.length === 0) {
          return defaultPasteHandler() ?? false;
        }

        event.preventDefault();
        (async () => {
          // 붙여넣기로 여러 이미지 업로드 시 로딩 상태 관리
          setIsUploading(true);
          try {
            for (const file of acceptedFiles) {
              try {
                // 에디터의 uploadFile 함수 사용 (통일된 로직)
                const url = await editor.uploadFile(file);
                editor.pasteHTML(`<img src="${url}" alt="image" />`);
              } catch (err) {
                console.warn(
                  "Image upload failed, skipped:",
                  file.name || "",
                  err
                );
              }
            }
          } finally {
            setIsUploading(false);
          }
        })();
        return true;
      },
    },
    [
      validatedContent,
      tableConfig,
      headingConfig,
      defaultStyles,
      disabledExtensions,
      tabBehavior,
      trailingBlock,
      uploadFile,
      memoizedS3Upload,
    ]
  );

  // 편집 가능 여부 설정
  useEffect(() => {
    if (editor) {
      editor.isEditable = editable;
    }
  }, [editor, editable]);

  // 콘텐츠 변경 감지
  useEffect(() => {
    if (!editor || !onContentChange) return;

    const handleContentChange = () => {
      // BlockNote의 올바른 API 사용
      const blocks = editor.topLevelBlocks as DefaultPartialBlock[];
      onContentChange(blocks);
    };

    return editor.onEditorContentChange(handleContentChange);
  }, [editor, onContentChange]);

  // 드래그앤드롭 이미지/HTML 처리
  useEffect(() => {
    const el = editor?.domElement as HTMLElement | undefined;
    if (!el) return;

    const handleDragOver = (e: DragEvent) => {
      if (e.defaultPrevented) return;
      const hasFiles = (
        e.dataTransfer?.types as unknown as string[] | undefined
      )?.includes?.("Files");
      if (hasFiles) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      const hasFiles = (
        (e.dataTransfer.types as unknown as string[] | undefined) ?? []
      ).includes("Files");
      if (!hasFiles) return;

      e.preventDefault();
      e.stopPropagation();

      const items = Array.from(e.dataTransfer.items ?? []);
      const files = items
        .filter((it) => it.kind === "file")
        .map((it) => it.getAsFile())
        .filter((f): f is File => !!f);

      // 이미지 파일과 HTML 파일 분리
      const imageFiles = files.filter(isImageFile);
      const htmlFiles = files.filter(isHtmlFile);

      if (imageFiles.length === 0 && htmlFiles.length === 0) return;

      (async () => {
        setIsUploading(true);
        try {
          // 이미지 파일 처리
          for (const file of imageFiles) {
            try {
              if (editor?.uploadFile) {
                const url = await editor.uploadFile(file);
                if (url) {
                  editor.pasteHTML(`<img src="${url}" alt="image" />`);
                }
              }
            } catch (err) {
              console.warn(
                "Image upload failed, skipped:",
                file.name || "",
                err
              );
            }
          }

          // HTML 파일 처리 - htmlPreview 블록으로 삽입
          for (const file of htmlFiles) {
            try {
              const htmlContent = await file.text();
              const currentBlock = editor.getTextCursorPosition().block;

              // htmlPreview 블록 삽입
              editor.insertBlocks(
                [
                  {
                    type: "htmlPreview",
                    props: {
                      htmlContent: htmlContent,
                      fileName: file.name,
                      height: "400px",
                    },
                  },
                ],
                currentBlock,
                "after"
              );
            } catch (err) {
              console.warn(
                "HTML file processing failed, skipped:",
                file.name || "",
                err
              );
            }
          }
        } finally {
          setIsUploading(false);
        }
      })();
    };

    el.addEventListener("dragover", handleDragOver, { capture: true });
    el.addEventListener("drop", handleDrop, { capture: true });

    return () => {
      el.removeEventListener("dragover", handleDragOver, {
        capture: true,
      } as any);
      el.removeEventListener("drop", handleDrop, { capture: true } as any);
    };
  }, [editor]);

  // SideMenu 설정 (Add 버튼 제어)
  const computedSideMenu = useMemo(() => {
    return sideMenuAddButton ? sideMenu : false;
  }, [sideMenuAddButton, sideMenu]);

  // Add 버튼 없는 사이드 메뉴 (드래그 핸들만) - 메모이제이션
  const DragHandleOnlySideMenu = useMemo(() => {
    return (props: any) => (
      <BlockSideMenu {...props}>
        <DragHandleButton {...props} />
      </BlockSideMenu>
    );
  }, []);

  return (
    <div
      className={cn("lumirEditor", className)}
      style={{ position: "relative", display: "flex", flexDirection: "column" }}
    >
      {/* FloatingMenu를 BlockNoteView 외부로 이동 */}
      {floatingMenu && editor && (
        <FloatingMenu
          editor={editor as any}
          position={floatingMenuPosition}
          onImageUpload={async () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file && editor.uploadFile) {
                try {
                  setIsUploading(true);
                  const url = await editor.uploadFile(file);
                  editor.insertBlocks(
                    [
                      {
                        type: "image",
                        props: { url: url as string },
                      },
                    ] as any,
                    editor.getTextCursorPosition().block,
                    "after"
                  );
                } catch (err) {
                  console.error("Image upload failed:", err);
                } finally {
                  setIsUploading(false);
                }
              }
            };
            input.click();
          }}
        />
      )}
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={theme}
        formattingToolbar={formattingToolbar}
        linkToolbar={linkToolbar}
        sideMenu={computedSideMenu}
        slashMenu={false}
        emojiPicker={emojiPicker}
        filePanel={filePanel}
        tableHandles={tableHandles}
        onSelectionChange={onSelectionChange}
      >
        {
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={useCallback(
              async (query: string) => {
                const items = getDefaultReactSlashMenuItems(editor);
                // 비디오, 오디오, 파일 관련 항목 제거
                const filtered = items.filter((item: any) => {
                  const key = (item?.key || "").toString().toLowerCase();
                  const title = (item?.title || "").toString().toLowerCase();
                  // 비디오, 오디오, 파일 관련 항목 제거
                  if (["video", "audio", "file"].includes(key)) return false;
                  if (
                    title.includes("video") ||
                    title.includes("audio") ||
                    title.includes("file")
                  )
                    return false;
                  return true;
                });

                // HTML 미리보기 슬래시 메뉴 항목 추가
                const htmlPreviewItem = {
                  title: "HTML Preview",
                  onItemClick: () => {
                    // 파일 선택 다이얼로그 열기
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".html,.htm";
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const htmlContent = await file.text();
                        const currentBlock =
                          editor.getTextCursorPosition().block;
                        editor.insertBlocks(
                          [
                            {
                              type: "htmlPreview",
                              props: {
                                htmlContent: htmlContent,
                                fileName: file.name,
                                height: "400px",
                              },
                            },
                          ],
                          currentBlock,
                          "after"
                        );
                      }
                    };
                    input.click();
                  },
                  aliases: ["html", "preview", "웹", "웹페이지"],
                  group: "Embeds",
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                  ),
                  subtext: "HTML 파일을 미리보기로 삽입",
                };

                const allItems = [...filtered, htmlPreviewItem];

                if (!query) return allItems;
                const q = query.toLowerCase();
                return allItems.filter(
                  (item: any) =>
                    item.title?.toLowerCase().includes(q) ||
                    (item.aliases || []).some((a: string) =>
                      a.toLowerCase().includes(q)
                    )
                );
              },
              [editor]
            )}
          />
        }
        {!sideMenuAddButton && (
          <SideMenuController sideMenu={DragHandleOnlySideMenu} />
        )}
      </BlockNoteView>

      {/* 이미지 업로드 로딩 스피너 */}
      {isUploading && (
        <div className="lumirEditor-upload-overlay">
          <div className="lumirEditor-spinner" />
        </div>
      )}

      {/* 에러 메시지 토스트 */}
      {errorMessage && (
        <div className="lumirEditor-error-toast">
          <span className="lumirEditor-error-icon">⚠️</span>
          <span className="lumirEditor-error-message">{errorMessage}</span>
          <button
            className="lumirEditor-error-close"
            onClick={() => setErrorMessage(null)}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
