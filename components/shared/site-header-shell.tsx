import { getPublishedServices, getVisaStreamNavGroups } from "@/lib/db/queries";
import { buildPrimaryNav } from "@/content/nav";
import { SiteHeader } from "@/components/shared/site-header";
import { getDictionaryForRequest } from "@/lib/i18n/locale";

export async function SiteHeaderShell() {
  const [visaStreamGroups, services, { locale, dictionary }] =
    await Promise.all([
      getVisaStreamNavGroups(),
      getPublishedServices(),
      getDictionaryForRequest(),
    ]);

  const primaryNav = buildPrimaryNav(
    visaStreamGroups,
    services.map((service) => ({ title: service.title, slug: service.slug })),
  ).map((item) => {
    if (item.type === "link") {
      const key = item.href.replace("/", "") || "home";
      const labelMap: Record<string, string> = {
        home: dictionary.nav.home,
        about: dictionary.nav.about,
        resources: dictionary.nav.resources,
        blog: dictionary.nav.blog,
        contact: dictionary.nav.contact,
      };
      return {
        ...item,
        label: labelMap[key] ?? item.label,
      };
    }

    return {
      ...item,
      label: dictionary.nav.services,
    };
  });

  return <SiteHeader primaryNav={primaryNav} locale={locale} />;
}
