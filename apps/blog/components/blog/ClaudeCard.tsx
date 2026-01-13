"use client";

import { useState } from "react";
import { cn } from "@duyet/libs/utils";

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
    <path
      d="M40 50 Q45 40 55 45 L60 50"
      fill="none"
      strokeLinecap="round"
    />
    {/* Geometric shapes */}
    <rect x="55" y="25" width="20" height="20" rx="2" fill="white" stroke="currentColor" />
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
    <rect x="25" y="20" width="70" height="50" rx="3" fill="white" stroke="currentColor" />
    {/* Board hanger */}
    <line x1="60" y1="10" x2="60" y2="20" strokeLinecap="round" />
    <circle cx="60" cy="8" r="4" fill="none" />
    {/* Code symbols */}
    <text x="40" y="50" fontSize="20" fill="currentColor" fontFamily="monospace">&lt;/&gt;</text>
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

// Pastel color palette matching homepage design system
const colorSchemes = [
  {
    bg: "bg-terracotta-light", // Soft peach #f4b8a0
    bgDark: "dark:bg-terracotta/30",
    text: "text-gray-700",
    textDark: "dark:text-gray-200",
  },
  {
    bg: "bg-lavender-light", // Soft lavender #dfe0ec
    bgDark: "dark:bg-lavender/30",
    text: "text-gray-700",
    textDark: "dark:text-gray-200",
  },
  {
    bg: "bg-sage-light", // Soft sage #d0ddd8
    bgDark: "dark:bg-sage/30",
    text: "text-gray-700",
    textDark: "dark:text-gray-200",
  },
];

const icons = [BlocksIcon, CodeBoardIcon, GlobeCodeIcon];

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
                  index !== items.length - 1 && "border-b border-gray-900/20 dark:border-white/20"
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
                        <span key={itemIndex} className="inline-flex items-center">
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
                            <span className={cn("ml-1 opacity-50", activeColor.text, activeColor.textDark)}>,</span>
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

export default ClaudeCard;
