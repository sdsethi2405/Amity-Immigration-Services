import type { Metadata } from "next";
import { JourneyHero } from "@/components/shared/journey-hero";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Registered migration agent in Bundoora, Melbourne. The registered agent you meet is the one who runs your case.",
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      {/* TODO(Stage 5): hero section — DB headline/subhead + JourneyHero */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            Amity Immigration Services
          </h1>
          <p className="text-lg text-muted-foreground">
            The registered agent you meet is the one who runs your case.
          </p>
        </div>
        <JourneyHero />
      </section>
      {/* TODO(Stage 5): streams-overview, why-amity, featured-services, latest-insights, cta-band */}
    </div>
  );
}
