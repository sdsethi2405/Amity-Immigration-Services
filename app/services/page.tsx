import type { Metadata } from "next";

import { CtaBandSection } from "@/components/sections/cta-band";
import { ServicesIntroSection } from "@/components/sections/services-intro";
import { ServicesListSection } from "@/components/sections/services-list";
import { VisaStreamsCalloutSection } from "@/components/sections/visa-streams-callout";
import {
  parseCalloutBlock,
  parseCtaBandBlock,
  parseIntroBlock,
  parseSectionTitle,
} from "@/lib/content/blocks";
import { getPageBySlug, getPublishedServices } from "@/lib/db/queries";
import { LOCAL_SEO_KEYWORDS } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const servicesPage = await getPageBySlug("services");

  return {
    title: servicesPage?.meta_title ?? servicesPage?.title ?? "Services",
    description:
      servicesPage?.meta_description ??
      "Migration services for skilled, partner, family, and business visa matters across Melbourne and Victoria.",
    keywords: [...LOCAL_SEO_KEYWORDS],
  };
}

export default async function ServicesPage() {
  const [servicesPage, services] = await Promise.all([
    getPageBySlug("services"),
    getPublishedServices(),
  ]);

  const blocks = servicesPage?.blocks ?? [];
  const intro = parseIntroBlock(blocks, "services-intro");
  const listTitle = parseSectionTitle(blocks, "services-list");
  const streamsCallout = parseCalloutBlock(blocks, "visa-streams-callout");
  const ctaBand = parseCtaBandBlock(blocks);

  return (
    <>
      {intro ? <ServicesIntroSection content={intro} /> : null}
      <ServicesListSection services={services} title={listTitle} />
      {streamsCallout ? (
        <VisaStreamsCalloutSection content={streamsCallout} />
      ) : null}
      {ctaBand ? <CtaBandSection content={ctaBand} /> : null}
    </>
  );
}
