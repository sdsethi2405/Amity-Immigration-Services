import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Migration services for skilled, partner, family, and business visa matters.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl font-semibold">Services</h1>
      {/* TODO(Stage 5): services-intro, services-list, visa-streams-callout, cta-band */}
    </div>
  );
}
