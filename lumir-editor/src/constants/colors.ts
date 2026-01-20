/**
 * 색상 팔레트 상수
 * BlockNote 기본 색상 팔레트와 일치
 */

export interface ColorItem {
  name: string;
  value: string;
  hex: string;
}

/**
 * 텍스트 색상 팔레트
 */
export const TEXT_COLORS: ColorItem[] = [
  { name: "기본", value: "default", hex: "#3f3f3f" },
  { name: "회색", value: "gray", hex: "#9b9a97" },
  { name: "갈색", value: "brown", hex: "#64473a" },
  { name: "빨간색", value: "red", hex: "#e03e3e" },
  { name: "주황색", value: "orange", hex: "#d9730d" },
  { name: "노란색", value: "yellow", hex: "#dfab01" },
  { name: "초록색", value: "green", hex: "#4d6461" },
  { name: "파란색", value: "blue", hex: "#0b6e99" },
  { name: "보라색", value: "purple", hex: "#6940a5" },
  { name: "분홍색", value: "pink", hex: "#ad1a72" },
];

/**
 * 배경 색상 팔레트
 */
export const BACKGROUND_COLORS: ColorItem[] = [
  { name: "기본", value: "default", hex: "transparent" },
  { name: "회색", value: "gray", hex: "#ebeced" },
  { name: "갈색", value: "brown", hex: "#e9e5e3" },
  { name: "빨간색", value: "red", hex: "#fbe4e4" },
  { name: "주황색", value: "orange", hex: "#f6e9d9" },
  { name: "노란색", value: "yellow", hex: "#fbf3db" },
  { name: "초록색", value: "green", hex: "#ddedea" },
  { name: "파란색", value: "blue", hex: "#ddebf1" },
  { name: "보라색", value: "purple", hex: "#eae4f2" },
  { name: "분홍색", value: "pink", hex: "#f4dfeb" },
];

/**
 * 색상 값으로 hex 색상 코드 찾기
 */
export const getHexFromColorValue = (
  value: string,
  type: "text" | "background"
): string => {
  const colors = type === "text" ? TEXT_COLORS : BACKGROUND_COLORS;
  const colorItem = colors.find((c) => c.value === value);
  return colorItem?.hex || (type === "text" ? "#000000" : "transparent");
};
