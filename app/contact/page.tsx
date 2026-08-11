import type { Metadata } from "next";

import { ContactIntroSection } from "@/components/sections/contact-intro";
import { EnquiryFormSection } from "@/components/sections/enquiry-form";
import { MapAndDetailsSection } from "@/components/sections/map-and-details";
import { parseIntroBlock } from "@/lib/content/blocks";
import { getContactDetails, getPageBySlug } from "@/lib/db/queries";
import { formatPageTitle } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const contactPage = await getPageBySlug("contact");

  return {
    title: formatPageTitle(
      contactPage?.meta_title ?? contactPage?.title ?? "Contact",
    ),
    description:
      contactPage?.meta_description ??
      "Book a consultation with Amity Immigration Services in Bundoora, Melbourne.",
  };
}

type ContactPageProps = {
  searchParams: Promise<{ visa_interest?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [contactPage, contact, params] = await Promise.all([
    getPageBySlug("contact"),
    getContactDetails(),
    searchParams,
  ]);

  const blocks = contactPage?.blocks ?? [];
  const intro = parseIntroBlock(blocks, "contact-intro");
  const visaInterest = params.visa_interest?.trim() ?? "";

  return (
    <>
      {intro ? <ContactIntroSection content={intro} /> : null}
      <EnquiryFormSection defaultVisaInterest={visaInterest} />
      <MapAndDetailsSection contact={contact} />
    </>
  );
}
