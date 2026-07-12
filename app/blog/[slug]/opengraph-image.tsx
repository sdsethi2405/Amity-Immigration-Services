import { ImageResponse } from "next/og";

import { getPostBySlug } from "@/lib/db/queries";

export const runtime = "edge";
export const alt = "Amity Immigration Services insight";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = {
  bg: "#faf8f5",
  fg: "#1f1b16",
  primary: "#14110e",
  muted: "#6b635a",
  gold: "#b08d57",
} as const;

type ImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostOpenGraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.title ?? "Amity Immigration Services";
  const excerpt = post?.excerpt ?? "Insights on Australian visas and migration pathways.";

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
          padding: "56px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: BRAND.gold,
          }}
        >
          Amity Immigration Services · Insights
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: title.length > 70 ? 44 : 54,
              fontWeight: 600,
              lineHeight: 1.15,
              color: BRAND.primary,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              color: BRAND.muted,
              maxWidth: 920,
              lineHeight: 1.4,
            }}
          >
            {excerpt.length > 160 ? `${excerpt.slice(0, 157)}…` : excerpt}
          </div>
        </div>

        <div style={{ fontSize: 20, color: BRAND.muted }}>
          Registered migration agent · Bundoora, Melbourne
        </div>
      </div>
    ),
    { ...size },
  );
}
