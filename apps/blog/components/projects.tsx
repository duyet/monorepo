/* eslint-disable camelcase -- because want to keep original variable name from github api */
import { cn } from '@duyet/libs/utils';
import { CodeIcon, StarIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

interface ProjectProps {
  className?: string;
}

interface Project {
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
  archived: boolean;
  disabled: boolean;
}

export async function Projects({ className }: ProjectProps) {
  const projects = await getGithubProjects(
    'duyet',
    ['clickhouse-monitoring', 'pricetrack', 'grant-rs', 'charts'],
    [
      'awesome-web-scraper',
      'vietnamese-wordlist',
      'vietnamese-namedb',
      'vietnamese-frontend-interview-questions',
      'opencv-car-detection',
      'saveto',
      'firebase-shorten-url',
      'google-search-crawler',
    ],
    12,
  );

  return (
    <div className={cn('w-full', className)}>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {projects.map((project) => (
          <ProjectItem key={project.name} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectItem({
  project: { name, html_url, description, stargazers_count, language },
}: {
  project: Project;
}) {
  return (
    <div className="group relative rounded-lg border bg-background p-4 transition-all hover:shadow-lg">
      <Link className="absolute inset-0 z-10" href={html_url} prefetch={false}>
        <span className="sr-only">View project</span>
      </Link>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <StarIcon className="h-4 w-4" />
            <span>{stargazers_count}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {description || 'No description'}
        </p>

        {language ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CodeIcon className="h-4 w-4" />
            <span>{language}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Get Github projects of a user with some preferred projects and ignored projects
 */
async function getGithubProjects(
  owner: string,
  preferredProjects: string[] = [],
  ignoredProjects: string[] = [],
  n = 8,
): Promise<Project[]> {
  let allProjects: Project[] = [];

  const fetchPage = async (page: number) => {
    const params = new URLSearchParams({
      sort: 'pushed',
      per_page: '100',
      type: 'all',
      page: page.toString(),
    });
    const res = await fetch(
      `https://api.github.com/users/${owner}/repos?${params.toString()}`,
      { cache: 'force-cache' },
    );
    return res.json() as Promise<Project[]>;
  };

  const results = await Promise.all([1, 2, 3, 4, 5, 6].map(fetchPage));
  allProjects = results.flat();

  const filteredProjects = allProjects.filter(
    (project: Project) =>
      project.stargazers_count > 0 &&
      !project.archived &&
      !project.disabled &&
      !ignoredProjects.includes(project.name),
  );

  const sortedProjects = [
    ...preferredProjects
      .map((name) => filteredProjects.find((p) => p.name === name))
      .filter(Boolean),
    ...filteredProjects.filter((p) => !preferredProjects.includes(p.name)),
  ]
    .filter((project): project is Project => project !== undefined)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);

  return sortedProjects.slice(0, n);
}
