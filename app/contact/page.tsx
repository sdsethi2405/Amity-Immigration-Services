import type { Metadata } from "next";

import { ContactIntroSection } from "@/components/sections/contact-intro";
import { EnquiryFormSection } from "@/components/sections/enquiry-form";
import { MapAndDetailsSection } from "@/components/sections/map-and-details";
import { parseIntroBlock } from "@/lib/content/blocks";
import { getContactDetails, getPageBySlug } from "@/lib/db/queries";

export async function generateMetadata(): Promise<Metadata> {
  const contactPage = await getPageBySlug("contact");

  return {
    title: contactPage?.meta_title ?? contactPage?.title ?? "Contact",
    description:
      contactPage?.meta_description ??
      "Book a consultation with Amity Immigration Services in Bundoora, Melbourne.",
  };
}

export default async function ContactPage() {
  const [contactPage, contact] = await Promise.all([
    getPageBySlug("contact"),
    getContactDetails(),
  ]);

  const blocks = contactPage?.blocks ?? [];
  const intro = parseIntroBlock(blocks, "contact-intro");

  return (
    <>
      {intro ? <ContactIntroSection content={intro} /> : null}
      <EnquiryFormSection />
      <MapAndDetailsSection contact={contact} />
    </>
  );
}
