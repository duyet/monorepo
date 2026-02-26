import { cn } from "@duyet/libs/utils";
import Image from "next/image";
import Link from "next/link";

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

export function AppCard({
  title,
  href,
  screenshot,
  className,
  prefetch = false,
}: AppCardProps) {
  const isExternal = href.startsWith("http");
  const domain = extractDomain(href);

  return (
    <Link
      href={href}
      prefetch={prefetch}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "group block overflow-hidden",
        className
      )}
      aria-label={isExternal ? `${title} (${domain})` : title}
    >
      {/* Screenshot */}
      <div className="relative h-40 w-full overflow-hidden rounded-lg border border-neutral-200 transition-shadow group-hover:shadow-md">
        <Image
          src={screenshot}
          alt={`${title} screenshot`}
          fill
          unoptimized
          className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      {/* Title + Domain stacked */}
      <div className="px-1 pt-3 pb-1">
        <p className="text-sm font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors">{title}</p>
        <p className="mt-0.5 text-xs text-neutral-400 truncate">{domain}</p>
      </div>
    </Link>
  );
}
