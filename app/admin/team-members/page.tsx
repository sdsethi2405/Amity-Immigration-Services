import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { deleteTeamMemberAction } from "@/actions/team-members";
import { AdminListTable } from "@/components/admin/admin-list-table";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { buttonVariants } from "@/components/ui/button";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminListTeamMembersForAdmin } from "@/lib/db/admin-queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Team · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminTeamMembersListPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const [members, csrfToken] = await Promise.all([
    adminListTeamMembersForAdmin(admin.id),
    getCsrfTokenForForms(),
  ]);
  const canDelete = admin.role.level >= ROLE_LEVEL.EDITOR;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Team
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage team member profiles shown on the about page.
          </p>
        </div>
        <Link
          href="/admin/team-members/new"
          className={cn(buttonVariants(), "inline-flex")}
        >
          <Plus className="size-4" aria-hidden />
          New member
        </Link>
      </div>

      <AdminListTable
        headers={["Name", "Role", "Published", ""]}
        isEmpty={members.length === 0}
        emptyMessage="No team members yet."
      >
        {members.map((member) => (
          <tr key={member.id} className="hover:bg-muted/30">
            <td className="px-3 py-2.5 font-medium">{member.name}</td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {member.role_title ?? "—"}
            </td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {member.is_published ? "Yes" : "Draft"}
            </td>
            <td className="px-3 py-2.5">
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/team-members/${member.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Edit
                </Link>
                {canDelete ? (
                  <DeleteEntityButton
                    id={member.id}
                    csrfToken={csrfToken}
                    entityLabel="team member"
                    deleteAction={deleteTeamMemberAction}
                  />
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </AdminListTable>
    </div>
  );
}
