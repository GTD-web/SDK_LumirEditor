"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { DefaultPartialBlock } from "@lumir-company/editor";

// SSR 비활성화로 에디터 동적 로드
const LumirEditor = dynamic(
  () =>
    import("@lumir-company/editor").then((m) => ({ default: m.LumirEditor })),
  { ssr: false }
);

export default function Home() {
  const [content, setContent] = useState<DefaultPartialBlock[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* 제목 */}
        <h1 className="text-2xl font-bold mb-6">🖼️ S3 이미지 업로드 테스트</h1>

        <div>
          <span>입력창</span>
          <input type="text" value={inputValue} onChange={handleInputChange} />
        </div>

        {/* 에디터 */}
        <div className="w-full h-[500px] rounded-lg">
          <LumirEditor
            s3Upload={{
              apiEndpoint: "/api/s3/presigned",
              env: "development",
              path: "test",
              fileNameTransform: (originalName, file) => {
                return `${inputValue}`;
              },
              appendUUID: true,
            }}
            onContentChange={setContent}
            className="h-full"
            initialContent="이미지를 업로드해보세요! 🚀"
          />
        </div>

        {/* 콘텐츠 미리보기 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold mb-2">
            콘텐츠: {content.length}개 블록
          </h2>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
