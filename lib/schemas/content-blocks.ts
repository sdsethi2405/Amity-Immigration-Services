import { z } from "zod";

export const EDITABLE_BLOCK_TYPES = [
  "heading",
  "richtext",
  "image",
  "cta",
  "callout",
] as const;

export type EditableBlockType = (typeof EDITABLE_BLOCK_TYPES)[number];

export const headingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]).default(2),
  text: z.string().trim().min(1).max(300),
});

export const richtextBlockSchema = z.object({
  type: z.literal("richtext"),
  html: z.string().trim().min(1).max(50_000),
});

export const imageBlockSchema = z.object({
  type: z.literal("image"),
  src: z.string().trim().min(1).max(2000),
  alt: z.string().trim().max(300).default(""),
});

export const ctaBlockSchema = z.object({
  type: z.literal("cta"),
  label: z.string().trim().min(1).max(120),
  href: z.string().trim().min(1).max(500),
});

export const calloutBlockSchema = z.object({
  type: z.literal("callout"),
  text: z.string().trim().min(1).max(2000),
  variant: z.string().trim().max(40).optional(),
});

export const editableBlockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  richtextBlockSchema,
  imageBlockSchema,
  ctaBlockSchema,
  calloutBlockSchema,
]);

/** Any stored page block — editable types plus fixed template blocks. */
export const contentBlockSchema = z
  .object({
    type: z.string().min(1).max(80),
  })
  .passthrough();

export type ContentBlockInput = z.infer<typeof contentBlockSchema>;
export type EditableBlockInput = z.infer<typeof editableBlockSchema>;

export function createEmptyBlock(type: EditableBlockType): EditableBlockInput {
  switch (type) {
    case "heading":
      return { type: "heading", level: 2, text: "Heading" };
    case "richtext":
      return { type: "richtext", html: "<p></p>" };
    case "image":
      return { type: "image", src: "", alt: "" };
    case "cta":
      return { type: "cta", label: "Learn more", href: "/contact" };
    case "callout":
      return { type: "callout", text: "" };
  }
}
