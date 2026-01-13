import { BackLink } from "../ui/BackLink";

interface HeroBannerProps {
  title: string;
  description: string;
  colorClass: string;
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
  return (
    <div className={`${colorClass} mb-12 rounded-3xl p-8 md:p-12 lg:p-16`}>
      <div className="mb-4">
        <BackLink href={backLinkHref} text={backLinkText} />
      </div>

      <h1 className="mb-6 font-serif text-4xl font-bold text-neutral-900 md:text-5xl lg:text-6xl">
        {title}
      </h1>

      <p className="mb-6 max-w-2xl text-lg leading-relaxed text-neutral-700">
        {description}
      </p>

      <div className="flex flex-wrap gap-4 text-sm font-medium text-neutral-600">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>
            {postCount} {postCount === 1 ? "post" : "posts"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>
            {yearCount} {yearCount === 1 ? "year" : "years"}
          </span>
        </div>
      </div>
    </div>
  );
}
