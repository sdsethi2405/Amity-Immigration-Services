import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentBlockRenderer } from "@/components/shared/content-block-renderer";
import { buttonVariants } from "@/components/ui/button";
import {
  getStatusRibbonLabel,
  getStreamLabel,
} from "@/lib/content/visa-streams";
import {
  getPublishedVisaSubclasses,
  getVisaSubclassBySlug,
} from "@/lib/db/queries";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

type VisaSubclassDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const subclasses = await getPublishedVisaSubclasses();
  return subclasses.map((subclass) => ({ slug: subclass.slug }));
}

export async function generateMetadata({
  params,
}: VisaSubclassDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const subclass = await getVisaSubclassBySlug(slug);

  if (!subclass) {
    return { title: "Visa sub-class not found" };
  }

  const title = `Subclass ${subclass.subclass_number} — ${subclass.name}`;
  const description =
    subclass.eligibility_summary ??
    `Overview of Australian visa subclass ${subclass.subclass_number} from Amity Immigration Services.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function VisaSubclassDetailPage({
  params,
}: VisaSubclassDetailPageProps) {
  const { slug } = await params;
  const subclass = await getVisaSubclassBySlug(slug);

  if (!subclass) {
    notFound();
  }

  const statusLabel = getStatusRibbonLabel(subclass.status);
  const streamLabel = getStreamLabel(subclass.stream);
  const pageTitle = `Subclass ${subclass.subclass_number} — ${subclass.name}`;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Visa sub-classes", href: "/services/visa-sub-classes" },
    {
      name: pageTitle,
      href: `/services/visa-sub-classes/${subclass.slug}`,
    },
  ]);

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 lg:py-16">
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/services/visa-sub-classes?stream=${subclass.stream}`}
            className="hover:text-primary"
          >
            Visa sub-classes
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <span>{streamLabel}</span>
        </p>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-md bg-accent px-2.5 py-1 font-mono text-sm font-semibold text-accent-foreground">
              {subclass.subclass_number}
            </span>
            <span className="rounded-md border border-border px-2 py-0.5 text-xs capitalize text-muted-foreground">
              {subclass.visa_type}
            </span>
            {subclass.pr_pathway ? (
              <span className="rounded-md border border-border px-2 py-0.5 text-xs text-primary">
                PR pathway
              </span>
            ) : null}
            {statusLabel ? (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {statusLabel}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {subclass.name}
          </h1>
        </header>

        {subclass.eligibility_summary ? (
          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Eligibility overview
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {subclass.eligibility_summary}
            </p>
          </section>
        ) : null}

        {subclass.processing_context ? (
          <section className="mt-8">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Processing context
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {subclass.processing_context}
            </p>
          </section>
        ) : null}

        {subclass.body.length > 0 ? (
          <ContentBlockRenderer blocks={subclass.body} className="mt-8" />
        ) : null}

        <aside
          className="mt-10 rounded-lg border border-border bg-secondary px-5 py-4 text-sm leading-relaxed text-muted-foreground"
          role="note"
        >
          Visa criteria, streams, and application requirements change. Always
          verify current information with the{" "}
          <a
            href="https://immi.homeaffairs.gov.au/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Department of Home Affairs
          </a>{" "}
          and seek advice from a registered migration agent about your
          circumstances. This page is general information only, not migration
          advice for your case.
        </aside>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/services/visa-sub-classes"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Back to directory
          </Link>
          <Link href="/contact" className={cn(buttonVariants())}>
            Book a consultation
          </Link>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
