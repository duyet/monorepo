import { Eye, ExternalLink, GitFork, Star } from "lucide-react";
import { distanceToNow } from "@duyet/libs/date";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

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
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) return [];
    const raw = await res.json();
    if (!Array.isArray(raw)) return [];
    return (raw as Array<Record<string, unknown>>).map((r) => ({
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

function LanguageDot({ lang }: { lang: string | null }) {
  if (!lang) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <span
        className={`inline-block h-2 w-2 rounded-full ${languageColor(lang)}`}
      />
      {lang}
    </span>
  );
}

function FeaturedRepoCard({ repo }: { repo: Repo }) {
  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-col gap-3 p-6 h-full">
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-sm font-semibold text-foreground">
            {repo.name}
          </span>
          <Badge variant="outline" className="shrink-0 text-xs">
            Featured
          </Badge>
        </div>

        {repo.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {repo.description}
          </p>
        )}

        <div className="mt-auto space-y-3 pt-2">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 tabular-nums">
              <Star size={13} />
              {repo.stars.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 tabular-nums">
              <GitFork size={13} />
              {repo.forks.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 tabular-nums">
              <Eye size={13} />
              {repo.watchers.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <LanguageDot lang={repo.language} />
            {repo.license && repo.license !== "NOASSERTION" && (
              <span>{repo.license}</span>
            )}
            {repo.updatedAt && (
              <span>Updated {distanceToNow(new Date(repo.updatedAt))}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompactRepoCard({ repo }: { repo: Repo }) {
  return (
    <div className="flex flex-col gap-2 border p-4 hover:bg-muted transition-colors">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-sm font-medium text-foreground leading-tight">
          {repo.name}
        </span>
        <span className="flex items-center gap-0.5 shrink-0 text-xs text-muted-foreground tabular-nums">
          <Star size={11} />
          {repo.stars >= 1000
            ? `${(repo.stars / 1000).toFixed(1)}k`
            : repo.stars}
        </span>
      </div>
      {repo.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {repo.description}
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
        <LanguageDot lang={repo.language} />
        {repo.license && repo.license !== "NOASSERTION" && (
          <span>{repo.license}</span>
        )}
      </div>
    </div>
  );
}

type OpenSourceGridProps = {
  repos: Repo[];
  user: string;
  featured?: string[];
};

export function OpenSourceGrid({
  repos,
  user,
  featured = [],
}: OpenSourceGridProps) {
  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);

  const featuredRepos =
    featured.length > 0
      ? featured
          .map((name) => repos.find((r) => r.name === name))
          .filter((r): r is Repo => r !== undefined)
      : repos.slice(0, 2);

  const featuredNames = new Set(featuredRepos.map((r) => r.name));
  const compactRepos = repos.filter((r) => !featuredNames.has(r.name));

  return (
    <section>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Open Source
          </p>
          <h2 className="mt-2 text-2xl md:text-4xl font-semibold tracking-tight">
            Public Repositories
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {repos.length} public repositories ·{" "}
            {totalStars >= 1000
              ? `${(totalStars / 1000).toFixed(1)}k`
              : totalStars}{" "}
            total stars
          </p>
        </div>
        <a
          href={`https://github.com/${user}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          github.com/{user}
          <ExternalLink size={11} />
        </a>
      </div>

      {featuredRepos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {featuredRepos.map((repo) => (
            <FeaturedRepoCard key={repo.name} repo={repo} />
          ))}
        </div>
      )}

      {compactRepos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border">
          {compactRepos.map((repo) => (
            <div key={repo.name} className="bg-background">
              <CompactRepoCard repo={repo} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default OpenSourceGrid;
