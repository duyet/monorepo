import { ContactLinks } from "@/components/contact-links";
import type { PersonalInfo } from "@/config/cv.types";

export function Profile({ personal }: { personal: PersonalInfo }) {
  return (
    <header className="flex flex-col gap-4 bg-white print:gap-1">
      <h1 className="flex flex-col gap-1 text-balance text-5xl font-semibold leading-none tracking-tight text-neutral-950 sm:text-6xl dark:text-foreground print:text-[20pt]">
        <span>{personal.name}</span>
        <span className="text-3xl font-medium text-neutral-500 sm:text-4xl dark:text-muted-foreground print:text-[12pt]">
          {personal.title}
        </span>
      </h1>

      <ContactLinks contacts={personal.contacts} />

      <p className="max-w-4xl text-balance text-lg font-medium leading-8 text-neutral-800 dark:text-foreground/80 print:text-[9pt] print:font-normal print:leading-snug">
        {personal.overview}
      </p>
    </header>
  );
}
