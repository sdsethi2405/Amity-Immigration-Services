import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth/session";
import {
  adminCountEnquiriesByStatus,
  adminEnquiryVolumeByDay,
  adminTopVisaInterests,
} from "@/lib/db/admin-queries";

export const metadata: Metadata = {
  title: "Analytics · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAnalyticsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const [byStatus, topVisa, byDay] = await Promise.all([
    adminCountEnquiriesByStatus(),
    adminTopVisaInterests(90, 10),
    adminEnquiryVolumeByDay(90),
  ]);

  const recentDays = byDay.filter((row) => row.count > 0).slice(-30);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enquiry overview for the last 90 days (where noted).
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">
          Enquiries by status
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["new", byStatus.new],
                  ["in_progress", byStatus.in_progress],
                  ["closed", byStatus.closed],
                ] as const
              ).map(([status, count]) => (
                <tr key={status} className="border-b border-border/70">
                  <td className="px-3 py-2 capitalize">
                    {status.replace("_", " ")}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">
          Top visa interest (90 days)
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-3 py-2 font-medium">Visa interest</th>
                <th className="px-3 py-2 font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {topVisa.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-4 text-muted-foreground"
                  >
                    No visa interest data in the last 90 days.
                  </td>
                </tr>
              ) : (
                topVisa.map((row) => (
                  <tr
                    key={row.visa_interest}
                    className="border-b border-border/70"
                  >
                    <td className="px-3 py-2">{row.visa_interest}</td>
                    <td className="px-3 py-2 tabular-nums">{row.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">
          Enquiry volume by day
        </h2>
        <p className="text-sm text-muted-foreground">
          Showing days with at least one enquiry (most recent 30 of those).
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-3 py-2 font-medium">Day (UTC)</th>
                <th className="px-3 py-2 font-medium">Enquiries</th>
              </tr>
            </thead>
            <tbody>
              {recentDays.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-4 text-muted-foreground"
                  >
                    No enquiries in the last 90 days.
                  </td>
                </tr>
              ) : (
                recentDays.map((row) => (
                  <tr key={row.day} className="border-b border-border/70">
                    <td className="px-3 py-2 tabular-nums">{row.day}</td>
                    <td className="px-3 py-2 tabular-nums">{row.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
