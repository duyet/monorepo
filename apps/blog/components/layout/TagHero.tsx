import { tw } from "@/lib/tw";
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
    <div className={tw.pageHead}>
      <div className="mb-4">
        <BackLink href="/tags/" text="All Topics" />
      </div>

      <h1 className={tw.pageTitle}>{tagName}</h1>

      <div className={`${tw.mono} mt-4 flex flex-wrap gap-x-4 gap-y-1`}>
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
