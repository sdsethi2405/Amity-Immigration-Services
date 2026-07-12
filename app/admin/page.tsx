import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Briefcase,
  ClipboardList,
  FileText,
  ImageIcon,
  Newspaper,
  Plane,
  Users,
} from "lucide-react";

import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

const SECTIONS = [
  {
    href: "/admin/pages",
    title: "Pages",
    description: "Edit site pages and content blocks.",
    icon: FileText,
  },
  {
    href: "/admin/services",
    title: "Services",
    description: "Manage service listings.",
    icon: Briefcase,
  },
  {
    href: "/admin/visa-subclasses",
    title: "Visa subclasses",
    description: "Maintain visa subclass directory entries.",
    icon: Plane,
  },
  {
    href: "/admin/posts",
    title: "Posts",
    description: "Write and publish blog posts.",
    icon: Newspaper,
  },
  {
    href: "/admin/team-members",
    title: "Team",
    description: "Update team member profiles.",
    icon: Users,
  },
  {
    href: "/admin/media",
    title: "Media",
    description: "Upload images to storage buckets.",
    icon: ImageIcon,
  },
] as const;

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const showAudit = admin.role.level >= ROLE_LEVEL.EDITOR;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Signed in as {admin.username} ({admin.role.name}
          {admin.team ? ` · ${admin.team.name}` : ""}).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
            >
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-muted p-2 text-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-semibold">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}

        {showAudit ? (
          <Link
            href="/admin/audit-log"
            className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/30 sm:col-span-2"
          >
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-muted p-2 text-foreground">
                <ClipboardList className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-heading text-lg font-semibold">
                  Audit log
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review publish, unpublish, and delete events.
                </p>
              </div>
            </div>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
