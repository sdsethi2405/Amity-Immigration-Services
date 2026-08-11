import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PortalChecklist } from "@/components/portal/portal-checklist";
import { PortalDocuments } from "@/components/portal/portal-documents";
import { PortalLogoutButton } from "@/components/portal/portal-logout-button";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import {
  getMatterForClient,
  listChecklistItemsForMatter,
  listDocumentsForMatter,
} from "@/lib/db/portal-queries";
import { getCurrentClient } from "@/lib/portal/session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Matter · Portal",
  robots: { index: false, follow: false },
};

export default async function PortalMatterPage({ params }: PageProps) {
  const client = await getCurrentClient();
  if (!client) redirect("/portal/login");

  const { id } = await params;
  const matter = await getMatterForClient(id, client.id);
  if (!matter) notFound();

  const [checklist, documents, csrfToken] = await Promise.all([
    listChecklistItemsForMatter(matter.id),
    listDocumentsForMatter(matter.id),
    getCsrfTokenForForms(),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/portal" className="hover:text-primary">
              Matters
            </Link>
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            {matter.title}
          </h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            Status: {matter.status.replace("_", " ")}
          </p>
        </div>
        <PortalLogoutButton csrfToken={csrfToken} />
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">Checklist</h2>
        <PortalChecklist
          matterId={matter.id}
          csrfToken={csrfToken}
          items={checklist}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">Documents</h2>
        <PortalDocuments
          matterId={matter.id}
          csrfToken={csrfToken}
          documents={documents}
        />
      </section>
    </div>
  );
}
