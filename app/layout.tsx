import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteChrome } from "@/components/providers/site-chrome";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Amity Immigration Services | Migration Agent Melbourne",
    template: "%s | Amity Immigration Services",
  },
  description:
    "Registered migration agent in Bundoora, Melbourne. Skilled, partner, and business visa assistance across Victoria.",
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Amity Immigration Services",
    title: "Amity Immigration Services",
    description:
      "Registered migration agent in Bundoora, Melbourne. Skilled, partner, and business visa assistance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amity Immigration Services",
    description:
      "Registered migration agent in Bundoora, Melbourne.",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LegalService", "LocalBusiness"],
  name: "Amity Immigration Services",
  description:
    "Registered migration agent providing skilled, partner, and business visa assistance.",
  url: siteUrl,
  address: {
    "@type": "PostalAddress",
    streetAddress: "59 Settlement Road",
    addressLocality: "Bundoora",
    addressRegion: "VIC",
    postalCode: "3083",
    addressCountry: "AU",
  },
  areaServed: [
    { "@type": "City", name: "Melbourne" },
    { "@type": "State", name: "Victoria" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body className={`${playfair.variable} ${sourceSans.variable}`}>
        <SiteChrome>{children}</SiteChrome>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
