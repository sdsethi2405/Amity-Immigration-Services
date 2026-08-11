import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PortalLogoutButton } from "@/components/portal/portal-logout-button";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { listMattersForClient } from "@/lib/db/portal-queries";
import { getCurrentClient } from "@/lib/portal/session";

export const metadata: Metadata = {
  title: "Your matters · Portal",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed",
};

export default async function PortalHomePage() {
  const client = await getCurrentClient();
  if (!client) redirect("/portal/login");

  const [matters, csrfToken] = await Promise.all([
    listMattersForClient(client.id),
    getCsrfTokenForForms(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Welcome, {client.fullName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{client.email}</p>
        </div>
        <PortalLogoutButton csrfToken={csrfToken} />
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">Your matters</h2>
        {matters.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No matters have been assigned yet. Contact the office if you expected
            to see one here.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {matters.map((matter) => (
              <li key={matter.id}>
                <Link
                  href={`/portal/matters/${matter.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-muted/40"
                >
                  <span className="font-medium text-foreground">
                    {matter.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {STATUS_LABELS[matter.status] ?? matter.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
