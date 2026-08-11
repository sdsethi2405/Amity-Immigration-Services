import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminsManagement } from "@/components/admin/admins-management";
import { ClientsManagement } from "@/components/admin/clients-management";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  adminListAdmins,
  adminListRoles,
  adminListTeams,
} from "@/lib/db/admin-queries";
import { adminListClients } from "@/lib/db/portal-queries";

export const metadata: Metadata = {
  title: "Users · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const canManageCmsUsers =
    admin.role.level >= ROLE_LEVEL.HEAD_ADMIN &&
    admin.role.scope === "global";
  const canManageClients = admin.role.level >= ROLE_LEVEL.ADMIN;

  if (!canManageCmsUsers && !canManageClients) {
    redirect("/admin");
  }

  const csrfToken = await getCsrfTokenForForms();

  const [admins, roles, teams, clients] = await Promise.all([
    canManageCmsUsers ? adminListAdmins() : Promise.resolve([]),
    canManageCmsUsers ? adminListRoles() : Promise.resolve([]),
    canManageCmsUsers ? adminListTeams() : Promise.resolve([]),
    canManageClients ? adminListClients() : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Users
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage staff logins
          {canManageClients ? " and client portal accounts" : ""}. Role
          hierarchy: Head Admin (100) → Admin (50) → Staff (20).
        </p>
      </div>

      {canManageCmsUsers ? (
        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-semibold">Staff</h2>
          <AdminsManagement
            csrfToken={csrfToken}
            currentAdminId={admin.id}
            admins={admins}
            roles={roles}
            teams={teams}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
          Only Head Admin can create or deactivate staff accounts.{" "}
          <Link href="/admin" className="text-primary hover:underline">
            Back to dashboard
          </Link>
        </p>
      )}

      {canManageClients ? (
        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-semibold">Clients</h2>
          <ClientsManagement csrfToken={csrfToken} clients={clients} />
        </div>
      ) : null}
    </div>
  );
}
