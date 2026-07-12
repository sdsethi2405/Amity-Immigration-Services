import type { VisaStreamNavGroup } from "@/lib/db/queries";

export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavStreamGroup = {
  stream: string;
  label: string;
  links: NavLink[];
};

export type NavItem =
  | {
      type: "link";
      label: string;
      href: string;
    }
  | {
      type: "mega";
      label: string;
      href: string;
      groups: NavStreamGroup[];
      utilityLinks: NavLink[];
    };

export const staticNavLinks: Array<
  | { type: "link"; label: string; href: string }
  | { type: "mega"; label: string; href: string }
> = [
  { type: "link", label: "Home", href: "/" },
  { type: "link", label: "About", href: "/about" },
  { type: "mega", label: "Services", href: "/services" },
  { type: "link", label: "Resources", href: "/resources" },
  { type: "link", label: "Blog", href: "/blog" },
  { type: "link", label: "Contact", href: "/contact" },
];

const MEGA_UTILITY_LINKS: NavLink[] = [
  {
    label: "Visa sub-class directory",
    href: "/services/visa-sub-classes",
    description: "Browse all published visa sub-classes",
  },
  {
    label: "Points calculator",
    href: "/services/points-calculator",
    description: "Indicative GSM points estimate",
  },
];

export function buildPrimaryNav(
  visaStreamGroups: VisaStreamNavGroup[],
): NavItem[] {
  return staticNavLinks.map((item) => {
    if (item.type === "link") {
      return item;
    }

    const groups: NavStreamGroup[] = visaStreamGroups.map((group) => ({
      stream: group.stream,
      label: group.label,
      links: group.subclasses.map((subclass) => ({
        label: `Subclass ${subclass.subclassNumber} — ${subclass.name}`,
        href: `/services/visa-sub-classes/${subclass.slug}`,
      })),
    }));

    return {
      type: "mega",
      label: item.label,
      href: item.href,
      groups,
      utilityLinks: MEGA_UTILITY_LINKS,
    };
  });
}

export const footerNav: NavLink[] = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
];
