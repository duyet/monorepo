import Link from "next/link";

import { getPostsByAllYear } from "@duyet/libs/getPost";
import { cn } from "@duyet/libs/utils";

type Props = {
  order?: "asc" | "desc";
  yearLimit?: number;
  className?: string;
};

export default function YearList({
  order = "desc",
  yearLimit = -1,
  className,
}: Props) {
  const years = Object.keys(getPostsByAllYear([], yearLimit));

  if (order === "desc") {
    years.sort((a: string, b: string) => Number.parseInt(b) - Number.parseInt(a));
  } else {
    years.sort((a: string, b: string) => Number.parseInt(a) - Number.parseInt(b));
  }

  return (
    <div className={cn("flex flex-row flex-wrap gap-4", className)}>
      {years.map((year: string) => (
        <Link
          href="/[year]"
          as={`/${year}`}
          scroll={true}
          key={year}
          className="p-3 font-bold rounded text-sm hover:bg-slate-50"
        >
          {year}
        </Link>
      ))}
    </div>
  );
}
