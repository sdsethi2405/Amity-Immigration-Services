import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Amity Immigration Services — migration agent Melbourne";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Brand tokens mirrored from app/globals.css (:root). */
const BRAND = {
  bg: "#faf8f5",
  fg: "#1f1b16",
  primary: "#14110e",
  muted: "#6b635a",
  gold: "#b08d57",
  red: "#7b1e2b",
} as const;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BRAND.bg,
          color: BRAND.fg,
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 4,
              backgroundColor: BRAND.gold,
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: BRAND.muted,
            }}
          >
            Registered migration agent
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 1.1,
              color: BRAND.primary,
              maxWidth: 900,
            }}
          >
            Amity Immigration Services
          </div>
          <div
            style={{
              fontSize: 28,
              color: BRAND.muted,
              maxWidth: 760,
              lineHeight: 1.35,
            }}
          >
            Australian visa advice from Bundoora, Melbourne · MARN 964861
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${BRAND.gold}55`,
            paddingTop: 24,
            fontSize: 22,
            color: BRAND.muted,
          }}
        >
          <span>59 Settlement Road, Bundoora VIC 3083</span>
          <span style={{ color: BRAND.red }}>Victoria</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
