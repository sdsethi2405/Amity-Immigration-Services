import { getVisaStreamNavGroups } from "@/lib/db/queries";
import { buildPrimaryNav } from "@/content/nav";
import { SiteHeader } from "@/components/shared/site-header";

export async function SiteHeaderShell() {
  const visaStreamGroups = await getVisaStreamNavGroups();
  const primaryNav = buildPrimaryNav(visaStreamGroups);

  return <SiteHeader primaryNav={primaryNav} />;
}
