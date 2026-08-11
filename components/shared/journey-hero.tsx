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
 * - **Back** (speed 0.15): slow topographic / horizon lines (SVG paths).
 * - **Mid** (speed 0.4): dotted travel path with stroke-dashoffset animation;
 *   three waypoint markers pulse when they reach the centre of the viewport.
 * - **Front** (speed 0.7): passport-stamp / document motifs with slight rotation.
 *
 * Mount: layers fade and rise via `fadeUp` with 120ms stagger.
 * Reduced motion: all layers render in final resting position — no parallax, no path animation.
 * Mobile (<768px): front layer hidden; back + mid use half the parallax range.
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
            <path
              d="M0,300 C180,260 360,320 540,280 S900,240 1200,270"
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="1"
              opacity="0.22"
            />
            <path
              d="M0,280 C200,240 400,300 600,260 S1000,220 1200,250"
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="1.5"
              opacity="0.35"
            />
            <path
              d="M0,250 C220,210 420,270 640,230 S1040,190 1200,210"
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="1"
              opacity="0.28"
            />
            <path
              d="M0,220 C160,190 340,240 520,200 S880,160 1200,180"
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="0.75"
              opacity="0.18"
            />
          </svg>
        </motion.div>

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
            <motion.path
              d="M80,300 Q300,180 600,220 T1120,140"
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="2"
              strokeDasharray="8 12"
              style={{ strokeDashoffset: pathOffset }}
            />
            {[
              { cx: 280, cy: 240 },
              { cx: 600, cy: 220 },
              { cx: 920, cy: 160 },
            ].map(({ cx, cy }) => (
              <g key={cx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="12"
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="1"
                  opacity="0.35"
                />
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill="var(--color-red)"
                  animate={
                    prefersReducedMotion
                      ? { scale: 1, opacity: 0.8 }
                      : { scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }
                  }
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </g>
            ))}
          </svg>
        </motion.div>

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
              <g opacity="0.55" transform="rotate(-8 216 144)">
                <rect
                  x="180"
                  y="120"
                  width="72"
                  height="48"
                  rx="2"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="1.5"
                />
                <line
                  x1="190"
                  y1="134"
                  x2="242"
                  y2="134"
                  stroke="var(--color-primary)"
                  strokeWidth="1"
                  opacity="0.7"
                />
                <line
                  x1="190"
                  y1="144"
                  x2="230"
                  y2="144"
                  stroke="var(--color-primary)"
                  strokeWidth="1"
                  opacity="0.55"
                />
                <line
                  x1="190"
                  y1="154"
                  x2="236"
                  y2="154"
                  stroke="var(--color-primary)"
                  strokeWidth="1"
                  opacity="0.4"
                />
              </g>

              <g opacity="0.5" transform="rotate(6 1020 250)">
                <rect
                  x="980"
                  y="220"
                  width="80"
                  height="56"
                  rx="2"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="1.25"
                />
                <rect
                  x="990"
                  y="232"
                  width="28"
                  height="20"
                  rx="1"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="1"
                  opacity="0.7"
                />
                <line
                  x1="1028"
                  y1="236"
                  x2="1050"
                  y2="236"
                  stroke="var(--color-primary)"
                  strokeWidth="1"
                  opacity="0.55"
                />
                <line
                  x1="1028"
                  y1="246"
                  x2="1044"
                  y2="246"
                  stroke="var(--color-primary)"
                  strokeWidth="1"
                  opacity="0.4"
                />
              </g>

              <g opacity="0.45">
                <circle
                  cx="880"
                  cy="160"
                  r="28"
                  fill="none"
                  stroke="var(--color-red)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="880"
                  cy="160"
                  r="22"
                  fill="none"
                  stroke="var(--color-red)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <text
                  x="880"
                  y="164"
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--color-red)"
                  fontFamily="var(--font-playfair), serif"
                  opacity="0.8"
                >
                  ENTRY
                </text>
              </g>

              <g opacity="0.4" transform="rotate(-12 340 300)">
                <circle
                  cx="340"
                  cy="300"
                  r="20"
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="1.25"
                />
                <circle
                  cx="340"
                  cy="300"
                  r="14"
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="0.75"
                />
              </g>
            </svg>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
