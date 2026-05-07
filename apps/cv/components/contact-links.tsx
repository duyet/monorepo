"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@duyet/components/ui/hover-card";
import type { ContactLink } from "@/config/cv.types";
import { hoverCardClassName } from "./link-styles";
import { ResumeLink } from "./resume-link";

export function ContactLinks({ contacts }: { contacts: ContactLink[] }) {
  return (
    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-1.5 text-[13px] text-neutral-600 dark:text-neutral-400">
      {contacts.map((contact, i) => (
        <span key={contact.id} className="inline-flex items-center">
          {i > 0 && (
            <span className="mr-1.5 text-neutral-400 dark:text-neutral-600">
              |
            </span>
          )}
          {contact.type === "email" ? (
            <span className="underline decoration-neutral-300 underline-offset-2 dark:decoration-neutral-600">
              {contact.label}
            </span>
          ) : contact.hoverContent ? (
            <HoverCard openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <ResumeLink
                  href={contact.url}
                  external
                  className="text-inherit underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500 dark:decoration-neutral-600"
                >
                  {contact.label.replace("https://", "").replace("linkedin.com/in/", "linkedin.com/in/")}
                </ResumeLink>
              </HoverCardTrigger>
              <HoverCardContent className={hoverCardClassName}>
                <ResumeLink
                  href={contact.url}
                  external
                  className="block text-inherit no-underline"
                >
                  <div className="flex items-start gap-2.5">
                    {contact.hoverContent.icon ? (
                      <span className="mt-0.5 text-base text-neutral-500 dark:text-neutral-400">
                        {contact.hoverContent.icon}
                      </span>
                    ) : null}
                    <div className="min-w-0">
                      <div className="font-medium text-neutral-900 dark:text-neutral-50">
                        {contact.hoverContent.title}
                      </div>
                      <div className="text-neutral-600 dark:text-neutral-300">
                        {contact.hoverContent.subtitle}
                      </div>
                    </div>
                  </div>
                </ResumeLink>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <ResumeLink
              href={contact.url}
              external
              className="text-inherit underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500 dark:decoration-neutral-600"
            >
              {contact.label.replace("https://", "")}
            </ResumeLink>
          )}
        </span>
      ))}
    </div>
  );
}
