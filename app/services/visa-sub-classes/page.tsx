import type { Metadata } from "next";

import { SubclassDirectorySection } from "@/components/sections/subclass-directory";
import { getPublishedVisaSubclasses } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Visa Sub-Classes",
  description:
    "Browse Australian visa sub-classes by stream. Filter skilled, family, business, and other pathways.",
};

type VisaSubClassesPageProps = {
  searchParams: Promise<{ stream?: string }>;
};

export default async function VisaSubClassesPage({
  searchParams,
}: VisaSubClassesPageProps) {
  const [{ stream }, subclasses] = await Promise.all([
    searchParams,
    getPublishedVisaSubclasses(),
  ]);

  return (
    <SubclassDirectorySection
      subclasses={subclasses}
      initialStream={stream}
    />
  );
}
