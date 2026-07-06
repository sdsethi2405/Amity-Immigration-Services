import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visa Sub-Classes",
  description:
    "Browse Australian visa sub-classes by stream. Filter skilled, family, business, and other pathways.",
};

export default function VisaSubClassesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl font-semibold">Visa Sub-Classes</h1>
      {/* TODO(Stage 5): subclass-directory — client-side stream filter, ?stream= deep links */}
    </div>
  );
}
