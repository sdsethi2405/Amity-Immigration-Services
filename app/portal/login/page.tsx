import type { Metadata } from "next";

import { PortalLoginForm } from "@/components/portal/portal-login-form";

export const metadata: Metadata = {
  title: "Client portal login",
  robots: { index: false, follow: false },
};

export default function PortalLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <p className="text-sm font-medium text-muted-foreground">
        Amity Immigration Services
      </p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
        Client portal
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to view your matters, checklist, and documents.
      </p>
      <PortalLoginForm />
    </div>
  );
}
