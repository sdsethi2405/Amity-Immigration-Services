import type { ContentBlock } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

type ContentBlockRendererProps = {
  blocks: ContentBlock[];
  className?: string;
};

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case "heading": {
      const level = typeof block.level === "number" ? block.level : 2;
      const text = typeof block.text === "string" ? block.text : "";
      if (!text) return null;

      if (level === 3) {
        return (
          <h3
            key={`heading-${index}`}
            className="mt-8 font-heading text-2xl font-semibold text-foreground"
          >
            {text}
          </h3>
        );
      }

      return (
        <h2
          key={`heading-${index}`}
          className="mt-10 font-heading text-3xl font-semibold text-foreground"
        >
          {text}
        </h2>
      );
    }

    case "richtext": {
      const html = typeof block.html === "string" ? block.html : "";
      if (!html) return null;

      return (
        <div
          key={`richtext-${index}`}
          className="prose prose-neutral mt-4 max-w-none text-foreground prose-p:text-muted-foreground prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    case "image": {
      const src = typeof block.src === "string" ? block.src : "";
      const alt = typeof block.alt === "string" ? block.alt : "";
      if (!src) return null;

      return (
        <figure key={`image-${index}`} className="mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full rounded-lg border border-border"
          />
        </figure>
      );
    }

    case "cta": {
      const label = typeof block.label === "string" ? block.label : "";
      const href = typeof block.href === "string" ? block.href : "";
      if (!label || !href) return null;

      return (
        <p key={`cta-${index}`} className="mt-8">
          <a
            href={href}
            className="inline-flex font-medium text-primary underline-offset-4 hover:underline"
          >
            {label}
          </a>
        </p>
      );
    }

    case "callout": {
      const text = typeof block.text === "string" ? block.text : "";
      if (!text) return null;

      return (
        <aside
          key={`callout-${index}`}
          className="mt-6 rounded-lg border border-border bg-accent px-4 py-3 text-sm text-muted-foreground"
        >
          {text}
        </aside>
      );
    }

    default:
      return null;
  }
}

export function ContentBlockRenderer({
  blocks,
  className,
}: ContentBlockRendererProps) {
  const rendered = blocks
    .map((block, index) => renderBlock(block, index))
    .filter(Boolean);

  if (rendered.length === 0) {
    return null;
  }

  return <div className={cn("space-y-2", className)}>{rendered}</div>;
}
