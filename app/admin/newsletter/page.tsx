import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminListTable } from "@/components/admin/admin-list-table";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminListNewsletterSubscribers } from "@/lib/db/portal-queries";

export const metadata: Metadata = {
  title: "Newsletter · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewsletterPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const subscribers = await adminListNewsletterSubscribers();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Newsletter
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Subscribers from the public footer form.
        </p>
      </div>

      <AdminListTable
        headers={["Email", "Locale", "Subscribed"]}
        isEmpty={subscribers.length === 0}
        emptyMessage="No subscribers yet."
      >
        {subscribers.map((row) => (
          <tr key={row.id} className="hover:bg-muted/30">
            <td className="px-3 py-2.5 font-medium">{row.email}</td>
            <td className="px-3 py-2.5 uppercase text-muted-foreground">
              {row.locale}
            </td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {new Date(row.created_at).toLocaleString()}
            </td>
          </tr>
        ))}
      </AdminListTable>
    </div>
  );
}
