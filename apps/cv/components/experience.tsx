import { cn, distanceFormat } from "@duyet/libs";
import type { ReactNode } from "react";
import { ResumeLink } from "./resume-link";

interface ExperienceItemProps {
  title: string;
  company: string;
  companyUrl?: string;
  companyLogo?: string;
  companyLogoClassName?: string;
  from: Date;
  to?: Date;
  responsibilities: { id: number; item: string | ReactNode }[];
  className?: string;
}

export function ExperienceItem({
  title,
  company,
  companyUrl,
  companyLogo,
  companyLogoClassName,
  from,
  to,
  responsibilities,
  className,
}: ExperienceItemProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 print:gap-0.5", className)}>
      <h3 className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-semibold tracking-tight print:text-[9.5pt]">
        <span>{title}</span>
        <span>-</span>
        <CompanyLine
          company={company}
          companyUrl={companyUrl}
          companyLogo={companyLogo}
          companyLogoClassName={companyLogoClassName}
        />
      </h3>
      <PeriodLine from={from} to={to} />
      <ul className="ml-2 mt-1.5 list-disc pl-5 text-[15px] leading-7 text-neutral-800 print:mt-0.5 print:text-[8.2pt] print:leading-snug">
        {responsibilities.map(({ id, item }) => (
          <li className="mt-1 print:mt-0" key={id}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompanyLine({
  company,
  companyUrl,
  companyLogo,
  companyLogoClassName,
}: Pick<
  ExperienceItemProps,
  "company" | "companyUrl" | "companyLogo" | "companyLogoClassName"
>) {
  const logoWithText = (
    <span
      className={cn(
        "group inline-flex items-center gap-2 font-normal",
        "hover:underline hover:decoration-neutral-300 hover:decoration-1 hover:underline-offset-2 dark:hover:decoration-neutral-300"
      )}
    >
      {companyLogo ? (
        <img
          src={companyLogo}
          alt={company}
          width={24}
          height={24}
          className={cn(
            "h-6 w-auto grayscale group-hover:grayscale-0 dark:brightness-100 dark:invert-0 print:hidden",
            companyLogoClassName
          )}
        />
      ) : null}
      <span>{company}</span>
    </span>
  );

  if (companyUrl) {
    return (
      <ResumeLink href={companyUrl} external className="m-0 p-0 text-inherit">
        {logoWithText}
      </ResumeLink>
    );
  }

  return logoWithText;
}

function PeriodLine({ from, to }: { from: Date; to?: Date }) {
  const monthFmt = new Intl.DateTimeFormat("en-US", { month: "long" });

  const fromString = `${monthFmt.format(from)} ${from.getFullYear()}`;
  const toString = to
    ? `${monthFmt.format(to)} ${to.getFullYear()}`
    : "CURRENT";
  const period = `${fromString} - ${toString}`;

  const duration = distanceFormat(from, to ? to : new Date());

  return (
    <div className="group inline-flex flex-wrap gap-x-2 gap-y-1 text-xs font-medium uppercase text-neutral-600 dark:text-muted-foreground print:text-[7.2pt]">
      <div className="hover:text-neutral-700 dark:hover:text-foreground/70">
        {period}
      </div>
      <div className="hidden font-bold text-neutral-400 group-hover:block dark:text-foreground/50">
        {duration}
      </div>
    </div>
  );
}
