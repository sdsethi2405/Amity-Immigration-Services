import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { TeamMemberForm } from "@/components/admin/team-member-form";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import {
  getScopedTeamsForAdmin,
  teamsToOptions,
} from "@/lib/admin/teams";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminGetTeamMemberById } from "@/lib/db/admin-queries";
import { getAccessibleScopes } from "@/lib/db/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit team member · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminEditTeamMemberPage({ params }: PageProps) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const member = await adminGetTeamMemberById(id);
  if (!member) notFound();

  const scopes = await getAccessibleScopes(admin.id);
  if (!member.team_id || !scopes.includes(member.team_id)) {
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
          href="/admin/team-members"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Team
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
          Edit team member
        </h1>
      </div>

      <TeamMemberForm
        mode="edit"
        member={member}
        csrfToken={csrfToken}
        teams={teamsToOptions(teams)}
        canPublish={admin.role.level >= ROLE_LEVEL.EDITOR}
        defaultTeamId={member.team_id}
      />
    </div>
  );
}
