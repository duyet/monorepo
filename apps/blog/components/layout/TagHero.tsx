import { BackLink } from "../ui/BackLink";

interface TagHeroProps {
  tagName: string;
  colorClass: string;
  postCount: number;
  yearCount: number;
}

export function TagHero({
  tagName,
  colorClass,
  postCount,
  yearCount,
}: TagHeroProps) {
  return (
    <div className="relative mb-16 mt-10 overflow-hidden rounded-2xl border border-[#1a1a1a]/[0.06] dark:border-white/[0.06] sm:mt-14 lg:mt-20">
      <div
        className={`${colorClass} absolute inset-0 opacity-60 dark:opacity-20`}
      />

      <div className="relative px-6 py-12 sm:px-10 sm:py-16 md:px-14 md:py-20">
        <div className="mb-8">
          <BackLink href="/tags" text="All Topics" />
        </div>

        <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] sm:text-6xl md:text-7xl lg:text-8xl">
          {tagName}
        </h1>

        <div className="flex items-center gap-3 text-sm font-medium text-[#1a1a1a]/50 dark:text-[#f8f8f2]/45">
          <span>
            {postCount} {postCount === 1 ? "post" : "posts"}
          </span>
          <span className="text-[#1a1a1a]/20 dark:text-[#f8f8f2]/20">
            &middot;
          </span>
          <span>
            {yearCount} {yearCount === 1 ? "year" : "years"}
          </span>
        </div>
      </div>
    </div>
  );
}
