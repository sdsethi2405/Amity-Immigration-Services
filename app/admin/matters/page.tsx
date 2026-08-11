import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MatterCreateForm } from "@/components/admin/matter-create-form";
import { MatterStatusForm } from "@/components/admin/matter-status-form";
import { AdminListTable } from "@/components/admin/admin-list-table";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminListVisaSubclassesForAdmin } from "@/lib/db/admin-queries";
import {
  adminListClients,
  adminListMatters,
} from "@/lib/db/portal-queries";

export const metadata: Metadata = {
  title: "Matters · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMattersPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const canManage = admin.role.level >= ROLE_LEVEL.EDITOR;
  const csrfToken = await getCsrfTokenForForms();

  const [matters, clients, visas] = await Promise.all([
    adminListMatters(),
    canManage ? adminListClients() : Promise.resolve([]),
    canManage
      ? adminListVisaSubclassesForAdmin(admin.id)
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Matters
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Client portal matters, checklists, and document tracking.
        </p>
      </div>

      {canManage ? (
        <section className="space-y-4 rounded-xl border border-border p-4">
          <h2 className="font-heading text-xl font-semibold">Create matter</h2>
          <MatterCreateForm
            csrfToken={csrfToken}
            clients={clients}
            visas={visas.map((visa) => ({
              id: visa.id,
              label: `${visa.subclass_number} — ${visa.name}`,
            }))}
          />
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          Editors and above can create matters.
        </p>
      )}

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">All matters</h2>
      <AdminListTable
        headers={["Title", "Client", "Visa", "Status", "Created"]}
        isEmpty={matters.length === 0}
        emptyMessage="No matters yet."
      >
        {matters.map((matter) => (
          <tr key={matter.id} className="hover:bg-muted/30">
            <td className="px-3 py-2.5 font-medium">{matter.title}</td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {matter.client_full_name}
              <span className="mt-0.5 block text-xs">
                {matter.client_email}
              </span>
            </td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {matter.visa_name ?? "—"}
            </td>
            <td className="px-3 py-2.5">
              {canManage ? (
                <MatterStatusForm
                  csrfToken={csrfToken}
                  matterId={matter.id}
                  status={matter.status}
                />
              ) : (
                <span className="text-sm capitalize">
                  {matter.status.replace("_", " ")}
                </span>
              )}
            </td>
            <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
              {new Date(matter.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </AdminListTable>
      </section>
    </div>
  );
}
