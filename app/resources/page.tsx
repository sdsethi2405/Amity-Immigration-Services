import type { Metadata } from "next";

import { PointsCalculatorCalloutSection } from "@/components/sections/points-calculator-callout";
import { ResourceLinksSection } from "@/components/sections/resource-links";
import { ResourcesIntroSection } from "@/components/sections/resources-intro";
import {
  parseCalloutBlock,
  parseIntroBlock,
  parseResourceLinksBlock,
} from "@/lib/content/blocks";
import { getPageBySlug } from "@/lib/db/queries";

export async function generateMetadata(): Promise<Metadata> {
  const resourcesPage = await getPageBySlug("resources");

  return {
    title: resourcesPage?.meta_title ?? resourcesPage?.title ?? "Resources",
    description:
      resourcesPage?.meta_description ??
      "Guides and official Department of Home Affairs resources for Australian visa applicants.",
  };
}

export default async function ResourcesPage() {
  const resourcesPage = await getPageBySlug("resources");
  const blocks = resourcesPage?.blocks ?? [];
  const intro = parseIntroBlock(blocks, "resources-intro");
  const resourceLinks = parseResourceLinksBlock(blocks);
  const pointsCallout = parseCalloutBlock(blocks, "points-calculator-callout");

  return (
    <>
      {intro ? <ResourcesIntroSection content={intro} /> : null}
      {resourceLinks ? <ResourceLinksSection content={resourceLinks} /> : null}
      {pointsCallout ? (
        <PointsCalculatorCalloutSection content={pointsCallout} />
      ) : null}
    </>
  );
}
