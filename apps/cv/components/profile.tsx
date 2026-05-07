import { ContactLinks } from "@/components/contact-links";
import type { PersonalInfo } from "@/config/cv.types";

export function Profile({ personal }: { personal: PersonalInfo }) {
  return (
    <header className="text-center">
      <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold tracking-[0.08em] text-neutral-900 dark:text-neutral-100">
        {personal.name}
      </h1>
      <ContactLinks contacts={personal.contacts} />
      <p className="mx-auto mt-2 max-w-xl text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
        {personal.overview}
      </p>
    </header>
  );
}
