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
    <div className="mt-1 inline-flex w-full flex-wrap gap-x-3 gap-y-1 text-[13px] leading-6">
      {contacts.map((contact) => {
        if (contact.type === "email") {
          return <span key={contact.id}>{contact.label}</span>;
        }

        if (contact.hoverContent) {
          return (
            <HoverCard key={contact.id} openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <ResumeLink
                  href={contact.url}
                  external
                  className="text-inherit"
                >
                  {contact.label}
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
          );
        }

        return (
          <ResumeLink
            key={contact.id}
            href={contact.url}
            external
            className="text-inherit"
          >
            {contact.label}
          </ResumeLink>
        );
      })}
    </div>
  );
}
