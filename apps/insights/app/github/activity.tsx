import type { GithubRepo } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import { StarIcon } from "@radix-ui/react-icons";
import { getGithubToken } from "./github-utils";

interface JustStarsProps {
  owner: string;
  className?: string;
}

/** Sync view component — receives pre-fetched repos */
export function GithubActivityView({
  owner,
  repos,
  className,
}: {
  owner: string;
  repos: GithubRepo[];
  className?: string;
}) {
  if (!repos || !Array.isArray(repos) || repos.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">No activity data available</p>
          <p className="mt-2 text-xs text-muted-foreground">
            GitHub API may be unavailable or repository access is limited
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
        {repos.map((repo: GithubRepo) => (
          <Activity key={repo.name} owner={owner} repo={repo} />
        ))}
      </div>
    </div>
  );
}

function Activity({
  owner,
  repo: { html_url, full_name, stargazers_count },
}: {
  owner: string;
  repo: GithubRepo;
}) {
  return (
    <div className="flex items-center justify-between gap-2 p-2">
      <p className="text-sm font-medium">
        <a
          className="font-bold hover:underline"
          href={`https://github.com/${owner}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{owner}
        </a>
        {" starred "}
        <a
          className="font-bold hover:underline"
          href={html_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {full_name}
        </a>
      </p>

      <p className="flex flex-row gap-1 text-xs text-muted-foreground">
        <StarIcon className="h-4 w-4 text-muted-foreground" />
        {stargazers_count}
      </p>
    </div>
  );
}

export async function fetchGithubStars(owner: string): Promise<GithubRepo[]> {
  const token = getGithubToken();
  if (!token) {
    console.warn("GITHUB_TOKEN not configured, returning empty starred repos");
    return [];
  }

  const fetchPage = async (page: number) => {
    const params = new URLSearchParams({
      per_page: "20",
      type: "all",
      page: page.toString(),
    });

    const headers = new Headers({
      Authorization: `Bearer ${token}`,
    });

    const res = await fetch(
      `https://api.github.com/users/${owner}/starred?${params.toString()}`,
      { cache: "force-cache", headers }
    );

    if (!res.ok) {
      console.warn(
        `GitHub API error ${res.status} fetching starred repos for ${owner}`
      );
      return [];
    }

    return res.json() as Promise<GithubRepo[]>;
  };

  return fetchPage(1);
}
