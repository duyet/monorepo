"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@duyet/components/ui/hover-card";
import { track } from "@seline-analytics/web";
import Link from "next/link";
import type React from "react";

export function Skill({
  skill,
  url,
  icon,
  note,
}: {
  skill: string;
  url?: string;
  icon?: React.ReactNode;
  note?: string | React.ReactNode;
}) {
  if (!url && !icon && !note) return skill;
  if (url && !icon)
    return (
      <Link
        href={url}
        target="_blank"
        className="underline decoration-neutral-300 decoration-1 underline-offset-2 dark:decoration-neutral-600"
      >
        {skill}
      </Link>
    );

  return (
    <HoverCard
      openDelay={100}
      closeDelay={100}
      onOpenChange={(open: boolean) => {
        if (open) track("CV: Hover Skill", { skill });
      }}
    >
      <HoverCardTrigger asChild>
        {url ? (
          <Link
            href={url}
            target="_blank"
            className="underline decoration-neutral-300 decoration-1 underline-offset-2 dark:decoration-neutral-600"
          >
            {skill}
          </Link>
        ) : (
          <span>{skill}</span>
        )}
      </HoverCardTrigger>
      <HoverCardContent asChild>
        <div className="flex flex-col gap-2 bg-white">
          {icon}{" "}
          {url ? (
            <Link href={url} target="_blank">
              Posts about <strong>{skill}</strong>
              {" ↗︎"}
            </Link>
          ) : (
            skill
          )}
          {note ? <div className="mt-2">{note}</div> : null}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
