import { ExternalLink, Star } from "lucide-react";
import { Badge } from "./ui/badge";

export type Repo = {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  license: string | null;
  updatedAt: string;
};

export async function fetchGitHubRepos(user: string): Promise<Repo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${user}/repos?sort=stars&per_page=12&type=owner`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "duyet.net",
        },
      },
    );
    if (!res.ok) return [];
    const raw = await res.json();
    if (!Array.isArray(raw)) return [];
    return (raw as Array<Record<string, unknown>>)
      .filter((r) => r.fork !== true)
      .map((r) => ({
        name: String(r.name ?? ""),
        description: r.description ? String(r.description) : null,
        stars: Number(r.stargazers_count ?? 0),
        forks: Number(r.forks_count ?? 0),
        watchers: Number(r.watchers_count ?? 0),
        language: r.language ? String(r.language) : null,
        license: r.license
          ? String((r.license as Record<string, unknown>).spdx_id ?? "")
          : null,
        updatedAt: String(r.pushed_at ?? r.updated_at ?? ""),
      }));
  } catch {
    return [];
  }
}

function languageColor(lang: string | null): string {
  if (!lang) return "bg-muted";
  const map: Record<string, string> = {
    TypeScript: "bg-blue-500",
    JavaScript: "bg-yellow-400",
    Rust: "bg-orange-500",
    Go: "bg-cyan-500",
    Python: "bg-green-500",
    HTML: "bg-red-400",
    CSS: "bg-purple-400",
    Shell: "bg-gray-500",
    Nix: "bg-indigo-500",
    MDX: "bg-teal-500",
  };
  return map[lang] ?? "bg-muted-foreground/40";
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function RepoCell({ repo }: { repo: Repo }) {
  return (
    <a
      href={`https://github.com/${repo.name.includes("/") ? repo.name : `duyet/${repo.name}`}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col gap-3 bg-background p-5 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-sm font-semibold text-foreground leading-tight">
          {repo.name}
        </span>
        <span className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground tabular-nums">
          <Star className="h-3 w-3" />
          {formatStars(repo.stars)}
        </span>
      </div>

      {repo.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {repo.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${languageColor(repo.language)}`}
            />
            {repo.language}
          </span>
        )}
        {repo.license && repo.license !== "NOASSERTION" && (
          <Badge variant="secondary" className="text-[10px] font-normal">
            {repo.license}
          </Badge>
        )}
      </div>
    </a>
  );
}

type OpenSourceGridProps = {
  repos: Repo[];
  user: string;
  /** @deprecated featured row is no longer rendered — bento renders all cells uniformly */
  featured?: string[];
};

export function OpenSourceGrid({ repos, user }: OpenSourceGridProps) {
  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);

  return (
    <section>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Open Source
          </p>
          <h2 className="mt-2 text-xl md:text-2xl font-semibold tracking-tight">
            Public Repositories
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {repos.length} public repositories · {formatStars(totalStars)} total
            stars
          </p>
        </div>
        <a
          href={`https://github.com/${user}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          github.com/{user}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {repos.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No repositories available right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {repos.map((repo) => (
            <RepoCell key={repo.name} repo={repo} />
          ))}
        </div>
      )}
    </section>
  );
}

export default OpenSourceGrid;
