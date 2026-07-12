import type { Metadata } from "next";

import { CtaBandSection } from "@/components/sections/cta-band";
import { FeaturedServicesSection } from "@/components/sections/featured-services";
import { HeroSection } from "@/components/sections/hero";
import { LatestInsightsSection } from "@/components/sections/latest-insights";
import { StreamsOverviewSection } from "@/components/sections/streams-overview";
import { WhyAmitySection } from "@/components/sections/why-amity";
import {
  parseCtaBandBlock,
  parseHeroBlock,
  parseSectionTitleBlock,
  parseStreamsOverviewBlock,
  parseWhyAmityBlock,
} from "@/lib/content/home-blocks";
import {
  getLatestPublishedPosts,
  getPageBySlug,
  getPublishedServices,
} from "@/lib/db/queries";
import { LOCAL_SEO_KEYWORDS } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await getPageBySlug("home");

  return {
    title: homePage?.meta_title ?? "Home",
    description:
      homePage?.meta_description ??
      "Registered migration agent in Bundoora, Melbourne. The registered agent you meet is the one who runs your case.",
    keywords: [...LOCAL_SEO_KEYWORDS],
  };
}

export default async function HomePage() {
  const [homePage, services, posts] = await Promise.all([
    getPageBySlug("home"),
    getPublishedServices(),
    getLatestPublishedPosts(3),
  ]);

  const blocks = homePage?.blocks ?? [];
  const hero = parseHeroBlock(blocks);
  const streamsOverview = parseStreamsOverviewBlock(blocks);
  const whyAmity = parseWhyAmityBlock(blocks);
  const featuredServicesTitle = parseSectionTitleBlock(blocks, "featured-services");
  const latestInsightsTitle = parseSectionTitleBlock(blocks, "latest-insights");
  const ctaBand = parseCtaBandBlock(blocks);

  const featuredServices = services.slice(0, 3);

  return (
    <>
      <HeroSection content={hero} />

      {streamsOverview ? (
        <StreamsOverviewSection content={streamsOverview} />
      ) : null}

      {whyAmity ? <WhyAmitySection content={whyAmity} /> : null}

      <FeaturedServicesSection
        services={featuredServices}
        title={featuredServicesTitle}
      />

      <LatestInsightsSection posts={posts} title={latestInsightsTitle} />

      {ctaBand ? <CtaBandSection content={ctaBand} /> : null}
    </>
  );
}
