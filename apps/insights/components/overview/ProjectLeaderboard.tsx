/**
 * The project leaderboard: the six projects with the most tokens, each with a
 * meter scaled against the leading project's token count.
 *
 * Guarded on a non-empty leaderboard. Unlike the most-read list this is not
 * links — a project is a directory, not a URL — so the rows are `div`s and the
 * number is the compact token count rather than a visitor count.
 */
import { Eyebrow } from "@duyet/components";
import { formatCompact } from "./helpers";
import type { topProjects } from "./derive";

type ProjectRank = ReturnType<typeof topProjects>[number];

function ProjectLeaderboard({ projects }: { projects: ProjectRank[] }) {
  if (projects.length === 0) return null;

  return (
    <div
      id="ins-projects"
      className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(22px,2.6vw,30px)]"
    >
      <div
        className="flex justify-between items-end mb-2"
      >
        <div>
          <Eyebrow>AI · projects</Eyebrow>
          <h3
            className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
          >
            Where the work happened
          </h3>
        </div>
        <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
          top projects by tokens · 30d
        </span>
      </div>
      <div className="rd-rows">
        {projects.map((item, i) => {
          const max = projects[0].tokens;
          return (
            <div
              key={i}
              className="rd-row grid-cols-[auto_1fr_auto] gap-[18px] items-center"
            >
              <span
                className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs w-[22px]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span
                  className="font-[var(--font-mono)] text-[13.5px] block truncate"
                >
                  {item.name}
                </span>
                <div
                  className="rd-meter mt-2 max-w-[360px]"
                >
                  <i
                    style={{
                      width: `${(item.tokens / max) * 100}%`,
                    }}
                  />
                </div>
              </span>
              <span
                className="font-[var(--font-mono)] text-sm font-semibold"
              >
                {formatCompact(item.tokens)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ProjectLeaderboard };
