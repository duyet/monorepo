import type { GithubRepo } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import { StarIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { getGithubToken } from "./github-utils";

interface JustStarsProps {
  owner: string;
  className?: string;
}

export async function GithubActivity({ owner, className }: JustStarsProps) {
  const repos = await getGithubStars(owner);

  // Safety check for repos array
  if (!repos || !Array.isArray(repos)) {
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
        <Link
          className="font-bold hover:underline"
          href={`https://github.com/${owner}`}
        >
          @{owner}
        </Link>
        {" starred "}
        <Link className="font-bold hover:underline" href={html_url}>
          {full_name}
        </Link>
      </p>

      <p className="flex flex-row gap-1 text-xs text-muted-foreground">
        <StarIcon className="h-4 w-4 text-muted-foreground" />
        {stargazers_count}
      </p>
    </div>
  );
}

async function getGithubStars(owner: string): Promise<GithubRepo[]> {
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

    return res.json() as Promise<GithubRepo[]>;
  };

  return fetchPage(1);
}
