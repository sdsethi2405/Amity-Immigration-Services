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
    };

export const primaryNav: NavItem[] = [
  { type: "link", label: "Home", href: "/" },
  { type: "link", label: "About", href: "/about" },
  {
    type: "mega",
    label: "Services",
    href: "/services",
    groups: [
      {
        stream: "skilled",
        label: "Skilled migration",
        links: [
          {
            label: "Visa sub-classes",
            href: "/services/visa-sub-classes?stream=skilled",
            description: "Browse skilled visa options",
          },
          {
            label: "Points calculator",
            href: "/services/points-calculator",
            description: "Indicative GSM points estimate",
          },
        ],
      },
      {
        stream: "family",
        label: "Family",
        links: [
          {
            label: "Partner & family visas",
            href: "/services/visa-sub-classes?stream=family",
          },
        ],
      },
      {
        stream: "business",
        label: "Business & investment",
        links: [
          {
            label: "Business visas",
            href: "/services/visa-sub-classes?stream=business",
          },
        ],
      },
      {
        stream: "employer",
        label: "Employer sponsored",
        links: [
          {
            label: "Employer sponsored visas",
            href: "/services/visa-sub-classes?stream=employer",
          },
        ],
      },
    ],
  },
  { type: "link", label: "Resources", href: "/resources" },
  { type: "link", label: "Blog", href: "/blog" },
  { type: "link", label: "Contact", href: "/contact" },
];

export const footerNav: NavLink[] = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
];
