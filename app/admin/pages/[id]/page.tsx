import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PageForm } from "@/components/admin/page-form";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { adminGetPageById } from "@/lib/db/admin-queries";
import { getAccessibleScopes } from "@/lib/db/queries";
import { getCurrentAdmin } from "@/lib/auth/session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit page · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPageEditPage({ params }: PageProps) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const page = await adminGetPageById(id);
  if (!page) notFound();

  const scopes = await getAccessibleScopes(admin.id);
  if (!page.team_id || !scopes.includes(page.team_id)) {
    notFound();
  }

  const csrfToken = await getCsrfTokenForForms();

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/pages"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Pages
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
          Edit page
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">/{page.slug}</p>
      </div>

      <PageForm page={page} csrfToken={csrfToken} />
    </div>
  );
}
