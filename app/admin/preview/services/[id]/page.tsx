import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ContentBlockRenderer } from "@/components/shared/content-block-renderer";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminGetServiceById } from "@/lib/db/admin-queries";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Preview service · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPreviewServicePage({ params }: PageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const service = await adminGetServiceById(id);
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Admin preview
          </p>
          <p className="text-sm text-muted-foreground">
            {service.is_published ? "Published" : "Unpublished"} · /services/
            {service.slug}
          </p>
        </div>
        <Link
          href={`/admin/services/${service.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to edit
        </Link>
      </div>

      <article>
        <header>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {service.title}
          </h1>
          {service.summary ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {service.summary}
            </p>
          ) : null}
        </header>
        <ContentBlockRenderer blocks={service.body} className="mt-10" />
      </article>
    </div>
  );
}
