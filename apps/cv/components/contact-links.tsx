"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@duyet/components/ui/hover-card";
import Link from "next/link";
import type { ContactLink } from "@/config/cv.types";

import { ResumeLink } from "./resume-link";

const hoverCardClassName =
  "w-72 border-neutral-200 bg-white p-3 text-[13px] leading-5 text-neutral-700 shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200";

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
                <ResumeLink href={contact.url} className="text-inherit">
                  {contact.label}
                </ResumeLink>
              </HoverCardTrigger>
              <HoverCardContent className={hoverCardClassName}>
                <Link
                  href={contact.url}
                  className="block text-inherit no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
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
                </Link>
              </HoverCardContent>
            </HoverCard>
          );
        }

        return (
          <ResumeLink key={contact.id} href={contact.url} className="text-inherit">
            {contact.label}
          </ResumeLink>
        );
      })}
    </div>
  );
}
