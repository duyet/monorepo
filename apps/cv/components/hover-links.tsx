"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@duyet/components/ui/hover-card";
import { track } from "@seline-analytics/web";

import { ResumeLink } from "./resume-link";

const hoverCardClassName =
  "w-72 border-neutral-200 bg-white p-3 text-[13px] leading-5 text-neutral-700 shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200";

export function HoverLinks({
  text,
  links,
}: {
  text: string;
  links: { text: string; href: string }[];
}) {
  return (
    <HoverCard
      openDelay={100}
      closeDelay={100}
      onOpenChange={(open: boolean) => {
        if (open) track("CV: Hover Link", { text });
      }}
    >
      <HoverCardTrigger asChild>
        <span className="cursor-context-menu underline decoration-neutral-300 decoration-1 underline-offset-2 dark:decoration-neutral-600">
          {text}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className={hoverCardClassName}>
        <div className="space-y-2">
          <div className="font-medium text-neutral-900 dark:text-neutral-50">
            Some related posts
          </div>
          <ul className="ml-4 list-disc space-y-1">
            {links.map((link) => (
              <li key={link.text}>
                <ResumeLink href={link.href} className="text-inherit">
                  {link.text} ↗︎
                </ResumeLink>
              </li>
            ))}
          </ul>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
