import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalContentSection } from "@/components/sections/legal-content";
import { getLegalPages, getPageBySlug } from "@/lib/db/queries";

type LegalPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const pages = await getLegalPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: LegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return { title: "Page not found" };
  }

  return {
    title: page.meta_title ?? page.title,
    description: page.meta_description ?? undefined,
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || !["privacy", "terms"].includes(slug)) {
    notFound();
  }

  return <LegalContentSection page={page} />;
}
