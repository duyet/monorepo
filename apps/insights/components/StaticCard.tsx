"use client";

import { cn } from "@duyet/libs/utils";
import { TextDataSource } from "./TextDataSource";

interface StaticCardProps {
  title?: string;
  source?: string;
  url: {
    light: string;
    dark: string;
  };
  className?: string;
  extra?: React.ReactNode;
}

export function StaticCard({
  title,
  source,
  url,
  className,
  extra,
}: StaticCardProps) {
  return (
    <div
      className={cn("p-3", "rounded border dark:border-gray-800", className)}
    >
      {title ? <div className="mb-5 font-bold">{title}</div> : null}

      <div className="block flex flex-col items-stretch dark:hidden">
        <img
          alt={title || ""}
          height={500}
          src={url.light}
          width={800}
          className="w-full"
        />
      </div>

      <div className="flex hidden flex-col gap-5 dark:block">
        <img
          alt={title || ""}
          height={500}
          src={url.dark}
          width={800}
          className="w-full"
        />
      </div>

      {extra}

      <TextDataSource>{source}</TextDataSource>
    </div>
  );
}

export default StaticCard;
