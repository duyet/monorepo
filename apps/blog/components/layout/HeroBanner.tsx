import { tw } from "@/lib/tw";
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
    <div className={tw.pageHead}>
      <div className="mb-4">
        <BackLink href={backLinkHref} text={backLinkText} />
      </div>

      <h1 className={tw.pageTitle}>{title}</h1>

      <p className={`${tw.lead} mt-4 mb-6`}>{description}</p>

      <div className={`${tw.mono} flex flex-wrap gap-x-4 gap-y-1`}>
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
