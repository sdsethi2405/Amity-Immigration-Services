import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights on Australian visas, migration pathways, and policy updates.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl font-semibold">Blog</h1>
      {/* TODO(Stage 5): published posts index from DB */}
    </div>
  );
}
