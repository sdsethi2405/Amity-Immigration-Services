"use client";

import { usePathname } from "next/navigation";

import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";

type SiteChromeProps = {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  whatsapp?: React.ReactNode;
};

/**
 * Client chrome for public pages. Header/footer are passed in from the Server
 * Component layout so CMS nav data (visa subclasses) stays on the server.
 */
export function SiteChrome({
  children,
  header,
  footer,
  whatsapp,
}: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isPortal = pathname.startsWith("/portal");

  if (isAdmin || isPortal) {
    return <>{children}</>;
  }

  return (
    <SmoothScrollProvider>
      {header}
      <main>{children}</main>
      {footer}
      {whatsapp}
    </SmoothScrollProvider>
  );
}
