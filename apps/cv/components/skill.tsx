"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@duyet/components/ui/hover-card";
import { track } from "@seline-analytics/web";
import type React from "react";

import { ResumeLink } from "./resume-link";
import { hoverCardClassName } from "./link-styles";

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
      <ResumeLink href={url} external className="text-inherit">
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
            external
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
              <ResumeLink href={url} external className="text-inherit">
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
