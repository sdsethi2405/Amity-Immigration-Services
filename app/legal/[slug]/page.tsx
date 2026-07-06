import type { Metadata } from "next";
import { notFound } from "next/navigation";

type LegalPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  // TODO(Stage 3): return legal page slugs from getLegalPages()
  return [{ slug: "privacy" }, { slug: "terms" }];
}

export async function generateMetadata({
  params,
}: LegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  // TODO(Stage 3): fetch page meta from DB
  return {
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    description: `${slug} — Amity Immigration Services`,
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;

  // TODO(Stage 3): fetch legal content from pages table
  if (!["privacy", "terms"].includes(slug)) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl font-semibold capitalize">
        {slug}
      </h1>
      {/* TODO(Stage 3): legal-content section — minimal motion */}
    </div>
  );
}
