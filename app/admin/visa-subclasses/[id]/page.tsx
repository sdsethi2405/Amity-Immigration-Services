import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { VisaSubclassForm } from "@/components/admin/visa-subclass-form";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import {
  getScopedTeamsForAdmin,
  teamsToOptions,
} from "@/lib/admin/teams";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminGetVisaSubclassById } from "@/lib/db/admin-queries";
import { getAccessibleScopes } from "@/lib/db/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit visa subclass · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminEditVisaSubclassPage({ params }: PageProps) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const visa = await adminGetVisaSubclassById(id);
  if (!visa) notFound();

  const scopes = await getAccessibleScopes(admin.id);
  if (!visa.team_id || !scopes.includes(visa.team_id)) {
    notFound();
  }

  const [csrfToken, teams] = await Promise.all([
    getCsrfTokenForForms(),
    getScopedTeamsForAdmin(admin.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/visa-subclasses"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Visa subclasses
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
          Edit visa subclass
        </h1>
      </div>

      <VisaSubclassForm
        mode="edit"
        visa={visa}
        csrfToken={csrfToken}
        teams={teamsToOptions(teams)}
        canPublish={admin.role.level >= ROLE_LEVEL.EDITOR}
        defaultTeamId={visa.team_id}
      />
    </div>
  );
}
