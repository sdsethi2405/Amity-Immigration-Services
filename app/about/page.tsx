import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Amity Immigration Services — a registered migration agent based in Bundoora, Melbourne.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl font-semibold">About</h1>
      {/* TODO(Stage 5): firm-story, team-grid, credentials, cta-band */}
    </div>
  );
}
