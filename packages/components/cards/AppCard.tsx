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
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={screenshot}
          alt={`${title} screenshot`}
          fill
          unoptimized
          className="object-cover object-top"
        />
      </div>

      {/* Title + Domain row */}
      <div className="flex items-center justify-between px-2 py-3">
        <p className="text-sm font-medium text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500">{domain}</p>
      </div>
    </Link>
  );
}
