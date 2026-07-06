"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { fadeUp, withReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const LAYER_STAGGER_MS = 120;
const MOBILE_BREAKPOINT = 768;

type JourneyHeroProps = {
  className?: string;
};

/**
 * JourneyHero — signature visual for the Home hero.
 *
 * A layered parallax "journey to permanent residency" motif. Three depth layers
 * move at different speeds as the user scrolls the hero into view, then settle.
 *
 * Layers:
 * - **Back** (speed 0.15): slow topographic / horizon line (SVG path).
 * - **Mid** (speed 0.4): dotted travel path with stroke-dashoffset animation;
 *   three waypoint markers pulse when they reach the centre of the viewport.
 * - **Front** (speed 0.7): passport-stamp / document motifs with slight rotation.
 *
 * Mount: layers fade and rise via `fadeUp` with 120ms stagger.
 * Reduced motion: all layers render in final resting position — no parallax, no path animation.
 * Mobile (<768px): front layer hidden; back + mid use half the parallax range.
 *
 * SVG artwork is placeholder comments for Stage 5. `useTransform` ranges are wired.
 */
export function JourneyHero({ className }: JourneyHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const parallaxMultiplier = isMobile ? 0.5 : 1;

  const backY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [24 * parallaxMultiplier, -24 * parallaxMultiplier],
  );
  const midY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [64 * parallaxMultiplier, -64 * parallaxMultiplier],
  );
  const frontY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [112, -112],
  );
  const frontRotate = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [-4, 4],
  );
  const pathOffset = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [320, 0],
  );

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const sync = () => {
      setPrefersReducedMotion(motionQuery.matches);
      setIsMobile(widthQuery.matches);
    };

    sync();
    motionQuery.addEventListener("change", sync);
    widthQuery.addEventListener("change", sync);

    return () => {
      motionQuery.removeEventListener("change", sync);
      widthQuery.removeEventListener("change", sync);
    };
  }, []);

  const layerVariants = withReducedMotion(fadeUp, prefersReducedMotion);

  return (
    <div
      ref={containerRef}
      className={cn("relative aspect-[16/9] w-full overflow-hidden", className)}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        initial="hidden"
        animate="show"
        variants={{
          show: {
            transition: {
              staggerChildren: prefersReducedMotion ? 0 : LAYER_STAGGER_MS / 1000,
            },
          },
        }}
      >
        {/* Back layer — topographic horizon, parallax 0.15 */}
        <motion.div
          className="absolute inset-0"
          style={{ y: backY }}
          variants={layerVariants}
        >
          <svg
            className="h-full w-full"
            viewBox="0 0 1200 400"
            preserveAspectRatio="xMidYMid slice"
            role="presentation"
          >
            {/*
              Stage 5 artwork: slow topographic horizon line.
              <path d="M0,280 C200,240 400,300 600,260 S1000,220 1200,250" fill="none" stroke="var(--color-muted)" strokeWidth="1.5" opacity="0.35" />
            */}
            <path
              d="M0,280 C200,240 400,300 600,260 S1000,220 1200,250"
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="1.5"
              opacity="0.35"
            />
          </svg>
        </motion.div>

        {/* Mid layer — dotted travel path, parallax 0.4 */}
        <motion.div
          className="absolute inset-0"
          style={{ y: midY }}
          variants={layerVariants}
        >
          <svg
            className="h-full w-full"
            viewBox="0 0 1200 400"
            preserveAspectRatio="xMidYMid slice"
            role="presentation"
          >
            {/*
              Stage 5 artwork: dotted route with three waypoint markers.
              <motion.path strokeDasharray="8 12" stroke="var(--color-gold)" />
              Waypoints at x=280, x=600, x=920 — pulse when centred in viewport.
            */}
            <motion.path
              d="M80,300 Q300,180 600,220 T1120,140"
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="2"
              strokeDasharray="8 12"
              style={{ strokeDashoffset: pathOffset }}
            />
            {[280, 600, 920].map((cx) => (
              <motion.circle
                key={cx}
                cx={cx}
                cy={cx === 600 ? 220 : cx < 600 ? 240 : 160}
                r="6"
                fill="var(--color-red)"
                animate={
                  prefersReducedMotion
                    ? { scale: 1, opacity: 0.8 }
                    : { scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }
                }
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </svg>
        </motion.div>

        {/* Front layer — passport stamps, parallax 0.7; hidden on mobile */}
        {!isMobile && (
          <motion.div
            className="absolute inset-0"
            style={{ y: frontY, rotate: frontRotate }}
            variants={layerVariants}
          >
            <svg
              className="h-full w-full"
              viewBox="0 0 1200 400"
              preserveAspectRatio="xMidYMid slice"
              role="presentation"
            >
              {/*
                Stage 5 artwork: passport-stamp / document motifs.
                <rect /> and <circle /> clusters at 18%/72% horizontal.
              */}
              <rect
                x="180"
                y="120"
                width="72"
                height="48"
                rx="2"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="1.5"
                opacity="0.5"
                transform="rotate(-8 216 144)"
              />
              <circle
                cx="880"
                cy="160"
                r="28"
                fill="none"
                stroke="var(--color-red)"
                strokeWidth="1.5"
                opacity="0.45"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
