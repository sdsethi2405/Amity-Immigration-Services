import type { Variants } from "framer-motion";

const SPRING_200_20 = { type: "spring" as const, stiffness: 200, damping: 20 };
const EASE_OUT_06 = { duration: 0.6, ease: "easeOut" as const };
const INSTANT = { duration: 0 };

/**
 * Reveal animations must stay readable in SSR HTML.
 * Never use opacity: 0 for the initial/hidden state — if hydration or
 * whileInView fails (e.g. with Lenis), the page would look blank.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 1, y: 16 },
  show: { opacity: 1, y: 0, transition: SPRING_200_20 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: EASE_OUT_06 },
};

export const staggerChildren: Variants = {
  show: { transition: { staggerChildren: 0.1 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 1, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

/** Mega-menu panel open/close — 200ms ease-out. */
export const menuScaleIn: Variants = {
  hidden: { opacity: 1, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

export const slideInFromBottom: Variants = {
  hidden: { opacity: 1, y: 24 },
  show: { opacity: 1, y: 0, transition: EASE_OUT_06 },
};

/** Strip transitions and render the final visible state when reduced motion is preferred. */
export function withReducedMotion(
  variants: Variants,
  prefersReducedMotion: boolean,
): Variants {
  if (!prefersReducedMotion) {
    return variants;
  }

  const resolved: Variants = {};

  for (const [key, value] of Object.entries(variants)) {
    if (key === "show" && typeof value === "object" && value !== null) {
      const { transition: _transition, ...rest } = value as Record<
        string,
        unknown
      >;
      resolved[key] = { ...rest, transition: INSTANT };
      continue;
    }

    if (
      key === "hidden" &&
      typeof variants.show === "object" &&
      variants.show !== null
    ) {
      const { transition: _transition, ...rest } = variants.show as Record<
        string,
        unknown
      >;
      resolved[key] = { ...rest, transition: INSTANT };
      continue;
    }

    if (
      key === "show" &&
      typeof value === "object" &&
      value !== null &&
      "transition" in value &&
      typeof (value as { transition?: { staggerChildren?: number } })
        .transition === "object"
    ) {
      const transition = (
        value as { transition: { staggerChildren?: number } }
      ).transition;
      if (transition.staggerChildren !== undefined) {
        resolved[key] = {
          transition: { ...transition, staggerChildren: 0, delayChildren: 0 },
        };
        continue;
      }
    }

    resolved[key] = value;
  }

  return resolved;
}
