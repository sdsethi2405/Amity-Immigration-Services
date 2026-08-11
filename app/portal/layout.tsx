import type { Metadata } from "next";
import { headers } from "next/headers";

import { AdminToaster } from "@/components/admin/admin-toaster";

export const metadata: Metadata = {
  title: "Client portal",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";
  const isLogin = pathname === "/portal/login";

  return (
    <div className="min-h-screen bg-background">
      <AdminToaster />
      {isLogin ? (
        children
      ) : (
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">{children}</div>
      )}
    </div>
  );
}
