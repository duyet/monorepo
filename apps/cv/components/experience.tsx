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
    <div className={cn("mt-3 first:mt-0", className)}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-bold text-neutral-900 dark:text-neutral-100">
          <CompanyLine
            company={company}
            companyUrl={companyUrl}
            companyLogo={companyLogo}
            companyLogoClassName={companyLogoClassName}
          />
        </h3>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] italic text-neutral-700 dark:text-neutral-300">
          {title}
        </span>
        <span className="text-[13px] italic text-neutral-600 dark:text-neutral-400">
          <PeriodText from={from} to={to} />
        </span>
      </div>
      <ul className="ml-4 mt-1 list-disc pl-4 text-[14px]">
        {responsibilities.map(({ id, item }) => (
          <li className="mt-0.5 leading-5" key={id}>
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
    <span className="inline-flex items-center gap-1.5">
      {companyLogo ? (
        <img
          src={companyLogo}
          alt={company}
          width={16}
          height={16}
          className={cn(
            "h-4 w-auto grayscale hover:grayscale-0 dark:brightness-0 dark:invert print:hidden",
            companyLogoClassName
          )}
        />
      ) : null}
      <span>{company}</span>
    </span>
  );

  if (companyUrl) {
    return (
      <ResumeLink
        href={companyUrl}
        external
        className="m-0 p-0 text-inherit hover:underline"
      >
        {logoWithText}
      </ResumeLink>
    );
  }

  return logoWithText;
}

function PeriodText({ from, to }: { from: Date; to?: Date }) {
  const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
  const fromStr = `${monthFmt.format(from)} ${from.getFullYear()}`;
  const toStr = to
    ? `${monthFmt.format(to)} ${to.getFullYear()}`
    : "Present";
  return <>{`${fromStr} – ${toStr}`}</>;
}
