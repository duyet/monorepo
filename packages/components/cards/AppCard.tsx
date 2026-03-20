import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";

export interface AppCardProps {
  title: string;
  href: string;
  screenshot: string;
  className?: string;
  prefetch?: boolean;
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function AppCardContent({
  title,
  domain,
  screenshot,
}: {
  title: string;
  domain: string;
  screenshot: string;
}) {
  return (
    <>
      {/* Screenshot */}
      <div className="relative h-40 w-full overflow-hidden rounded-lg border border-neutral-200 transition-shadow group-hover:shadow-md">
        <img
          src={screenshot}
          alt={`${title} screenshot`}
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      {/* Title + Domain stacked */}
      <div className="px-1 pt-3 pb-1">
        <p className="text-sm font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-neutral-400 truncate">{domain}</p>
      </div>
    </>
  );
}

export function AppCard({
  title,
  href,
  screenshot,
  className,
}: AppCardProps) {
  const isExternal = href.startsWith("http");
  const domain = extractDomain(href);
  const sharedClassName = cn("group block overflow-hidden", className);
  const ariaLabel = isExternal ? `${title} (${domain})` : title;

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClassName}
        aria-label={ariaLabel}
      >
        <AppCardContent title={title} domain={domain} screenshot={screenshot} />
      </a>
    );
  }

  return (
    <Link to={href} className={sharedClassName} aria-label={ariaLabel}>
      <AppCardContent title={title} domain={domain} screenshot={screenshot} />
    </Link>
  );
}
