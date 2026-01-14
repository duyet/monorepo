import { getPostsByAllYear } from "@duyet/libs/getPost";
import { cn } from "@duyet/libs/utils";
import Link from "next/link";

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
    years.sort(
      (a: string, b: string) => Number.parseInt(b, 10) - Number.parseInt(a, 10)
    );
  } else {
    years.sort(
      (a: string, b: string) => Number.parseInt(a, 10) - Number.parseInt(b, 10)
    );
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
