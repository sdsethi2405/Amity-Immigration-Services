import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminListTable } from "@/components/admin/admin-list-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  adminListActors,
  adminListAuditLog,
} from "@/lib/db/admin-queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Audit log · Admin",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{
    actor?: string;
    table?: string;
    from?: string;
    to?: string;
  }>;
};

function toStartOfDayIso(date: string | undefined): string | undefined {
  if (!date) return undefined;
  return `${date}T00:00:00.000Z`;
}

function toEndOfDayIso(date: string | undefined): string | undefined {
  if (!date) return undefined;
  return `${date}T23:59:59.999Z`;
}

export default async function AdminAuditLogPage({ searchParams }: PageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  if (admin.role.level < ROLE_LEVEL.EDITOR) {
    redirect("/admin");
  }

  const params = await searchParams;
  const actor = params.actor?.trim() || undefined;
  const table = params.table?.trim() || undefined;
  const from = params.from?.trim() || undefined;
  const to = params.to?.trim() || undefined;

  const [actors, rows] = await Promise.all([
    adminListActors(),
    adminListAuditLog({
      actorAdminId: actor,
      targetTable: table,
      from: toStartOfDayIso(from),
      to: toEndOfDayIso(to),
      limit: 200,
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Audit log
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Read-only history of publish, unpublish, and delete actions.
        </p>
      </div>

      <form
        method="get"
        className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="space-y-2">
          <Label htmlFor="actor">Actor</Label>
          <select
            id="actor"
            name="actor"
            defaultValue={actor ?? ""}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">All actors</option>
            {actors.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.username}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="table">Table</Label>
          <Input
            id="table"
            name="table"
            placeholder="e.g. services"
            defaultValue={table ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            name="from"
            type="date"
            defaultValue={from ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <Input id="to" name="to" type="date" defaultValue={to ?? ""} />
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" className="w-full sm:w-auto">
            Filter
          </Button>
          <Link
            href="/admin/audit-log"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex w-full sm:w-auto",
            )}
          >
            Clear
          </Link>
        </div>
      </form>

      <AdminListTable
        headers={["When", "Actor", "Action", "Table", "Target"]}
        isEmpty={rows.length === 0}
        emptyMessage="No audit events match these filters."
      >
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-muted/30">
            <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
              {new Date(row.created_at).toLocaleString()}
            </td>
            <td className="px-3 py-2.5">
              {row.actor_username ?? "—"}
            </td>
            <td className="px-3 py-2.5 font-medium">{row.action}</td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {row.target_table}
            </td>
            <td className="max-w-[12rem] truncate px-3 py-2.5 font-mono text-xs text-muted-foreground">
              {row.target_id ?? "—"}
            </td>
          </tr>
        ))}
      </AdminListTable>
    </div>
  );
}
