import { cn } from "@duyet/libs/utils";
import Link from "next/link";
import {
  GeometricPattern,
  OrganicBlob,
  WavyLines,
} from "../illustrations/AbstractShapes";

interface LinkCardProps {
  title: string;
  href: string;
  description: string;
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
  className?: string;
  featured?: boolean;
  backgroundImage?: string;
  illustration?: "wavy" | "geometric" | "blob" | "none";
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

export function LinkCard({
  title,
  href,
  description,
  color,
  className,
  featured = false,
  backgroundImage,
  illustration = "none",
}: LinkCardProps) {
  const IllustrationComponent = illustrations[illustration];
  const isExternal = href.startsWith("http");

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
      {backgroundImage && (
        <>
          {/* Background image on hover */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
          {/* Overlay to maintain text readability */}
          <div className="absolute inset-0 bg-white/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </>
      )}

      <div className="relative z-10 flex min-h-[120px] flex-col gap-3">
        <h3
          className={cn(
            "font-serif font-bold leading-snug text-neutral-900",
            featured ? titleSizeClasses.featured : titleSizeClasses.default
          )}
        >
          {title}
        </h3>

        <p
          className={cn(
            "line-clamp-3 leading-relaxed text-neutral-700",
            featured
              ? descriptionSizeClasses.featured
              : descriptionSizeClasses.default
          )}
        >
          {description}
        </p>
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
