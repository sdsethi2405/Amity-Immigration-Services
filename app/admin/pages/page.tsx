import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminListTable } from "@/components/admin/admin-list-table";
import { adminListPagesForAdmin } from "@/lib/db/admin-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Pages · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPagesListPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const pages = await adminListPagesForAdmin(admin.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Pages
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit existing pages. Pages cannot be created or deleted here.
        </p>
      </div>

      <AdminListTable
        headers={["Title", "Slug", "Updated", ""]}
        isEmpty={pages.length === 0}
        emptyMessage="No pages in your team scope."
      >
        {pages.map((page) => (
          <tr key={page.id} className="hover:bg-muted/30">
            <td className="px-3 py-2.5 font-medium">{page.title}</td>
            <td className="px-3 py-2.5 text-muted-foreground">{page.slug}</td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {new Date(page.updated_at).toLocaleString()}
            </td>
            <td className="px-3 py-2.5 text-right">
              <Link
                href={`/admin/pages/${page.id}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </AdminListTable>
    </div>
  );
}
