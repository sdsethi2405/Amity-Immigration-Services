"use client";

import { usePathname } from "next/navigation";

import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeaderShell } from "@/components/shared/site-header-shell";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <SmoothScrollProvider>
      <SiteHeaderShell />
      <main>{children}</main>
      <SiteFooter />
    </SmoothScrollProvider>
  );
}
