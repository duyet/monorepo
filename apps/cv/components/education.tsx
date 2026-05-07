import { cn } from "@duyet/libs";
import { ResumeLink } from "./resume-link";

interface EducationProps {
  major: string;
  university: string;
  period?: string;
  thesis: string;
  thesisUrl: string;
  className?: string;
}

export function Education({
  major,
  university,
  thesis,
  thesisUrl,
  className,
}: EducationProps) {
  return (
    <div className={cn("mt-2", className)}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-bold text-neutral-900 dark:text-neutral-100">
          {university}
        </h3>
        <span className="text-[13px] italic text-black dark:text-neutral-200">
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
