import { Link } from "@tanstack/react-router";
import { Github } from "@duyet/components/Icons";
import { addUtmParams } from "../../app/lib/utm";
import { ProjectBlogLinks } from "../components/ProjectBlogLinks";
import { ProjectMark } from "../components/ProjectMark";
import { SoftLabel, toneFrom } from "../components/SoftLabel";
import { resolveBlogPosts } from "../data/blog-posts";
import type { AppItem } from "../data/projects";
import { ColoredDomain } from "./ColoredDomain";

function sourceUrl(item: AppItem): string | undefined {
  if (item.repo) return item.repo;
  if (item.host === "github.com") {
    return item.href.split("?")[0];
  }
  return undefined;
}

function licenseOf(item: AppItem): string | undefined {
  if (item.license) return item.license;
  if (item.host === "github.com" || item.repo) return "MIT";
  return undefined;
}

export function ProjectList({ items }: { items: AppItem[] }) {
  return (
    <div className="overflow-hidden rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)]">
      {items.map((item) => {
        const href = addUtmParams(
          item.href,
          "projects",
          item.utmContent,
          item.host
        );
        const isExternal = href.startsWith("http");
        const blogPosts = resolveBlogPosts(item.blogPosts);
        const repo = sourceUrl(item);
        const license = licenseOf(item);
        const linkProps = isExternal
          ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
          : { href };

        const identity = (
          <span className="flex min-w-0 items-center gap-3">
            <ProjectMark
              item={item}
              size={28}
              className="h-7 w-7 shrink-0 overflow-hidden rounded-[5px] [&>img]:h-7 [&>img]:w-7 [&>img]:object-contain [&>svg]:h-7 [&>svg]:w-7"
            />
            <span className="min-w-0">
              <span className="block font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--rd-text-3)]">
                <ColoredDomain domain={item.domain || item.host} />
              </span>
              <span className="mt-0.5 block text-[0.9375rem] font-medium tracking-[-0.02em]">
                {item.name}
              </span>
            </span>
          </span>
        );

        return (
          <div
            key={item.name}
            className="grid grid-cols-1 items-start gap-x-4 gap-y-1.5 border-b border-[var(--rd-line)] px-[1.15rem] py-[0.85rem] last:border-b-0 hover:bg-[var(--rd-surface-2)] min-[721px]:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)_auto] min-[721px]:grid-rows-[auto_auto] min-[721px]:items-center"
          >
            {isExternal ? (
              <a
                {...linkProps}
                className="min-w-0 text-inherit no-underline min-[721px]:col-start-1 min-[721px]:row-start-1"
              >
                {identity}
              </a>
            ) : (
              <Link
                to={href}
                className="min-w-0 text-inherit no-underline min-[721px]:col-start-1 min-[721px]:row-start-1"
              >
                {identity}
              </Link>
            )}
            <span className="min-w-0 overflow-hidden text-ellipsis text-[0.8125rem] leading-[1.45] text-[var(--rd-text-2)] max-[720px]:line-clamp-2 min-[721px]:col-start-2 min-[721px]:row-start-1 min-[721px]:whitespace-nowrap">
              {item.description}
            </span>
            <span className="flex shrink-0 items-center justify-start gap-[0.4rem] min-[721px]:col-start-3 min-[721px]:row-start-1 min-[721px]:justify-end">
              {item.tags?.slice(0, 2).map((tag) => (
                <SoftLabel key={tag} tone={toneFrom(tag)}>
                  {tag}
                </SoftLabel>
              ))}
              {license ? (
                <span className="px-[0.15rem] font-[family-name:var(--font-mono)] text-[0.68rem] tracking-[0.04em] text-[var(--rd-text-3)]">
                  {license}
                </span>
              ) : null}
              {repo ? (
                <a
                  href={repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[1.6rem] w-[1.6rem] items-center justify-center rounded text-[var(--rd-text-2)] hover:bg-[var(--rd-surface-2)] hover:text-[var(--rd-text)]"
                  aria-label={`${item.name} source on GitHub`}
                >
                  <Github className="h-[15px] w-[15px]" />
                </a>
              ) : null}
            </span>
            {blogPosts.length > 0 ? (
              <ProjectBlogLinks
                slugs={item.blogPosts}
                heading="Posts"
                className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 pl-[calc(1.75rem+0.75rem)] min-[721px]:col-span-3 min-[721px]:row-start-2"
                headingClassName="m-0 text-[0.65rem] font-medium tracking-[0.06em] text-[var(--rd-text-4)] uppercase"
                linkClassName="text-[0.75rem] text-[var(--rd-text-2)] no-underline hover:text-[var(--rd-text)]"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
