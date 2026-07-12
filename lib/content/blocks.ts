import type { ContentBlock } from "@/lib/db/queries";

export type CtaBandBlock = {
  type: "cta-band";
  headline?: string;
  body?: string;
};

export type IntroBlock = {
  type: string;
  title?: string;
  body?: string;
};

export type CredentialItem = {
  title: string;
  body?: string;
};

export type CredentialsBlock = {
  type: "credentials";
  title?: string;
  items: CredentialItem[];
};

export type ResourceLinkItem = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
};

export type ResourceLinksBlock = {
  type: "resource-links";
  title?: string;
  links: ResourceLinkItem[];
};

export type CalloutBlock = {
  type: string;
  title?: string;
  body?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getBlock(blocks: ContentBlock[], type: string): Record<string, unknown> | null {
  const block = blocks.find((entry) => entry.type === type);
  return isRecord(block) ? block : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function parseIntroBlock(
  blocks: ContentBlock[],
  type: string,
): IntroBlock | null {
  const block = getBlock(blocks, type);
  if (!block) return null;

  const title = asString(block.title);
  const body = asString(block.body);

  if (!title && !body) return null;

  return { type, title, body };
}

export function parseCtaBandBlock(blocks: ContentBlock[]): CtaBandBlock | null {
  const block = getBlock(blocks, "cta-band");
  if (!block) return null;

  const headline = asString(block.headline);
  const body = asString(block.body);

  if (!headline && !body) return null;

  return { type: "cta-band", headline, body };
}

export function parseCredentialsBlock(blocks: ContentBlock[]): CredentialsBlock | null {
  const block = getBlock(blocks, "credentials");
  if (!block) return null;

  const items = Array.isArray(block.items)
    ? block.items.filter(isRecord).flatMap((entry) => {
        const title = asString(entry.title);
        if (!title) return [];
        return [{ title, body: asString(entry.body) }];
      })
    : [];

  const title = asString(block.title);

  if (!title && items.length === 0) return null;

  return { type: "credentials", title, items };
}

function parseOneResourceLinksBlock(
  block: Record<string, unknown>,
): ResourceLinksBlock | null {
  const links = Array.isArray(block.links)
    ? block.links.filter(isRecord).flatMap((entry) => {
        const label = asString(entry.label);
        const href = asString(entry.href);
        if (!label || !href) return [];
        return [
          {
            label,
            href,
            description: asString(entry.description),
            external: entry.external === true,
          },
        ];
      })
    : [];

  const title = asString(block.title);

  if (!title && links.length === 0) return null;

  return { type: "resource-links", title, links };
}

export function parseResourceLinksBlock(
  blocks: ContentBlock[],
): ResourceLinksBlock | null {
  const block = getBlock(blocks, "resource-links");
  if (!block) return null;
  return parseOneResourceLinksBlock(block);
}

/** All resource-links sections on a page (official + on-site, etc.). */
export function parseAllResourceLinksBlocks(
  blocks: ContentBlock[],
): ResourceLinksBlock[] {
  return blocks.flatMap((block) => {
    if (!isRecord(block) || asString(block.type) !== "resource-links") {
      return [];
    }
    const parsed = parseOneResourceLinksBlock(block);
    return parsed ? [parsed] : [];
  });
}

export function parseSectionTitle(
  blocks: ContentBlock[],
  type: string,
): string | undefined {
  const block = getBlock(blocks, type);
  return block ? asString(block.title) : undefined;
}

export function parseCalloutBlock(
  blocks: ContentBlock[],
  type: string,
): CalloutBlock | null {
  const block = getBlock(blocks, type);
  if (!block) return null;

  const title = asString(block.title);
  const body = asString(block.body);

  if (!title && !body) return null;

  return { type, title, body };
}
