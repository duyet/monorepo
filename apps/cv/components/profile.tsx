import { ContactLinks } from "@/components/contact-links";
import type { PersonalInfo } from "@/config/cv.types";

export function Profile({ personal }: { personal: PersonalInfo }) {
  return (
    <header className="text-center">
      <h1 className="text-3xl font-bold tracking-[0.08em] text-neutral-900 dark:text-neutral-100">
        {personal.name}
      </h1>
      <ContactLinks contacts={personal.contacts} />
      <p className="mx-auto mt-3 text-[14px] leading-6 text-black dark:text-neutral-100">
        {personal.overview}
      </p>
    </header>
  );
}
