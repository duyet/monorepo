import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { addUtmParams } from "../../app/lib/utm";
import { Badge } from "../components/ui/badge";
import type { AppItem } from "../data/projects";
import { ColoredDomain } from "./ColoredDomain";
import rawBlogPosts from "../../../blog/public/posts-data.json";

type BlogPost = { slug: string; title: string };
const blogBySlug = new Map<string, BlogPost>(
  (rawBlogPosts as BlogPost[]).map((p) => [p.slug, p]),
);

function Logo({
  logo,
  logoDark,
  size = 28,
}: {
  logo?: string;
  logoDark?: string;
  size?: number;
}) {
  if (!logo && !logoDark) return null;
  if (logoDark) {
    return (
      <>
        <img
          src={logo}
          alt=""
          width={size}
          height={size}
          className="shrink-0 rounded dark:hidden"
        />
        <img
          src={logoDark}
          alt=""
          width={size}
          height={size}
          className="hidden shrink-0 rounded dark:block"
        />
      </>
    );
  }
  return (
    <img
      src={logo}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded"
    />
  );
}

export function ProjectList({ items }: { items: AppItem[] }) {
  return (
    <div className="rd-rows">
      {items.map((item) => {
        const href = addUtmParams(
          item.href,
          "projects",
          item.utmContent,
          item.host
        );
        const isExternal = href.startsWith("http");
        const inner = (
          <>
            <span className="flex flex-col gap-1 w-[200px] shrink-0">
              <Logo logo={item.logo} logoDark={item.logoDark} size={28} />
              <span className="font-[var(--font-mono)] text-[12.5px] overflow-hidden text-ellipsis whitespace-nowrap">
                <ColoredDomain domain={item.domain || item.host} />
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-semibold mr-3 tracking-[-0.02em]">
                {item.name}
              </span>
              <span className="text-[var(--rd-text-2)] text-sm">
                {item.description}
              </span>
            </span>
            <div className="flex gap-1 shrink-0">
              {item.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="font-[var(--font-mono)] text-[10.5px] px-2 py-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </>
        );

        const rowClass =
          "rd-row flex items-center gap-4 no-underline text-inherit cursor-pointer";

        const blogPosts =
          item.blogPosts
            ?.map((slug) => blogBySlug.get(slug))
            .filter((p): p is BlogPost => p !== undefined) ?? [];

        const row = isExternal ? (
          <a
            key={item.name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClass}
          >
            {inner}
          </a>
        ) : (
          <Link key={item.name} to={href} className={rowClass}>
            {inner}
          </Link>
        );

        if (blogPosts.length === 0) return row;

        return (
          <div key={item.name} className="flex flex-col">
            {row}
            <div className="flex items-center gap-3 px-4 pb-3 mt-[-6px]">
              <span className="text-[11px] font-[var(--font-mono)] text-[var(--rd-text-3)] uppercase tracking-wider">
                Posts
              </span>
              {blogPosts.map((post) => (
                <a
                  key={post.slug}
                  href={`https://blog.duyet.net${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rd-ulink text-[12px] inline-flex items-center gap-1"
                >
                  {post.title} <ArrowUpRight size={10} />
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
