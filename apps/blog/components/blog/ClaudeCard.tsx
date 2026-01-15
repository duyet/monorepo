"use client";

import { cn } from "@duyet/libs/utils";
import { useState } from "react";

export interface ClaudeCardValueItem {
  label: string;
  link?: string;
}

export interface ClaudeCardItem {
  label: string;
  items: ClaudeCardValueItem[]; // Array of label/link items
}

export interface ClaudeCardProps {
  title: string;
  items: ClaudeCardItem[];
  className?: string;
}

// Nested card item - supports multiple linked items per card
export interface ClaudeNestedCard {
  label: string; // "Coding Agent"
  items: ClaudeCardValueItem[]; // Array of {label, link?}
}

// Extended props for nested variant
export interface ClaudeCardNestedProps {
  title: string;
  description?: string; // Description text below title
  actionButton?: {
    // "See all courses" button
    label: string;
    link: string;
  };
  nestedCards: ClaudeNestedCard[]; // Grid of inner cards
  colorScheme?: number; // Allow explicit color selection (0-7)
  className?: string;
}

// Grid card item (for simple card grids like "On the list")
export interface ClaudeGridCard {
  title: string;
  description?: string;
  link?: string;
}

// Props for grid variant
export interface ClaudeCardGridProps {
  cards: ClaudeGridCard[];
  colorScheme?: number; // Allow explicit color selection (0-7)
  className?: string;
}

// SVG Icons for each item - hand-drawn style matching the reference
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
const ArrowIcon = ({ className }: { className?: string }) => (
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

// Pastel color palette matching homepage design system
const colorSchemes = [
  {
    bg: "bg-terracotta-light", // Soft peach #f4b8a0
    bgDark: "dark:bg-terracotta/30",
    nested: "bg-terracotta/20", // Darker for nested cards
    nestedDark: "dark:bg-terracotta/40",
    text: "text-gray-700",
    textDark: "dark:text-gray-200",
  },
  {
    bg: "bg-lavender-light", // Soft lavender #dfe0ec
    bgDark: "dark:bg-lavender/30",
    nested: "bg-lavender/40",
    nestedDark: "dark:bg-lavender/50",
    text: "text-gray-700",
    textDark: "dark:text-gray-200",
  },
  {
    bg: "bg-sage-light", // Soft sage #d0ddd8
    bgDark: "dark:bg-sage/30",
    nested: "bg-sage/40",
    nestedDark: "dark:bg-sage/50",
    text: "text-gray-700",
    textDark: "dark:text-gray-200",
  },
  {
    bg: "bg-oat-light", // Warm beige #ebe5db (like "Featured courses")
    bgDark: "dark:bg-oat/30",
    nested: "bg-oat/60",
    nestedDark: "dark:bg-oat/50",
    text: "text-gray-700",
    textDark: "dark:text-gray-200",
  },
  {
    bg: "bg-cream", // Warm cream #faf8f3
    bgDark: "dark:bg-cream-warm/30",
    nested: "bg-cream-warm",
    nestedDark: "dark:bg-cream-warm/50",
    text: "text-gray-700",
    textDark: "dark:text-gray-200",
  },
  {
    bg: "bg-cactus-light", // Muted green #d4e3de
    bgDark: "dark:bg-cactus/30",
    nested: "bg-cactus/40",
    nestedDark: "dark:bg-cactus/50",
    text: "text-gray-700",
    textDark: "dark:text-gray-200",
  },
  {
    bg: "bg-coral-light", // Soft coral #ffc4a8
    bgDark: "dark:bg-coral/30",
    nested: "bg-coral/30",
    nestedDark: "dark:bg-coral/50",
    text: "text-gray-700",
    textDark: "dark:text-gray-200",
  },
  {
    bg: "bg-ivory", // Off-white #f5f3ef
    bgDark: "dark:bg-ivory-medium/30",
    nested: "bg-ivory-medium",
    nestedDark: "dark:bg-ivory-medium/50",
    text: "text-gray-700",
    textDark: "dark:text-gray-200",
  },
];

const icons = [BlocksIcon, CodeBoardIcon, GlobeCodeIcon, NetworkIcon, ChartIcon];

/**
 * ClaudeCard - Anthropic-style card with title and numbered items
 * Features: rounded corners, warm colors, SVG background that changes on hover
 */
export function ClaudeCard({ title, items, className }: ClaudeCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Pick icon based on hover state, default to first
  const activeIndex = hoveredIndex ?? 0;
  const ActiveIcon = icons[activeIndex % icons.length];
  const activeColor = colorSchemes[activeIndex % colorSchemes.length];

  return (
    <div
      className={cn(
        "my-8 rounded-3xl overflow-hidden transition-colors duration-300",
        activeColor.bg,
        activeColor.bgDark,
        className
      )}
    >
      <div className="relative p-4 sm:p-8 md:p-10">
        {/* SVG Background Icon */}
        <div
          className={cn(
            "absolute right-2 top-2 w-16 h-16",
            "lg:right-auto lg:top-auto lg:left-4 lg:bottom-4 lg:w-32 lg:h-32 xl:w-40 xl:h-40",
            "opacity-20 pointer-events-none transition-all duration-300",
            activeColor.text,
            activeColor.textDark
          )}
        >
          <ActiveIcon />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left side - Title */}
          <div className="flex items-start">
            <h3
              className={cn(
                "text-2xl sm:text-3xl md:text-4xl font-serif leading-tight",
                "text-gray-900 dark:text-white"
              )}
            >
              {title}
            </h3>
          </div>

          {/* Right side - Numbered list */}
          <div className="space-y-0">
            {items.map((item, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "flex items-baseline gap-3 sm:gap-4 py-3 sm:py-4",
                  index !== items.length - 1 &&
                    "border-b border-gray-900/20 dark:border-white/20"
                )}
              >
                <span
                  className={cn(
                    "text-xs sm:text-sm font-mono w-5 sm:w-6 opacity-60",
                    activeColor.text,
                    activeColor.textDark
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 flex flex-col gap-1">
                  <strong
                    className={cn(
                      "font-semibold text-base sm:text-lg",
                      "text-gray-900 dark:text-white"
                    )}
                  >
                    {item.label}
                  </strong>
                  {item.items && item.items.length > 0 && (
                    <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                      {item.items.map((valueItem, itemIndex) => (
                        <span
                          key={itemIndex}
                          className="inline-flex items-center"
                        >
                          {valueItem.link ? (
                            <a
                              href={valueItem.link}
                              className={cn(
                                "text-sm sm:text-base cursor-pointer",
                                activeColor.text,
                                activeColor.textDark,
                                "opacity-70 hover:opacity-100",
                                "underline underline-offset-2",
                                "decoration-current/40 hover:decoration-current/70",
                                "transition-all duration-200"
                              )}
                            >
                              {valueItem.label}
                            </a>
                          ) : (
                            <span
                              className={cn(
                                "text-sm sm:text-base opacity-70",
                                activeColor.text,
                                activeColor.textDark
                              )}
                            >
                              {valueItem.label}
                            </span>
                          )}
                          {itemIndex < item.items.length - 1 && (
                            <span
                              className={cn(
                                "ml-1 opacity-50",
                                activeColor.text,
                                activeColor.textDark
                              )}
                            >
                              ,
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ClaudeCardNested - Anthropic-style card with nested inner cards
 * Layout: Title/description on left, grid of clickable cards on right
 * Like the "Featured courses" design from Anthropic Academy
 */
// Simple hash function for deterministic "random" based on string
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export function ClaudeCardNested({
  title,
  description,
  actionButton,
  nestedCards,
  colorScheme,
  className,
}: ClaudeCardNestedProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Deterministic color based on title hash (SSR-safe)
  const baseColor = colorScheme ?? hashString(title) % colorSchemes.length;

  // Change color based on which nested card is hovered
  const activeIndex = hoveredIndex !== null ? hoveredIndex : 0;
  const activeColor =
    colorSchemes[(baseColor + activeIndex) % colorSchemes.length];
  const ActiveIcon = icons[(baseColor + activeIndex) % icons.length];

  return (
    <div
      className={cn(
        "my-8 rounded-3xl overflow-hidden transition-colors duration-300",
        activeColor.bg,
        activeColor.bgDark,
        className
      )}
    >
      <div className="relative p-6 sm:p-8 md:p-10">
        {/* SVG Background Icon */}
        <div
          className={cn(
            "absolute right-4 bottom-4 w-24 h-24",
            "lg:w-32 lg:h-32 xl:w-40 xl:h-40",
            "opacity-10 pointer-events-none",
            activeColor.text,
            activeColor.textDark
          )}
        >
          <ActiveIcon />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-5 lg:gap-7">
          {/* Left side - Title, Description, Action Button */}
          <div className="flex flex-col justify-start">
            <h3
              className={cn(
                "text-2xl md:text-4xl font-serif leading-tight mt-2",
                "text-gray-900 dark:text-white"
              )}
            >
              {title}
            </h3>

            {description && (
              <p
                className={cn(
                  "text-base leading-relaxed",
                  activeColor.text,
                  activeColor.textDark,
                  "opacity-80"
                )}
              >
                {description}
              </p>
            )}

            {actionButton && (
              <div className="mt-2">
                <a
                  href={actionButton.link}
                  className={cn(
                    "inline-flex items-center gap-2 px-5 py-2.5",
                    "rounded-full border-2 border-gray-900 dark:border-white",
                    "text-sm font-medium",
                    "text-gray-900 dark:text-white",
                    "hover:bg-gray-900 hover:text-white",
                    "dark:hover:bg-white dark:hover:text-gray-900",
                    "transition-all duration-200"
                  )}
                >
                  {actionButton.label}
                </a>
              </div>
            )}
          </div>

          {/* Right side - Nested Cards Grid */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:col-span-2">
            {nestedCards.map((card, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "group not-prose flex-1 grid grid-cols-[7rem_1fr_auto] items-start gap-3 p-4",
                  "rounded-2xl transition-colors duration-200",
                  activeColor.nested,
                  activeColor.nestedDark
                )}
              >
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium uppercase tracking-wide",
                    activeColor.text,
                    activeColor.textDark,
                    "opacity-60"
                  )}
                >
                  {card.label}
                </span>

                <div className="flex flex-row gap-4 lg:flex-col lg:gap-x-1.5 lg:gap-y-0.5">
                  {card.items.map((item, itemIndex) => (
                    <span key={itemIndex} className="inline-flex items-center">
                      {item.link ? (
                        <a
                          href={item.link}
                          className={cn(
                            "text-sm sm:text-base no-underline",
                            "text-gray-900 dark:text-white",
                            "hover:opacity-70 transition-opacity"
                          )}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span className="text-sm sm:text-base text-gray-900 dark:text-white">
                          {item.label}
                        </span>
                      )}
                    </span>
                  ))}
                </div>

                <ArrowIcon
                  className={cn(
                    activeColor.text,
                    activeColor.textDark,
                    "rotate-90 opacity-40 group-hover:opacity-70 transition-opacity"
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ClaudeCardGrid - Simple auto-responsive grid of cards
 * Clean minimal cards with border, no effects
 */
export function ClaudeCardGrid({ cards, className }: ClaudeCardGridProps) {
  return (
    <div
      className={cn(
        "not-prose grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {cards.map((card, index) => {
        const CardWrapper = card.link ? "a" : "div";
        const cardProps = card.link
          ? { href: card.link, target: "_blank", rel: "noopener noreferrer" }
          : {};

        return (
          <CardWrapper
            key={index}
            {...cardProps}
            className={cn(
              "flex flex-col gap-1 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 no-underline",
              "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:no-underline transition-colors"
            )}
          >
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {card.title}
            </h4>
            {card.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {card.description}
              </p>
            )}
          </CardWrapper>
        );
      })}
    </div>
  );
}

export default ClaudeCard;
