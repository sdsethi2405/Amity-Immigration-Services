import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides and official Department of Home Affairs resources for Australian visa applicants.",
};

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl font-semibold">Resources</h1>
      {/* TODO(Stage 5): resources-intro, resource-links, points-calculator-callout */}
    </div>
  );
}
