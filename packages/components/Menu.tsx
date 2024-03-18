import Link from "next/link";

import { cn } from "@duyet/libs/utils";

const BLOG_URL =
  process.env.NEXT_PUBLIC_DUYET_BLOG_URL || "https://blog.duyet.net";
const INSIGHTS_URL =
  process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || "https://insights.duyet.net";

const navigation = [
  { name: "About", href: `${BLOG_URL}/about` },
  { name: "Insights", href: INSIGHTS_URL },
  { name: "Archives", href: `${BLOG_URL}/archives` },
];

type Props = {
  className?: string;
};

export default function Menu({ className }: Props) {
  return (
    <div className={cn("flex flex-row gap-5 flex-wrap", className)}>
      {navigation.map(({ name, href }) => (
        <Link
          key={name}
          href={href}
          className="hover:underline underline-offset-8"
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
