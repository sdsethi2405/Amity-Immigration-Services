import {
  Briefcase,
  ClipboardCheck,
  Heart,
  icons,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const KEBAB_ALIASES: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  "clipboard-check": ClipboardCheck,
  heart: Heart,
};

function toPascalCase(name: string): string {
  return name
    .trim()
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Resolve a CMS icon name (PascalCase or kebab-case) to a Lucide component.
 * Falls back to Briefcase when the name is missing or unknown.
 */
export function getLucideIcon(name: string | null | undefined): LucideIcon {
  if (!name?.trim()) {
    return Briefcase;
  }

  const trimmed = name.trim();
  const kebab = trimmed.toLowerCase();

  if (kebab in KEBAB_ALIASES) {
    return KEBAB_ALIASES[kebab];
  }

  const pascal = toPascalCase(trimmed);
  const fromMap = (icons as Record<string, LucideIcon | undefined>)[pascal];
  return fromMap ?? Briefcase;
}

export function LucideIconByName({
  name,
  ...props
}: LucideProps & { name: string | null | undefined }) {
  const Icon = getLucideIcon(name);
  return <Icon {...props} />;
}
