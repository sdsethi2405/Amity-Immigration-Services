import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { deleteEnquiryAction } from "@/actions/enquiries";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { EnquiryNotesForm } from "@/components/admin/enquiry-notes-form";
import { EnquiryStatusForm } from "@/components/admin/enquiry-status-form";
import { buttonVariants } from "@/components/ui/button";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminGetEnquiryById } from "@/lib/db/admin-queries";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const enquiry = await adminGetEnquiryById(id);

  return {
    title: enquiry
      ? `${enquiry.name} · Enquiry · Admin`
      : "Enquiry · Admin",
    robots: { index: false, follow: false },
  };
}

export default async function AdminEnquiryDetailPage({ params }: PageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const [enquiry, csrfToken] = await Promise.all([
    adminGetEnquiryById(id),
    getCsrfTokenForForms(),
  ]);

  if (!enquiry) notFound();

  const canDelete = admin.role.level >= ROLE_LEVEL.EDITOR;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/enquiries"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Enquiries
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            {enquiry.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Submitted {new Date(enquiry.created_at).toLocaleString()}
            {enquiry.source_page ? ` · ${enquiry.source_page}` : ""}
          </p>
        </div>
        {canDelete ? (
          <DeleteEntityButton
            id={enquiry.id}
            csrfToken={csrfToken}
            entityLabel="enquiry"
            redirectTo="/admin/enquiries"
            deleteAction={deleteEnquiryAction}
          />
        ) : null}
      </div>

      <div className="rounded-xl border border-border p-4">
        <EnquiryStatusForm
          id={enquiry.id}
          status={enquiry.status}
          csrfToken={csrfToken}
        />
      </div>

      <dl className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Email
          </dt>
          <dd className="mt-1">
            <a
              href={`mailto:${enquiry.email}`}
              className="text-primary hover:underline"
            >
              {enquiry.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Phone
          </dt>
          <dd className="mt-1">
            {enquiry.phone ? (
              <a
                href={`tel:${enquiry.phone}`}
                className="text-primary hover:underline"
              >
                {enquiry.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Visa interest
          </dt>
          <dd className="mt-1">{enquiry.visa_interest || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Message
          </dt>
          <dd className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {enquiry.message}
          </dd>
        </div>
      </dl>

      <div className="rounded-xl border border-border p-4">
        <EnquiryNotesForm
          id={enquiry.id}
          notes={enquiry.notes}
          csrfToken={csrfToken}
        />
      </div>

      <div>
        <Link
          href="/admin/enquiries"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to enquiries
        </Link>
      </div>
    </div>
  );
}
