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
  void colorClass;

  return (
    <div className="blog-page-head mb-12 border-b border-[var(--border-faint)] pb-8">
      <div className="mb-4">
        <BackLink href="/tags/" text="All Topics" />
      </div>

      <h1 className="mb-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] dark:text-[var(--on-dark)] sm:text-5xl">
        {tagName}
      </h1>

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
