import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import { AbstractShapes } from "../illustrations/AbstractShapes";

interface FeaturedCardProps {
  title: string;
  href: string;
  category?: string;
  description?: string;
  date?: string;
  color?: "terracotta" | "sage" | "coral" | "lavender";
  className?: string;
}

const colorClasses = {
  terracotta: "bg-terracotta-light text-neutral-900",
  sage: "bg-sage-light text-neutral-900",
  coral: "bg-coral-light text-neutral-900",
  lavender: "bg-lavender-light text-neutral-900",
};

const illustrationColors = {
  terracotta: "text-terracotta",
  sage: "text-sage",
  coral: "text-coral",
  lavender: "text-lavender",
};

function FeaturedCardInner({
  title,
  category,
  description,
  date,
  color = "terracotta",
}: Pick<FeaturedCardProps, "title" | "category" | "description" | "date" | "color">) {
  return (
    <>
      <div className="relative z-10 flex flex-col gap-4">
        {category && (
          <div className="inline-flex items-center">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              {category}
            </span>
          </div>
        )}

        <h2 className="max-w-2xl font-serif text-3xl font-bold leading-tight md:text-4xl">
          {title}
        </h2>

        {description && (
          <p className="max-w-xl text-lg leading-relaxed text-neutral-700">
            {description}
          </p>
        )}

        {date && (
          <time className="text-sm font-medium text-neutral-600">{date}</time>
        )}
      </div>

      <div className="absolute bottom-0 right-0 h-48 w-48 opacity-30 transition-opacity group-hover:opacity-40 md:h-64 md:w-64">
        <AbstractShapes
          className={cn("h-full w-full", illustrationColors[color])}
        />
      </div>
    </>
  );
}

export function FeaturedCard({
  title,
  href,
  category,
  description,
  date,
  color = "terracotta",
  className,
}: FeaturedCardProps) {
  const isExternal = href.startsWith("http");
  const sharedClassName = cn(
    "group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:shadow-lg md:p-12 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-amber-400 dark:focus:ring-offset-neutral-900",
    colorClasses[color],
    className
  );
  const inner = (
    <FeaturedCardInner
      title={title}
      category={category}
      description={description}
      date={date}
      color={color}
    />
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClassName}
        aria-label={title}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link to={href} className={sharedClassName} aria-label={title}>
      {inner}
    </Link>
  );
}
