import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminListTable } from "@/components/admin/admin-list-table";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  adminCountEnquiriesByStatus,
  adminListEnquiries,
  type Enquiry,
} from "@/lib/db/admin-queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Enquiries · Admin",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const STATUS_LABELS: Record<Enquiry["status"], string> = {
  new: "New",
  in_progress: "In progress",
  closed: "Closed",
};

function parseStatus(value: string | undefined): Enquiry["status"] | undefined {
  if (value === "new" || value === "in_progress" || value === "closed") {
    return value;
  }
  return undefined;
}

export default async function AdminEnquiriesListPage({
  searchParams,
}: PageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const params = await searchParams;
  const status = parseStatus(params.status?.trim());

  const [enquiries, counts] = await Promise.all([
    adminListEnquiries({ status }),
    adminCountEnquiriesByStatus(),
  ]);

  const filters: Array<{ href: string; label: string; active: boolean }> = [
    {
      href: "/admin/enquiries",
      label: `All (${counts.new + counts.in_progress + counts.closed})`,
      active: !status,
    },
    {
      href: "/admin/enquiries?status=new",
      label: `New (${counts.new})`,
      active: status === "new",
    },
    {
      href: "/admin/enquiries?status=in_progress",
      label: `In progress (${counts.in_progress})`,
      active: status === "in_progress",
    },
    {
      href: "/admin/enquiries?status=closed",
      label: `Closed (${counts.closed})`,
      active: status === "closed",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Enquiries
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Contact form and consultation requests from the public site.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.href}
            href={filter.href}
            className={cn(
              buttonVariants({
                variant: filter.active ? "default" : "outline",
                size: "sm",
              }),
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <AdminListTable
        headers={["When", "Name", "Email", "Interest", "Status", ""]}
        isEmpty={enquiries.length === 0}
        emptyMessage="No enquiries match this filter."
      >
        {enquiries.map((enquiry) => (
          <tr key={enquiry.id} className="hover:bg-muted/30">
            <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
              {new Date(enquiry.created_at).toLocaleString()}
            </td>
            <td className="px-3 py-2.5 font-medium">{enquiry.name}</td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {enquiry.email}
            </td>
            <td className="max-w-[12rem] truncate px-3 py-2.5 text-muted-foreground">
              {enquiry.visa_interest || "—"}
            </td>
            <td className="px-3 py-2.5">
              <span
                className={cn(
                  "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                  enquiry.status === "new" &&
                    "bg-primary/10 text-primary",
                  enquiry.status === "in_progress" &&
                    "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                  enquiry.status === "closed" &&
                    "bg-muted text-muted-foreground",
                )}
              >
                {STATUS_LABELS[enquiry.status]}
              </span>
            </td>
            <td className="px-3 py-2.5 text-right">
              <Link
                href={`/admin/enquiries/${enquiry.id}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                View
              </Link>
            </td>
          </tr>
        ))}
      </AdminListTable>
    </div>
  );
}
