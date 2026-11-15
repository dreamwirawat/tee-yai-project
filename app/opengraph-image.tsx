import { ImageResponse } from "next/og";

export const alt = "Suki Tee Yai — from 279 NET, 7 branches";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Latin-only copy: the default OG font has no Thai glyphs.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #781722 0%, #b51f2b 60%, #d9824b 100%)",
          color: "#fff8ed",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#ffd98d" }}>GOOD FOOD, GOOD MOOD</div>
        <div style={{ fontSize: 112, fontWeight: 800, marginTop: 12 }}>SUKI TEE YAI</div>
        <div style={{ fontSize: 40, marginTop: 16 }}>From ฿279 NET • 7 branches</div>
      </div>
    ),
    size,
  );
}
