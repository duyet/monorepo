import { addUtmParams } from "../../../app/lib/utm";
import { tw } from "../../lib/tw";

interface TechStackGroup {
  g: string;
  icon: string;
  items: string[];
}

function VibeCodingBento({ techStack }: { techStack: TechStackGroup[] }) {
  const agents = techStack.find((g) => g.g === "Coding agents");
  const kit = techStack.filter((g) => g.g !== "Coding agents");

  return (
    <div>
      <header className="mb-[0.85rem] flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
        <h2 className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.65rem,3vw,2.15rem)] font-normal tracking-[-0.035em] leading-[1.1]">
          Agentic Engineering
        </h2>
        <a
          className={tw.link}
          href={addUtmParams(
            "https://blog.duyet.net/2026/01/coding-agent/",
            "about_page",
            "agentic_engineering"
          )}
          target="_blank"
          rel="noreferrer"
        >
          Read the post
        </a>
      </header>
      <p className="m-0 max-w-[46rem] text-[0.98rem] leading-[1.65] text-[var(--rd-text-2)]">
        Most of what ships here is written with coding agents. I describe
        intent, review diffs, and keep the architecture honest; they do the
        typing, the searching, and a lot of the grunt work.
      </p>
      {agents ? (
        <ul className="mt-[1.35rem] mb-0 flex list-none flex-wrap items-baseline gap-y-[0.35rem] p-0">
          {agents.items.map((name, i) => (
            <li
              key={name}
              className="font-[family-name:var(--font-display)] text-[clamp(1.2rem,2.2vw,1.55rem)] font-normal tracking-[-0.03em] leading-[1.25] text-[var(--rd-text)]"
            >
              {i > 0 ? (
                <span className="mx-[0.7rem] font-sans text-[0.9rem] text-[var(--rd-text-4)]">
                  ·
                </span>
              ) : null}
              {name}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-[1.1rem] border-t border-[var(--rd-line)] pt-[1.35rem] sm:grid-cols-2">
        {kit.map((group) => (
          <div key={group.g}>
            <p className="m-0 text-[0.68rem] font-medium tracking-[0.08em] text-[var(--rd-text-3)] uppercase">
              {group.g}
            </p>
            <p className="mt-[0.35rem] mb-0 text-[0.9rem] leading-[1.5] tracking-[-0.015em] text-[var(--rd-text)]">
              {group.items.join("  ·  ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { VibeCodingBento };
