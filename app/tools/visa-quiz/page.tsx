import type { Metadata } from "next";

import { VisaQuizForm } from "@/components/sections/visa-quiz";
import { formatPageTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: formatPageTitle("Visa pathway quiz"),
  description:
    "A short general quiz to suggest Australian migration pathways to discuss with a registered migration agent.",
};

export default function VisaQuizPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 md:px-6 lg:py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        Visa pathway quiz
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Answer a few general questions for suggested pathways to discuss. This
        is not an eligibility assessment and does not predict outcomes.
      </p>
      <div className="mt-10">
        <VisaQuizForm />
      </div>
    </section>
  );
}
