import { ContactLinks } from "@/components/contact-links";
import type { PersonalInfo } from "@/config/cv.types";

export function Profile({ personal }: { personal: PersonalInfo }) {
  return (
    <header className="flex flex-col gap-3">
      <h1 className="inline-flex flex-wrap items-center gap-2 font-[family-name:var(--font-serif)] text-[28px] font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
        <span>{personal.name}</span>
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <span className="font-normal text-neutral-500 dark:text-neutral-400">
          {personal.title}
        </span>
      </h1>

      <ContactLinks contacts={personal.contacts} />

      <p className="max-w-2xl text-[15px] leading-7 text-neutral-700 dark:text-neutral-300">
        {personal.overview}
      </p>
    </header>
  );
}
