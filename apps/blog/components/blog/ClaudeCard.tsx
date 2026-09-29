"use client";

import { cn } from "@duyet/libs/utils";
import { useState } from "react";
import {
  ArrowIcon,
  claudeCardIcons as icons,
  colorSchemes,
  hashString,
} from "./claude-card-theme";

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
                "text-[var(--foreground)] dark:text-[var(--on-dark)]"
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
                    "border-b border-border"
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
                      "text-[var(--foreground)] dark:text-[var(--on-dark)]"
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
                "text-[var(--foreground)] dark:text-[var(--on-dark)]"
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
                    "rounded-full border-2 border-[var(--foreground)] dark:border-[var(--on-dark)]",
                    "text-sm font-medium",
                    "text-[var(--foreground)] dark:text-[var(--on-dark)]",
                    "hover:bg-[var(--foreground)] hover:text-[var(--on-dark)]",
                    "dark:hover:bg-[var(--on-dark)] dark:hover:text-[var(--foreground)]",
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
                            "text-[var(--foreground)] dark:text-[var(--on-dark)]",
                            "hover:opacity-70 transition-opacity"
                          )}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span className="text-sm sm:text-base text-[var(--foreground)] dark:text-[var(--on-dark)]">
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
              "flex flex-col gap-1 p-4 rounded-2xl border border-border dark:border-white/10 no-underline",
              "hover:bg-[var(--surface-soft)] dark:hover:bg-[var(--surface-dark)] hover:no-underline transition-colors"
            )}
          >
            <h4 className="font-semibold text-[var(--foreground)] dark:text-[var(--on-dark)]">
              {card.title}
            </h4>
            {card.description && (
              <p className="text-sm text-[#1a1a1a]/70 dark:text-[#f8f8f2]/55 line-clamp-2">
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
