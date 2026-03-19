"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@duyet/components/ui/hover-card";
import { track } from "@seline-analytics/web";
import type React from "react";

import { ResumeLink } from "./resume-link";

const hoverCardClassName =
  "w-72 border-neutral-200 bg-white p-3 text-[13px] leading-5 text-neutral-700 shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200";

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
      <ResumeLink href={url} className="text-inherit">
        {skill}
      </ResumeLink>
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
          <ResumeLink
            href={url}
            className="text-inherit"
          >
            {skill}
          </ResumeLink>
        ) : (
          <span>{skill}</span>
        )}
      </HoverCardTrigger>
      <HoverCardContent className={hoverCardClassName}>
        <div className="flex flex-col gap-2">
          {icon ? (
            <div className="text-base text-neutral-500 dark:text-neutral-400">
              {icon}
            </div>
          ) : null}
          <div className="font-medium text-neutral-900 dark:text-neutral-50">
            {url ? (
              <ResumeLink href={url} className="text-inherit">
                Posts about <strong>{skill}</strong> {" ↗︎"}
              </ResumeLink>
            ) : (
              skill
            )}
          </div>
          {note ? <div className="text-neutral-600 dark:text-neutral-300">{note}</div> : null}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
