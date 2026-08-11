import type { Metadata } from "next";

import { PointsCalculatorSection } from "@/components/sections/points-calculator";
import { getResolvedPointsTable } from "@/lib/points-table";
import { formatPageTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: formatPageTitle("Points Calculator"),
  description:
    "Indicative GSM points estimate for skilled migration. Verify your score with the Department of Home Affairs and seek registered migration advice.",
};

export default async function PointsCalculatorPage() {
  const pointsTable = await getResolvedPointsTable();

  return <PointsCalculatorSection pointsTable={pointsTable} />;
}
