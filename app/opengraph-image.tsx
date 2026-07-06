import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Amity Immigration Services";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#faf8f5",
          color: "#14110e",
          padding: "64px",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 600,
            marginBottom: 16,
            fontFamily: "serif",
          }}
        >
          Amity Immigration Services
        </div>
        <div style={{ fontSize: 28, color: "#6b635a" }}>
          Registered migration agent · Bundoora, Melbourne
        </div>
      </div>
    ),
    { ...size },
  );
}
