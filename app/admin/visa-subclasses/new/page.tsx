import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { VisaSubclassForm } from "@/components/admin/visa-subclass-form";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import {
  getScopedTeamsForAdmin,
  teamsToOptions,
} from "@/lib/admin/teams";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "New visa subclass · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewVisaSubclassPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const [csrfToken, teams] = await Promise.all([
    getCsrfTokenForForms(),
    getScopedTeamsForAdmin(admin.id),
  ]);

  const defaultTeamId = admin.team_id ?? teams[0]?.id ?? "";
  if (!defaultTeamId) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-muted-foreground">
          No team scope available. Ask a Head Admin to assign a team.
        </p>
      </div>
    );
  }

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
          New visa subclass
        </h1>
      </div>

      <VisaSubclassForm
        mode="create"
        csrfToken={csrfToken}
        teams={teamsToOptions(teams)}
        canPublish={admin.role.level >= ROLE_LEVEL.EDITOR}
        defaultTeamId={defaultTeamId}
      />
    </div>
  );
}
