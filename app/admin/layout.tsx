import type { Metadata } from "next";
import { headers } from "next/headers";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToaster } from "@/components/admin/admin-toaster";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin",
  // None of the /admin routes should ever be indexed.
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return (
      <div className="min-h-screen bg-background">
        <AdminToaster />
        {children}
      </div>
    );
  }

  const admin = await getCurrentAdmin();
  const csrfToken = await getCsrfTokenForForms();

  if (!admin) {
    return (
      <div className="min-h-screen bg-background">
        <AdminToaster />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminToaster />
      <AdminShell
        username={admin.username}
        roleName={admin.role.name}
        roleLevel={admin.role.level}
        teamName={admin.team?.name ?? null}
        csrfToken={csrfToken}
      >
        {children}
      </AdminShell>
    </div>
  );
}
