import type { Metadata } from "next";

import { FeeEstimateSection } from "@/components/sections/fee-estimate";
import { getFeeEstimateBands } from "@/lib/db/queries";
import { formatPageTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: formatPageTitle("Fee estimate"),
  description:
    "Indicative professional fees for registered migration agent services from Amity Immigration Services.",
};

export default async function FeeEstimatePage() {
  const bands = await getFeeEstimateBands();
  return <FeeEstimateSection bands={bands} />;
}
