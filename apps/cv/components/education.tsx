import { cn } from "@duyet/libs";
import { ResumeLink } from "./resume-link";

interface EducationProps {
  major: string;
  university: string;
  period?: string;
  thesisUrl: string;
  className?: string;
}

export function Education({
  major,
  university,
  thesisUrl,
  className,
}: EducationProps) {
  return (
    <div className={cn("mt-2", className)}>
      <div className="flex items-baseline justify-between gap-x-3">
        <h3 className="min-w-0 text-[15px] font-bold text-neutral-900 dark:text-neutral-100">
          {university}
        </h3>
        <span className="shrink-0 whitespace-nowrap text-[13px] italic text-neutral-500 dark:text-neutral-400">
          <ResumeLink
            href={thesisUrl}
            external
            className="text-inherit hover:underline"
          >
            Thesis
          </ResumeLink>
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] italic text-black dark:text-neutral-100">
          {major}
        </span>
      </div>
    </div>
  );
}
