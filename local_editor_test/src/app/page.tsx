"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useCallback } from "react";
import type { DefaultPartialBlock } from "@lumir-company/editor";

// SSR 비활성화로 에디터 동적 로드
const LumirEditor = dynamic(
  () =>
    import("@lumir-company/editor").then((m) => ({ default: m.LumirEditor })),
  { ssr: false }
);

// ============================================
// 이미지 삭제 관리 (지연 삭제 방식)
// ============================================

/** 삭제 대기 이미지 정보 */
interface PendingDelete {
  url: string;
  scheduledAt: number;
  timeoutId: ReturnType<typeof setTimeout>;
}

/** 지연 삭제 시간 (밀리초) - Undo/Redo 대응 */
const DELETE_DELAY_MS = 1000;

export default function Home() {
  const [content, setContent] = useState<DefaultPartialBlock[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  // 삭제 대기열 관리
  const pendingDeletesRef = useRef<Map<string, PendingDelete>>(new Map());
  // 삭제된 이미지 로그
  const [deleteLog, setDeleteLog] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);

    // 컴포넌트 언마운트 시 대기 중인 모든 삭제 실행
    return () => {
      pendingDeletesRef.current.forEach((pending) => {
        clearTimeout(pending.timeoutId);
        // 즉시 삭제 실행
        executeDelete(pending.url);
      });
      pendingDeletesRef.current.clear();
    };
  }, []);

  /**
   * S3에서 이미지 실제 삭제 실행
   */
  const executeDelete = useCallback(async (imageUrl: string) => {
    try {
      const response = await fetch(
        `/api/s3/delete?url=${encodeURIComponent(imageUrl)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("[S3 삭제 성공]", imageUrl);
        setDeleteLog((prev) => [
          ...prev,
          `✅ 삭제됨: ${new Date().toLocaleTimeString()} - ${imageUrl.slice(-30)}...`,
        ]);
      } else {
        console.error("[S3 삭제 실패]", result.error);
        setDeleteLog((prev) => [
          ...prev,
          `❌ 실패: ${result.error} - ${imageUrl.slice(-30)}...`,
        ]);
      }
    } catch (error) {
      console.error("[S3 삭제 오류]", error);
      setDeleteLog((prev) => [
        ...prev,
        `❌ 오류: ${error} - ${imageUrl.slice(-30)}...`,
      ]);
    }
  }, []);

  /**
   * 이미지 삭제 처리 (지연 삭제)
   * - 삭제 대기열에 추가하고 일정 시간 후 실제 삭제
   * - 그 사이에 Undo로 이미지가 복원되면 삭제 취소
   */
  const handleImageDelete = useCallback(
    (imageUrl: string) => {
      console.log("[이미지 삭제 감지]", imageUrl);

      // 이미 대기 중인 삭제가 있으면 무시 (중복 방지)
      if (pendingDeletesRef.current.has(imageUrl)) {
        return;
      }

      // 지연 삭제 스케줄링
      const timeoutId = setTimeout(() => {
        // 대기열에서 제거
        pendingDeletesRef.current.delete(imageUrl);
        // 실제 삭제 실행
        executeDelete(imageUrl);
      }, DELETE_DELAY_MS);

      // 대기열에 추가
      pendingDeletesRef.current.set(imageUrl, {
        url: imageUrl,
        scheduledAt: Date.now(),
        timeoutId,
      });

      setDeleteLog((prev) => [
        ...prev,
        `⏳ 삭제 예약됨 (${DELETE_DELAY_MS / 1000}초 후): ${imageUrl.slice(-30)}...`,
      ]);
    },
    [executeDelete]
  );

  /**
   * 콘텐츠 변경 시 - 삭제 취소 로직
   * 이미지가 다시 추가되면(Undo) 예약된 삭제 취소
   */
  const handleContentChange = useCallback(
    (newContent: DefaultPartialBlock[]) => {
      setContent(newContent);

      // 현재 콘텐츠에 있는 이미지 URL 수집
      const currentImageUrls = new Set<string>();
      const extractUrls = (blocks: DefaultPartialBlock[]) => {
        blocks.forEach((block) => {
          const props = block.props as { url?: string } | undefined;
          if (block.type === "image" && props?.url) {
            currentImageUrls.add(props.url);
          }
          if (block.children) {
            extractUrls(block.children as DefaultPartialBlock[]);
          }
        });
      };
      extractUrls(newContent);

      // 대기 중인 삭제 중 다시 나타난 이미지 삭제 취소
      pendingDeletesRef.current.forEach((pending, url) => {
        if (currentImageUrls.has(url)) {
          clearTimeout(pending.timeoutId);
          pendingDeletesRef.current.delete(url);
          console.log("[삭제 취소 - Undo 감지]", url);
          setDeleteLog((prev) => [
            ...prev,
            `🔄 삭제 취소됨 (Undo): ${url.slice(-30)}...`,
          ]);
        }
      });
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 삭제 로그 초기화
  const clearDeleteLog = () => {
    setDeleteLog([]);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* 제목 */}
        <h1 className="text-2xl font-bold mb-6">
          🖼️ S3 이미지 업로드/삭제 테스트
        </h1>

        <div className="mb-4">
          <span className="mr-2">파일명 접두어:</span>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="border px-2 py-1 rounded"
            placeholder="prefix"
          />
        </div>

        {/* 에디터 */}
        <div className="w-full h-[500px] rounded-lg border">
          {isMounted && (
            <LumirEditor
              s3Upload={{
                apiEndpoint: "/api/s3/presigned",
                env: "development",
                path: "test",
                fileNameTransform: (nameWithoutExt, file) => {
                  return inputValue
                    ? `${inputValue}_${nameWithoutExt}`
                    : nameWithoutExt;
                },
                appendUUID: true,
              }}
              floatingMenu={true}
              floatingMenuPosition="sticky"
              onContentChange={handleContentChange}
              onImageDelete={handleImageDelete}
              className="h-full"
              initialContent="이미지를 업로드하고 삭제해보세요!"
            />
          )}
        </div>

        {/* 삭제 로그 */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">🗑️ 이미지 삭제 로그</h2>
            <button
              onClick={clearDeleteLog}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              로그 초기화
            </button>
          </div>
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            {deleteLog.length === 0 ? (
              <p className="text-gray-400">
                이미지 삭제 시 로그가 표시됩니다. (삭제 후 {DELETE_DELAY_MS / 1000}초 후 S3에서 실제 삭제)
              </p>
            ) : (
              deleteLog.map((log, i) => (
                <p key={i} className="font-mono">
                  {log}
                </p>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Undo (Ctrl+Z)로 이미지 복원 시 예약된 삭제가 자동 취소됩니다.
          </p>
        </div>

        {/* 콘텐츠 미리보기 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold mb-2">
            콘텐츠: {content.length}개 블록
          </h2>
          <pre className="text-xs overflow-x-auto max-h-48">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
