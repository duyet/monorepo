"use client";

import { cn } from "@duyet/libs/utils";
import Link from "next/link";
import {
  GeometricPattern,
  OrganicBlob,
  WavyLines,
} from "../illustrations/AbstractShapes";
import { ThinkingAnimation } from "../thinking/ThinkingAnimation";
import { useCardDescription } from "./useCardDescription";

interface AiContentCardProps {
  title: string;
  href: string;
  category?: string;
  fallbackDescription?: string;
  tags?: string[];
  date?: string;
  color?:
    | "ivory"
    | "oat"
    | "cream"
    | "cactus"
    | "sage"
    | "lavender"
    | "terracotta"
    | "coral"
    | "white";
  illustration?: "wavy" | "geometric" | "blob" | "none";
  className?: string;
  featured?: boolean;
  cardType: "blog" | "featured";
}

const colorClasses = {
  ivory: "bg-ivory text-neutral-900",
  oat: "bg-oat-light text-neutral-900",
  cream: "bg-cream text-neutral-900",
  cactus: "bg-cactus-light text-neutral-900",
  sage: "bg-sage-light text-neutral-900",
  lavender: "bg-lavender-light text-neutral-900",
  terracotta: "bg-terracotta-light text-neutral-900",
  coral: "bg-coral-light text-neutral-900",
  white:
    "border border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300",
};

const illustrationColorClasses = {
  ivory: "text-neutral-400",
  oat: "text-neutral-400",
  cream: "text-neutral-400",
  cactus: "text-cactus",
  sage: "text-sage",
  lavender: "text-lavender",
  terracotta: "text-terracotta",
  coral: "text-coral",
  white: "text-neutral-400",
};

const illustrations = {
  wavy: WavyLines,
  geometric: GeometricPattern,
  blob: OrganicBlob,
  none: null,
};

const titleSizeClasses = {
  featured: "text-2xl md:text-3xl",
  default: "text-xl md:text-2xl",
};

const descriptionSizeClasses = {
  featured: "text-base md:text-lg",
  default: "text-sm",
};

export function AiContentCard({
  title,
  href,
  category,
  fallbackDescription,
  tags,
  date,
  color,
  illustration = "none",
  className,
  featured = false,
  cardType,
}: AiContentCardProps) {
  const { description, isLoading } = useCardDescription({
    cardType,
    fallbackDescription,
  });

  const IllustrationComponent = illustrations[illustration];
  const isExternal = href.startsWith("http");
  const displayDescription = description || fallbackDescription;
  const showThinking = isLoading && !displayDescription;

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        color && colorClasses[color],
        featured && "sm:col-span-2 lg:col-span-2",
        className
      )}
    >
      <div
        className={cn(
          "relative z-10 flex flex-col gap-3",
          !color || color === "white" ? "min-h-[120px]" : "min-h-[200px]"
        )}
      >
        {category && (
          <div className="inline-flex items-center">
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              {category}
            </span>
          </div>
        )}

        <h3
          className={cn(
            "font-serif font-bold leading-snug",
            featured ? titleSizeClasses.featured : titleSizeClasses.default
          )}
        >
          {title}
        </h3>

        {showThinking && !displayDescription ? (
          <ThinkingAnimation />
        ) : displayDescription ? (
          <p
            className={cn(
              "line-clamp-3 leading-relaxed text-neutral-700",
              featured
                ? descriptionSizeClasses.featured
                : descriptionSizeClasses.default
            )}
          >
            {displayDescription}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-neutral-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {date && (
            <time className="text-xs font-medium text-neutral-600">{date}</time>
          )}
        </div>
      </div>

      {IllustrationComponent && (
        <div className="absolute bottom-0 right-0 h-32 w-32 opacity-20 transition-opacity group-hover:opacity-30">
          <IllustrationComponent
            className={cn(
              "h-full w-full",
              color && illustrationColorClasses[color]
            )}
          />
        </div>
      )}
    </Link>
  );
}
