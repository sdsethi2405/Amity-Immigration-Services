import { getComplianceFooter } from "@/lib/db/queries";
import { SiteFooterLegalLinks } from "@/components/shared/site-header";

export async function SiteFooter() {
  const complianceFooter = await getComplianceFooter();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-heading text-lg font-semibold">
              Amity Immigration Services
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              59 Settlement Road, Bundoora VIC 3083
            </p>
          </div>
          <SiteFooterLegalLinks />
        </div>
        <p className="text-xs text-muted-foreground">{complianceFooter}</p>
        <p className="text-xs text-muted-foreground">
          {/* TODO(Stage 5): render contact_details and social_links from site_settings */}
          Registered migration agent services. Not a law firm.
        </p>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Amity Immigration Services
        </p>
      </div>
    </footer>
  );
}
