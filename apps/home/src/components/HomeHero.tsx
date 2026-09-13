import { DuyetLogo, Reveal } from "@duyet/components";
import { tw } from "../lib/tw";
import { HeroStory } from "./HeroStory";

const socialLink =
  "inline-flex items-center gap-[0.32rem] text-[0.875rem] tracking-[-0.01em] text-[var(--rd-text)] no-underline border-b border-[color-mix(in_srgb,var(--rd-text)_22%,transparent)] hover:text-[var(--rd-accent-ink)] hover:border-[var(--rd-accent)]";

export function HomeHero() {
  return (
    <section>
      <div className="mx-auto w-full max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(3.5rem,8vw,6.5rem)] pb-[clamp(2.5rem,5vw,4rem)]">
        <Reveal>
          <div className="grid items-center gap-[clamp(1.25rem,3vw,2.5rem)] max-[799px]:grid-cols-[minmax(0,1fr)_auto] max-[799px]:items-start max-[799px]:gap-x-4 max-[480px]:grid-cols-1 min-[800px]:grid-cols-[minmax(0,1fr)_auto] min-[800px]:gap-[clamp(2rem,5vw,4rem)]">
            <div className="min-w-0 max-w-[46rem]">
              <h1 className="m-0 flex flex-col gap-3">
                <span className={`${tw.display} max-[799px]:text-[clamp(1.7rem,8.2vw,2.35rem)]`}>
                  AI/Data Engineer
                </span>
                <span className={tw.title}>
                  Building agent workflows and the data platform underneath
                  them.
                </span>
              </h1>
              <HeroStory />
              <nav
                className="mt-[clamp(1.2rem,2.2vw,1.7rem)] flex flex-wrap items-center gap-[0.55rem] text-[0.875rem]"
                aria-label="Social"
              >
                <a href="https://github.com/duyet" className={socialLink}>
                  <img
                    className="h-3.5 w-3.5 shrink-0 rounded-[3px] object-contain"
                    src="https://www.google.com/s2/favicons?domain=github.com&sz=32"
                    alt=""
                    width={14}
                    height={14}
                  />
                  duyet
                </a>
                <span className="select-none text-[var(--rd-text-4)]" aria-hidden="true">
                  |
                </span>
                <a href="https://x.com/_duyet" className={socialLink}>
                  <img
                    className="h-3.5 w-3.5 shrink-0 rounded-[3px] object-contain"
                    src="https://www.google.com/s2/favicons?domain=x.com&sz=32"
                    alt=""
                    width={14}
                    height={14}
                  />
                  _duyet
                </a>
                <span className="select-none text-[var(--rd-text-4)]" aria-hidden="true">
                  |
                </span>
                <a href="https://linkedin.com/in/duyet" className={socialLink}>
                  <img
                    className="h-3.5 w-3.5 shrink-0 rounded-[3px] object-contain"
                    src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=32"
                    alt=""
                    width={14}
                    height={14}
                  />
                  duyet
                </a>
              </nav>
            </div>
            <DuyetLogo
              tone="auto"
              format="svg"
              className="justify-self-end h-[clamp(8.5rem,22vw,15rem)] w-[clamp(8.5rem,22vw,15rem)] bg-none max-[799px]:h-[3.75rem] max-[799px]:w-[3.75rem] max-[480px]:order-first max-[480px]:h-[4.25rem] max-[480px]:w-[4.25rem] max-[480px]:justify-self-start"
              imgClassName="block h-full w-full object-contain"
              alt="duyet.net"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
