import {
  getComplianceFooter,
  getContactDetails,
  getSocialLinks,
} from "@/lib/db/queries";
import { SiteFooterLegalLinks } from "@/components/shared/site-header";

export async function SiteFooter() {
  const [complianceFooter, contact, social] = await Promise.all([
    getComplianceFooter(),
    getContactDetails(),
    getSocialLinks(),
  ]);

  const phone = contact?.phone;
  const email = contact?.email;
  const address = contact?.address ?? "59 Settlement Road, Bundoora VIC 3083";
  const socialEntries = [
    social?.facebook ? { label: "Facebook", href: social.facebook } : null,
    social?.linkedin ? { label: "LinkedIn", href: social.linkedin } : null,
    social?.instagram ? { label: "Instagram", href: social.instagram } : null,
  ].filter((entry): entry is { label: string; href: string } => entry !== null);

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-heading text-lg font-semibold">
              Amity Immigration Services
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{address}</p>
            {phone ? (
              <p className="mt-1 text-sm text-muted-foreground">
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="hover:text-primary"
                >
                  {phone}
                </a>
              </p>
            ) : null}
            {email ? (
              <p className="mt-1 text-sm text-muted-foreground">
                <a href={`mailto:${email}`} className="hover:text-primary">
                  {email}
                </a>
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <SiteFooterLegalLinks />
            {socialEntries.length > 0 ? (
              <ul className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {socialEntries.map((entry) => (
                  <li key={entry.href}>
                    <a
                      href={entry.href}
                      className="hover:text-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {entry.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{complianceFooter}</p>
        <p className="text-xs text-muted-foreground">
          Registered migration agent services. Not a law firm.
        </p>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Amity Immigration Services
        </p>
      </div>
    </footer>
  );
}
