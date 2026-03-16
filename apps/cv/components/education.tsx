import { cn } from "@duyet/libs";
import Link from "next/link";

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
        className="font-[family-name:var(--font-serif)] text-base font-bold"
      >
        {major}
        <span className="px-2">-</span>
        <span className="font-normal">{university}</span>
      </h3>
      <p className="text-xs uppercase text-neutral-600 dark:text-neutral-400">{period}</p>
      <Link
        href={thesisUrl}
        className="hover:underline hover:decoration-neutral-300 hover:decoration-1 hover:underline-offset-2 dark:hover:decoration-neutral-600"
      >
        ⤷ {thesis} ↗︎
      </Link>
    </div>
  );
}
