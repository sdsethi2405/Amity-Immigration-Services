import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { deleteVisaSubclassAction } from "@/actions/visa-subclasses";
import { AdminListTable } from "@/components/admin/admin-list-table";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { buttonVariants } from "@/components/ui/button";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminListVisaSubclassesForAdmin } from "@/lib/db/admin-queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Visa subclasses · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminVisaSubclassesListPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const [items, csrfToken] = await Promise.all([
    adminListVisaSubclassesForAdmin(admin.id),
    getCsrfTokenForForms(),
  ]);
  const canDelete = admin.role.level >= ROLE_LEVEL.EDITOR;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Visa subclasses
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage visa subclass directory entries.
          </p>
        </div>
        <Link
          href="/admin/visa-subclasses/new"
          className={cn(buttonVariants(), "inline-flex")}
        >
          <Plus className="size-4" aria-hidden />
          New subclass
        </Link>
      </div>

      <AdminListTable
        headers={["Subclass", "Name", "Published", ""]}
        isEmpty={items.length === 0}
        emptyMessage="No visa subclasses yet."
      >
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-muted/30">
            <td className="px-3 py-2.5 font-medium">{item.subclass_number}</td>
            <td className="px-3 py-2.5">{item.name}</td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {item.is_published ? "Yes" : "Draft"}
            </td>
            <td className="px-3 py-2.5">
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/visa-subclasses/${item.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Edit
                </Link>
                {canDelete ? (
                  <DeleteEntityButton
                    id={item.id}
                    csrfToken={csrfToken}
                    entityLabel="visa subclass"
                    deleteAction={deleteVisaSubclassAction}
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
