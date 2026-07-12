import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceForm } from "@/components/admin/service-form";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import {
  getScopedTeamsForAdmin,
  teamsToOptions,
} from "@/lib/admin/teams";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminGetServiceById } from "@/lib/db/admin-queries";
import { getAccessibleScopes } from "@/lib/db/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit service · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminEditServicePage({ params }: PageProps) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const service = await adminGetServiceById(id);
  if (!service) notFound();

  const scopes = await getAccessibleScopes(admin.id);
  if (!service.team_id || !scopes.includes(service.team_id)) {
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
          href="/admin/services"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Services
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
          Edit service
        </h1>
      </div>

      <ServiceForm
        mode="edit"
        service={service}
        csrfToken={csrfToken}
        teams={teamsToOptions(teams)}
        canPublish={admin.role.level >= ROLE_LEVEL.EDITOR}
        defaultTeamId={service.team_id}
      />
    </div>
  );
}
