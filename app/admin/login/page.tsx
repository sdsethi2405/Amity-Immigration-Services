import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  // Login is part of /admin and must remain noindex.
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-heading text-3xl font-semibold">Admin Login</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to manage Amity Immigration Services content.
      </p>
      <AdminLoginForm />
    </div>
  );
}
