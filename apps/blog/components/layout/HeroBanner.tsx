import { BackLink } from "../ui/BackLink";

interface HeroBannerProps {
  title: string;
  description: string;
  colorClass?: string;
  postCount: number;
  yearCount: number;
  backLinkHref: string;
  backLinkText: string;
}

export function HeroBanner({
  title,
  description,
  colorClass,
  postCount,
  yearCount,
  backLinkHref,
  backLinkText,
}: HeroBannerProps) {
  void colorClass;

  return (
    <div className="blog-page-head mb-12 border-b border-[var(--border-faint)] pb-8">
      <div className="mb-4">
        <BackLink href={backLinkHref} text={backLinkText} />
      </div>

      <h1 className="mb-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] dark:text-[var(--on-dark)] sm:text-5xl">
        {title}
      </h1>

      <p className="mb-6 max-w-2xl text-base leading-7 text-[#1a1a1a]/70 dark:text-[#f8f8f2]/75">
        {description}
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
        <span>
          {postCount} {postCount === 1 ? "post" : "posts"}
        </span>
        <span>
          {yearCount} {yearCount === 1 ? "year" : "years"}
        </span>
      </div>
    </div>
  );
}
