"use client";

import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import { AbstractShapes } from "../illustrations/AbstractShapes";
import { ThinkingAnimation } from "../thinking/ThinkingAnimation";
import { useCardDescription } from "./useCardDescription";

interface AiFeaturedCardProps {
  title: string;
  href: string;
  category?: string;
  fallbackDescription?: string;
  date?: string;
  color?: "terracotta" | "sage" | "coral" | "lavender";
  className?: string;
  cardType: "blog" | "featured";
}

const colorClasses = {
  terracotta: "bg-terracotta-light text-neutral-900 dark:bg-terracotta-light/20 dark:text-neutral-100",
  sage: "bg-sage-light text-neutral-900 dark:bg-sage-light/20 dark:text-neutral-100",
  coral: "bg-coral-light text-neutral-900 dark:bg-coral-light/20 dark:text-neutral-100",
  lavender: "bg-lavender-light text-neutral-900 dark:bg-lavender-light/20 dark:text-neutral-100",
};

const illustrationColors = {
  terracotta: "text-terracotta",
  sage: "text-sage",
  coral: "text-coral",
  lavender: "text-lavender",
};

export function AiFeaturedCard({
  title,
  href,
  category,
  fallbackDescription,
  date,
  color = "terracotta",
  className,
  cardType,
}: AiFeaturedCardProps) {
  const { description, isLoading } = useCardDescription({
    cardType,
    fallbackDescription,
  });

  const displayDescription = description || fallbackDescription;
  const showThinking = isLoading && !displayDescription;
  const isExternal = href.startsWith("http");
  const sharedClassName = cn(
    "group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:shadow-lg md:p-12",
    colorClasses[color],
    className
  );

  const inner = (
    <>
      <div className="relative z-10 flex flex-col gap-4">
        {category && (
          <div className="inline-flex items-center">
            <span className="rounded-full bg-white/80 dark:bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              {category}
            </span>
          </div>
        )}

        <h2 className="max-w-2xl font-serif text-3xl font-bold leading-tight md:text-4xl">
          {title}
        </h2>

        {showThinking ? (
          <ThinkingAnimation />
        ) : displayDescription ? (
          <p className="max-w-xl text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
            {displayDescription}
          </p>
        ) : null}

        {date && (
          <time className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{date}</time>
        )}
      </div>

      <div className="absolute bottom-0 right-0 h-48 w-48 opacity-30 transition-opacity group-hover:opacity-40 md:h-64 md:w-64">
        <AbstractShapes
          className={cn("h-full w-full", illustrationColors[color])}
        />
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClassName}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link to={href} className={sharedClassName}>
      {inner}
    </Link>
  );
}
