import type { Metadata } from "next";

import { CredentialsSection } from "@/components/sections/credentials";
import { CtaBandSection } from "@/components/sections/cta-band";
import { FirmStorySection } from "@/components/sections/firm-story";
import { GoogleReviewsEmbed } from "@/components/sections/google-reviews-embed";
import { TeamGridSection } from "@/components/sections/team-grid";
import {
  parseCredentialsBlock,
  parseCtaBandBlock,
  parseIntroBlock,
  parseSectionTitle,
} from "@/lib/content/blocks";
import {
  getGoogleReviewsEmbedUrl,
  getPageBySlug,
  getPublishedTeamMembers,
} from "@/lib/db/queries";
import { formatPageTitle } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const aboutPage = await getPageBySlug("about");

  return {
    title: formatPageTitle(
      aboutPage?.meta_title ?? aboutPage?.title ?? "About",
    ),
    description:
      aboutPage?.meta_description ??
      "Learn about Amity Immigration Services — a registered migration agent based in Bundoora, Melbourne.",
  };
}

export default async function AboutPage() {
  const [aboutPage, members, reviewsUrl] = await Promise.all([
    getPageBySlug("about"),
    getPublishedTeamMembers(),
    getGoogleReviewsEmbedUrl(),
  ]);

  const blocks = aboutPage?.blocks ?? [];
  const firmStory = parseIntroBlock(blocks, "firm-story");
  const teamTitle = parseSectionTitle(blocks, "team-grid");
  const credentials = parseCredentialsBlock(blocks);
  const ctaBand = parseCtaBandBlock(blocks);

  return (
    <>
      {firmStory ? <FirmStorySection content={firmStory} /> : null}
      <TeamGridSection members={members} title={teamTitle} />
      {credentials ? <CredentialsSection content={credentials} /> : null}
      {reviewsUrl ? <GoogleReviewsEmbed embedUrl={reviewsUrl} /> : null}
      {ctaBand ? <CtaBandSection content={ctaBand} /> : null}
    </>
  );
}
