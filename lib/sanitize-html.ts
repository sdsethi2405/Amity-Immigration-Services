const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "a",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "span",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "rel", "target"]),
};

function isSafeHref(href: string): boolean {
  const trimmed = href.trim().toLowerCase();
  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:")
  );
}

/**
 * Allowlisted HTML sanitizer for CMS richtext.
 * Strips scripts, event handlers, and disallowed tags/attrs.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";

  if (typeof window === "undefined") {
    return sanitizeHtmlServer(dirty);
  }

  const template = document.createElement("template");
  template.innerHTML = dirty;
  sanitizeNode(template.content);
  return template.innerHTML;
}

function sanitizeHtmlServer(dirty: string): string {
  // Strip script/style blocks and event-handler attributes without a DOM.
  let html = dirty
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/?\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("\s*javascript:[^"]*"|'\s*javascript:[^']*'|[^\s>]*javascript:[^\s>]*)/gi, "");

  // Drop tags that are never allowed; keep content where sensible.
  html = html.replace(
    /<\/?(?!\/?(?:p|br|strong|b|em|i|u|a|ul|ol|li|h2|h3|h4|blockquote|span)\b)[a-z0-9:-]+\b[^>]*>/gi,
    "",
  );

  return html;
}

function sanitizeNode(root: ParentNode): void {
  const nodes = Array.from(root.childNodes);

  for (const node of nodes) {
    if (node.nodeType === Node.COMMENT_NODE) {
      node.parentNode?.removeChild(node);
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      const parent = el.parentNode;
      if (!parent) continue;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
      continue;
    }

    const allowed = ALLOWED_ATTRS[tag] ?? new Set<string>();
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || name === "style") {
        el.removeAttribute(attr.name);
        continue;
      }
      if (!allowed.has(name)) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (name === "href" && !isSafeHref(attr.value)) {
        el.removeAttribute(attr.name);
      }
      if (name === "target" && attr.value === "_blank") {
        el.setAttribute("rel", "noopener noreferrer");
      }
    }

    sanitizeNode(el);
  }
}
