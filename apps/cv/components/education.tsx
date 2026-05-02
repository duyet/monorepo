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
      <h3 className="text-base font-semibold tracking-tight print:text-[9pt]">
        {major}
        <span className="px-2">-</span>
        <span className="font-normal">{university}</span>
      </h3>
      <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-600 dark:text-muted-foreground print:text-[7pt]">
        {period}
      </p>
      <ResumeLink href={thesisUrl} external className="text-inherit print:text-[8pt]">
        ⤷ {thesis} ↗︎
      </ResumeLink>
    </div>
  );
}
