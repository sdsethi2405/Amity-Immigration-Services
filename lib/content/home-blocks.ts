import type { ContentBlock, VisaStream } from "@/lib/db/queries";

export type HeroBlock = {
  type: "hero";
  headline?: string;
  subhead?: string;
};

export type StreamCardContent = {
  stream: VisaStream;
  label: string;
  description?: string;
};

export type StreamsOverviewBlock = {
  type: "streams-overview";
  title?: string;
  streams?: StreamCardContent[];
};

export type TrustPoint = {
  title: string;
  body?: string;
};

export type WhyAmityBlock = {
  type: "why-amity";
  title?: string;
  points?: TrustPoint[];
};

export type SectionTitleBlock = {
  type: "featured-services" | "latest-insights";
  title?: string;
};

export { type CtaBandBlock, parseCtaBandBlock } from "@/lib/content/blocks";

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

const STREAMS: VisaStream[] = [
  "skilled",
  "employer",
  "family",
  "student",
  "business",
  "visitor",
  "bridging",
  "humanitarian",
  "other",
];

function isVisaStream(value: unknown): value is VisaStream {
  return typeof value === "string" && STREAMS.includes(value as VisaStream);
}

export function parseHeroBlock(blocks: ContentBlock[]): HeroBlock | null {
  const block = getBlock(blocks, "hero");
  if (!block) return null;

  const headline = asString(block.headline);
  const subhead = asString(block.subhead);

  if (!headline && !subhead) return null;

  return { type: "hero", headline, subhead };
}

export function parseStreamsOverviewBlock(
  blocks: ContentBlock[],
): StreamsOverviewBlock | null {
  const block = getBlock(blocks, "streams-overview");
  if (!block) return null;

  const streams = Array.isArray(block.streams)
    ? block.streams
        .filter(isRecord)
        .map((entry): StreamCardContent | null => {
          if (!isVisaStream(entry.stream)) return null;
          const label = asString(entry.label);
          if (!label) return null;
          const description = asString(entry.description);
          return description
            ? { stream: entry.stream, label, description }
            : { stream: entry.stream, label };
        })
        .filter((entry): entry is StreamCardContent => entry !== null)
    : [];

  const title = asString(block.title);

  if (!title && streams.length === 0) return null;

  return { type: "streams-overview", title, streams };
}

export function parseWhyAmityBlock(blocks: ContentBlock[]): WhyAmityBlock | null {
  const block = getBlock(blocks, "why-amity");
  if (!block) return null;

  const points = Array.isArray(block.points)
    ? block.points
        .filter(isRecord)
        .map((entry): TrustPoint | null => {
          const title = asString(entry.title);
          if (!title) return null;
          const body = asString(entry.body);
          return body ? { title, body } : { title };
        })
        .filter((entry): entry is TrustPoint => entry !== null)
    : [];

  const title = asString(block.title);

  if (!title && points.length === 0) return null;

  return { type: "why-amity", title, points };
}

export function parseSectionTitleBlock(
  blocks: ContentBlock[],
  type: SectionTitleBlock["type"],
): string | undefined {
  const block = getBlock(blocks, type);
  return block ? asString(block.title) : undefined;
}
