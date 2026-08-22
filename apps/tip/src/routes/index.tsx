import { createFileRoute } from "@tanstack/react-router";
import { KOFI_PROFILE_URL, KOFI_URL } from "../lib/site";

export const Route = createFileRoute("/")({
  component: Page,
});

function Page() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-12">
      <header className="max-w-xl text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Support
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Buy me a coffee
        </h1>
        <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
          If something here helped you, a small tip keeps the servers running
          and the coffee flowing. Thank you!
        </p>
      </header>

      <div className="w-full max-w-[640px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <iframe
          id="kofiframe"
          src={KOFI_URL}
          title="duyet"
          loading="lazy"
          className="block h-[clamp(480px,calc(100dvh-24rem),712px)] w-full border-none bg-[#f9f9f9] p-1 dark:bg-[#1a1a1a]"
        />
      </div>

      <a
        href={KOFI_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm underline underline-offset-4 transition-colors hover:text-accent"
      >
        Widget not loading? Open ko-fi.com/duyet
      </a>
    </section>
  );
}
