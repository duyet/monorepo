/**
 * ClaudeCard visual assets: the five hand-drawn 120×100 background glyphs and
 * the eight-entry pastel palette.
 *
 * These are static design tokens, not behaviour — they were inline in
 * `ClaudeCard.tsx` and made the component read as 400 lines when the actual
 * card logic is under 150. Kept in one module so a card variant and the
 * palette stay a single import apart and cannot drift.
 */

import { cn } from "@duyet/libs/utils";

// ── Background glyphs ─────────────────────────────────────────────────────────
// Hand-drawn style, matching the Anthropic reference: a 120×100 viewBox with a
// white-filled subject and `currentColor` strokes, so the surrounding text
// color drives the whole illustration.

const BlocksIcon = () => (
  <svg
    viewBox="0 0 120 100"
    fill="none"
    className="w-full h-full"
    strokeWidth="2"
    stroke="currentColor"
  >
    {/* Hand holding shapes */}
    <path
      d="M30 70 Q25 60 30 50 Q35 45 40 50 L45 55"
      fill="none"
      strokeLinecap="round"
    />
    <path d="M40 50 Q45 40 55 45 L60 50" fill="none" strokeLinecap="round" />
    {/* Geometric shapes */}
    <rect
      x="55"
      y="25"
      width="20"
      height="20"
      rx="2"
      fill="white"
      stroke="currentColor"
    />
    <circle cx="90" cy="35" r="12" fill="white" stroke="currentColor" />
    <polygon points="70,60 85,60 77.5,45" fill="white" stroke="currentColor" />
    {/* Squiggly lines */}
    <path
      d="M85 55 Q90 50 95 55 Q100 60 105 55"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M25 35 Q30 30 25 25 Q20 20 25 15"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const CodeBoardIcon = () => (
  <svg
    viewBox="0 0 120 100"
    fill="none"
    className="w-full h-full"
    strokeWidth="2"
    stroke="currentColor"
  >
    {/* Presentation board frame */}
    <rect
      x="25"
      y="20"
      width="70"
      height="50"
      rx="3"
      fill="white"
      stroke="currentColor"
    />
    {/* Board hanger */}
    <line x1="60" y1="10" x2="60" y2="20" strokeLinecap="round" />
    <circle cx="60" cy="8" r="4" fill="none" />
    {/* Code symbols */}
    <text
      x="40"
      y="50"
      fontSize="20"
      fill="currentColor"
      fontFamily="monospace"
    >
      &lt;/&gt;
    </text>
    {/* Hand pointer */}
    <path
      d="M55 75 Q50 85 55 90 Q60 95 65 90"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="60" cy="82" r="6" fill="none" strokeWidth="1.5" />
    <circle cx="60" cy="82" r="3" fill="currentColor" />
  </svg>
);

const GlobeCodeIcon = () => (
  <svg
    viewBox="0 0 120 100"
    fill="none"
    className="w-full h-full"
    strokeWidth="2"
    stroke="currentColor"
  >
    {/* Globe */}
    <circle cx="60" cy="50" r="25" fill="white" stroke="currentColor" />
    {/* Globe lines */}
    <ellipse cx="60" cy="50" rx="25" ry="10" fill="none" />
    <ellipse cx="60" cy="50" rx="10" ry="25" fill="none" />
    <line x1="35" y1="50" x2="85" y2="50" />
    {/* Code brackets */}
    <path
      d="M20 35 L10 50 L20 65"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    />
    <path
      d="M100 35 L110 50 L100 65"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    />
  </svg>
);

// Arrow icon for nested cards
export const ArrowIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={cn("w-5 h-5", className)}
    strokeWidth="2"
    stroke="currentColor"
  >
    <path
      d="M5 12h14M12 5l7 7-7 7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Network/connection icon (hand-drawn style)
const NetworkIcon = () => (
  <svg
    viewBox="0 0 120 100"
    fill="none"
    className="w-full h-full"
    strokeWidth="2"
    stroke="currentColor"
  >
    {/* Central node */}
    <circle cx="60" cy="50" r="8" fill="white" stroke="currentColor" />
    {/* Connected nodes */}
    <circle cx="30" cy="30" r="6" fill="white" stroke="currentColor" />
    <circle cx="90" cy="30" r="6" fill="white" stroke="currentColor" />
    <circle cx="30" cy="70" r="6" fill="white" stroke="currentColor" />
    <circle cx="90" cy="70" r="6" fill="white" stroke="currentColor" />
    {/* Connection lines */}
    <path d="M35 33 L52 45" strokeLinecap="round" />
    <path d="M85 33 L68 45" strokeLinecap="round" />
    <path d="M35 67 L52 55" strokeLinecap="round" />
    <path d="M85 67 L68 55" strokeLinecap="round" />
    {/* Hand pointing */}
    <path
      d="M95 80 Q100 75 105 80 Q110 85 105 90"
      fill="none"
      strokeLinecap="round"
    />
    {/* Squiggly accent */}
    <path
      d="M15 50 Q20 45 15 40 Q10 35 15 30"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

// Chart/analytics icon (hand-drawn style)
const ChartIcon = () => (
  <svg
    viewBox="0 0 120 100"
    fill="none"
    className="w-full h-full"
    strokeWidth="2"
    stroke="currentColor"
  >
    {/* Chart background */}
    <rect
      x="25"
      y="20"
      width="70"
      height="55"
      rx="3"
      fill="white"
      stroke="currentColor"
    />
    {/* Chart line */}
    <path
      d="M35 55 L50 45 L65 50 L80 30"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
    />
    {/* Data points */}
    <circle cx="35" cy="55" r="3" fill="currentColor" />
    <circle cx="50" cy="45" r="3" fill="currentColor" />
    <circle cx="65" cy="50" r="3" fill="currentColor" />
    <circle cx="80" cy="30" r="3" fill="currentColor" />
    {/* Hand pointing */}
    <path
      d="M55 80 Q50 90 55 95 Q60 100 65 95"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="60" cy="87" r="5" fill="none" strokeWidth="1.5" />
  </svg>
);

/** The five glyphs, indexed in lockstep with `colorSchemes`. */
export const claudeCardIcons = [
  BlocksIcon,
  CodeBoardIcon,
  GlobeCodeIcon,
  NetworkIcon,
  ChartIcon,
] as const;

// ── Palette ───────────────────────────────────────────────────────────────────
// Pastel color palette matching homepage design system. Index 0–7; both card
// variants pick an entry and wrap with `% colorSchemes.length`.

export interface ClaudeCardColor {
  bg: string;
  bgDark: string;
  nested: string;
  nestedDark: string;
  text: string;
  textDark: string;
}

export const colorSchemes: ClaudeCardColor[] = [
  {
    bg: "bg-terracotta-light", // Soft peach #f4b8a0
    bgDark: "dark:bg-terracotta/30",
    nested: "bg-terracotta/20", // Darker for nested cards
    nestedDark: "dark:bg-terracotta/40",
    text: "text-[#1a1a1a]/70",
    textDark: "dark:text-[#f8f8f2]/70",
  },
  {
    bg: "bg-lavender-light", // Soft lavender #dfe0ec
    bgDark: "dark:bg-lavender/30",
    nested: "bg-lavender/40",
    nestedDark: "dark:bg-lavender/50",
    text: "text-[#1a1a1a]/70",
    textDark: "dark:text-[#f8f8f2]/70",
  },
  {
    bg: "bg-sage-light", // Soft sage #d0ddd8
    bgDark: "dark:bg-sage/30",
    nested: "bg-sage/40",
    nestedDark: "dark:bg-sage/50",
    text: "text-[#1a1a1a]/70",
    textDark: "dark:text-[#f8f8f2]/70",
  },
  {
    bg: "bg-oat-light", // Warm beige #ebe5db (like "Featured courses")
    bgDark: "dark:bg-oat/30",
    nested: "bg-oat/60",
    nestedDark: "dark:bg-oat/50",
    text: "text-[#1a1a1a]/70",
    textDark: "dark:text-[#f8f8f2]/70",
  },
  {
    bg: "bg-cream", // Warm cream #faf8f3
    bgDark: "dark:bg-cream-warm/30",
    nested: "bg-cream-warm",
    nestedDark: "dark:bg-cream-warm/50",
    text: "text-[#1a1a1a]/70",
    textDark: "dark:text-[#f8f8f2]/70",
  },
  {
    bg: "bg-cactus-light", // Muted green #d4e3de
    bgDark: "dark:bg-cactus/30",
    nested: "bg-cactus/40",
    nestedDark: "dark:bg-cactus/50",
    text: "text-[#1a1a1a]/70",
    textDark: "dark:text-[#f8f8f2]/70",
  },
  {
    bg: "bg-coral-light", // Soft coral #ffc4a8
    bgDark: "dark:bg-coral/30",
    nested: "bg-coral/30",
    nestedDark: "dark:bg-coral/50",
    text: "text-[#1a1a1a]/70",
    textDark: "dark:text-[#f8f8f2]/70",
  },
  {
    bg: "bg-ivory", // Off-white #f5f3ef
    bgDark: "dark:bg-ivory-medium/30",
    nested: "bg-ivory-medium",
    nestedDark: "dark:bg-ivory-medium/50",
    text: "text-[#1a1a1a]/70",
    textDark: "dark:text-[#f8f8f2]/70",
  },
];

/** Simple hash function for deterministic "random" based on a string. */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
