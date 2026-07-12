"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  ClipboardList,
  FileText,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Plane,
  Users,
  Briefcase,
} from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { readCsrfTokenFromDocument } from "@/lib/admin/csrf-client";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  {
    href: "/admin/visa-subclasses",
    label: "Visa subclasses",
    icon: Plane,
  },
  { href: "/admin/posts", label: "Posts", icon: Newspaper },
  { href: "/admin/team-members", label: "Team", icon: Users },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
] as const;

type AdminNavProps = {
  username: string;
  roleName: string;
  roleLevel: number;
  teamName: string | null;
  csrfToken: string;
};

export function AdminNav({
  username,
  roleName,
  roleLevel,
  teamName,
  csrfToken,
}: AdminNavProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const showAudit = roleLevel >= ROLE_LEVEL.EDITOR;

  function handleLogout() {
    startTransition(async () => {
      const token = csrfToken || readCsrfTokenFromDocument();
      await logoutAction({ csrfToken: token });
    });
  }

  return (
    <aside className="flex w-full flex-col border-b border-border bg-muted/30 md:min-h-screen md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="border-b border-border px-4 py-4">
        <p className="font-heading text-lg font-semibold tracking-tight">
          Amity CMS
        </p>
        <p className="mt-1 truncate text-sm text-foreground">{username}</p>
        <p className="truncate text-xs text-muted-foreground">
          {roleName}
          {teamName ? ` · ${teamName}` : ""}
        </p>
      </div>

      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto px-2 py-3 md:flex-col md:overflow-x-visible">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            "exact" in item && item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm whitespace-nowrap transition-colors",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}

        {showAudit ? (
          <Link
            href="/admin/audit-log"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm whitespace-nowrap transition-colors",
              pathname === "/admin/audit-log" ||
                pathname.startsWith("/admin/audit-log/")
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <ClipboardList className="size-4 shrink-0" aria-hidden />
            Audit log
          </Link>
        ) : null}
      </nav>

      <div className="border-t border-border p-3">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          disabled={isPending}
          onClick={handleLogout}
        >
          <LogOut className="size-4" aria-hidden />
          {isPending ? "Signing out…" : "Log out"}
        </Button>
      </div>
    </aside>
  );
}
