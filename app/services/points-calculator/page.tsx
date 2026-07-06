import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Points Calculator",
  description:
    "Indicative GSM points estimate. Verify your score with the Department of Home Affairs.",
};

export default function PointsCalculatorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl font-semibold">Points Calculator</h1>
      {/* TODO(Stage 5): points-calculator client component + mandatory disclaimer */}
    </div>
  );
}
