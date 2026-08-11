import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PrintButton } from "@/components/shared/print-button";
import { buttonVariants } from "@/components/ui/button";
import { getVisaSubclassBySlug } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const subclass = await getVisaSubclassBySlug(slug);

  if (!subclass) {
    return { title: "Checklist not found" };
  }

  return {
    title: `Document checklist — Subclass ${subclass.subclass_number}`,
    description: `Indicative document checklist for subclass ${subclass.subclass_number} (${subclass.name}).`,
  };
}

export default async function VisaSubclassChecklistPage({ params }: PageProps) {
  const { slug } = await params;
  const subclass = await getVisaSubclassBySlug(slug);

  if (!subclass) notFound();

  const items = subclass.document_checklist;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 print:py-6 md:px-6 lg:py-16">
      <p className="text-sm text-muted-foreground print:hidden">
        <Link
          href={`/services/visa-sub-classes/${subclass.slug}`}
          className="hover:text-primary"
        >
          Subclass {subclass.subclass_number}
        </Link>
      </p>

      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
        Document checklist
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Subclass {subclass.subclass_number} — {subclass.name}
      </p>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No checklist items have been published for this subclass yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 border-b border-border py-3"
            >
              <span
                className="mt-0.5 inline-block size-4 shrink-0 rounded border border-border print:border-foreground"
                aria-hidden
              />
              <span>
                <span className="font-medium text-foreground">{item.label}</span>
                {item.required ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Typically required
                  </span>
                ) : (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    May be requested
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <aside
        className="mt-10 rounded-lg border border-border bg-secondary px-5 py-4 text-sm leading-relaxed text-muted-foreground print:border-none print:bg-transparent print:px-0"
        role="note"
      >
        This checklist is general information only. Document requirements vary
        by circumstances and change over time. It is not legal advice. Confirm
        current requirements with the Department of Home Affairs and a
        registered migration agent.
      </aside>

      <div className="mt-8 flex flex-wrap gap-3 print:hidden">
        <PrintButton />
        <Link
          href={`/services/visa-sub-classes/${subclass.slug}`}
          className={cn(buttonVariants())}
        >
          Back to subclass
        </Link>
      </div>
    </article>
  );
}
