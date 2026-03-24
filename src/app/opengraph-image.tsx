import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NovelKing - AI 소설 창작 도구";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19 7-7 3 3-7 7-3-3z" />
            <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="m2 2 7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
          <span
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            NovelKing
          </span>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#94a3b8",
            marginBottom: "48px",
          }}
        >
          AI 소설 창작 도구
        </div>
        <div
          style={{
            fontSize: "36px",
            color: "#e2e8f0",
            fontWeight: "600",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: "1.4",
          }}
        >
          아이디어 하나로 소설을 완성하세요
        </div>
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "40px",
            color: "#64748b",
            fontSize: "18px",
          }}
        >
          <span>소설 마법사</span>
          <span>|</span>
          <span>AI 에디터</span>
          <span>|</span>
          <span>캐릭터 관리</span>
          <span>|</span>
          <span>세계관 설정</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
