import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * S3 이미지 삭제 API
 *
 * DELETE /api/s3/delete
 * Body: { url: string } 또는 Query: ?url=...
 *
 * 주의사항:
 * - 실제 프로덕션에서는 권한 검증 필수 (인증/인가)
 * - 참조 카운트 확인 권장 (다른 문서에서 사용 중인지)
 * - 삭제 로그 기록 권장
 */
export async function DELETE(req: NextRequest) {
  try {
    // URL에서 또는 Body에서 삭제할 이미지 URL 가져오기
    const { searchParams } = new URL(req.url);
    let imageUrl = searchParams.get("url");

    // Body에서 가져오기 시도
    if (!imageUrl) {
      try {
        const body = await req.json();
        imageUrl = body.url;
      } catch {
        // Body 파싱 실패 무시
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "url is required" },
        { status: 400 }
      );
    }

    // URL에서 S3 키 추출
    const key = extractKeyFromUrl(imageUrl);

    if (!key) {
      return NextResponse.json(
        { error: "Invalid S3 URL format" },
        { status: 400 }
      );
    }

    // S3에서 삭제
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    });

    await s3.send(command);

    console.log(`[S3 Delete] Successfully deleted: ${key}`);

    return NextResponse.json({
      success: true,
      deletedKey: key,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("[S3 Delete] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * S3 URL에서 키(경로) 추출
 *
 * 예시:
 * https://bucket.s3.region.amazonaws.com/development/test/image.png
 * -> development/test/image.png
 */
function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // 맨 앞의 '/' 제거
    const key = pathname.startsWith("/") ? pathname.slice(1) : pathname;

    if (!key) {
      return null;
    }

    return decodeURIComponent(key);
  } catch {
    return null;
  }
}

/**
 * 사용 예시
 *
 * // 1. DELETE 요청으로 이미지 삭제
 * const res = await fetch(`/api/s3/delete?url=${encodeURIComponent(imageUrl)}`, {
 *   method: "DELETE",
 * });
 *
 * // 또는 Body로 전송
 * const res = await fetch('/api/s3/delete', {
 *   method: "DELETE",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ url: imageUrl }),
 * });
 *
 * const { success, deletedKey } = await res.json();
 */
