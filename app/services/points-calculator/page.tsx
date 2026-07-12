import type { Metadata } from "next";

import { PointsCalculatorSection } from "@/components/sections/points-calculator";

export const metadata: Metadata = {
  title: "Points Calculator",
  description:
    "Indicative GSM points estimate for skilled migration. Verify your score with the Department of Home Affairs and seek registered migration advice.",
};

export default function PointsCalculatorPage() {
  return <PointsCalculatorSection />;
}
