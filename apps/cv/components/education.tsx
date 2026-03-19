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
  period,
  thesis,
  thesisUrl,
  className,
}: EducationProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <h3
        className="font-[family-name:var(--font-serif)] text-[15px] font-bold tracking-tight"
      >
        {major}
        <span className="px-2">-</span>
        <span className="font-normal">{university}</span>
      </h3>
      <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-400">{period}</p>
      <ResumeLink
        href={thesisUrl}
        className="text-inherit"
      >
        ⤷ {thesis} ↗︎
      </ResumeLink>
    </div>
  );
}
