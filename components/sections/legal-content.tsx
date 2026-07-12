import { ContentBlockRenderer } from "@/components/shared/content-block-renderer";
import type { Page } from "@/lib/db/queries";

type LegalContentSectionProps = {
  page: Page;
};

export function LegalContentSection({ page }: LegalContentSectionProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground">
          {page.title}
        </h1>
        <ContentBlockRenderer blocks={page.blocks} className="mt-8" />
      </div>
    </section>
  );
}
