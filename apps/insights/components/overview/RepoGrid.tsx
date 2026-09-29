/**
 * The open-source grid: up to six public repos as cards linking to GitHub.
 *
 * Guarded on a non-empty repo list. The card shell is `rd-card` again inside
 * a `rd-card` section, and `Star` renders before the count — a decorative
 * import that is the only place the page pulls an icon directly.
 */
import { Star } from "lucide-react";
import { Eyebrow } from "@duyet/components";
import type { RepoCard } from "./derive";

function RepoGrid({
  repos,
  totalStars,
}: {
  repos: RepoCard[];
  totalStars: number;
}) {
  if (repos.length === 0) return null;

  return (
    <div
      id="ins-repos"
      className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(22px,2.6vw,30px)]"
    >
      <div
        className="flex justify-between items-end mb-[18px]"
      >
        <div>
          <Eyebrow>Open source · GitHub</Eyebrow>
          <h3
            className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
          >
            Public repositories
          </h3>
        </div>
        <a
          className="font-[var(--font-mono)] text-[var(--rd-text-3)] rd-ulink text-[12.5px]"
          href="https://github.com/duyet"
          target="_blank"
          rel="noreferrer"
        >
          {repos.length} repos · {totalStars} stars
        </a>
      </div>
      <div className="rd-g3">
        {repos.map((r) => (
          <a
            key={r.name}
            className="rd-card p-[clamp(18px,2.2vw,26px)] bg-[var(--rd-bg-sub)] px-[18px] py-[16px] no-underline text-inherit"
            href={`https://github.com/duyet/${r.name}`}
            target="_blank"
            rel="noreferrer"
          >
            <div
              className="font-[var(--font-mono)] text-sm font-semibold truncate"
            >
              {r.name}
            </div>
            <div
              className="flex items-center gap-3 mt-3"
            >
              {r.language && (
                <span className="rd-chip text-[11px]">
                  {r.language}
                </span>
              )}
              {r.license && (
                <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px]">
                  {r.license}
                </span>
              )}
              <span
                className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px] ml-auto inline-flex items-center gap-1"
              >
                <Star size={12} /> {r.stars}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export { RepoGrid };
