import { Link } from "@tanstack/react-router";
import { addUtmParams } from "../../app/lib/utm";
import { ProjectBlogLinks } from "../components/ProjectBlogLinks";
import { SoftLabel, toneFrom } from "../components/SoftLabel";
import { resolveBlogPosts } from "../data/blog-posts";
import type { AppItem } from "../data/projects";
import { ColoredDomain } from "./ColoredDomain";

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
          className="shrink-0 rounded-lg dark:hidden"
        />
        <img
          src={logoDark}
          alt=""
          width={size}
          height={size}
          className="hidden shrink-0 rounded-lg dark:block"
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
      className="shrink-0 rounded-lg"
    />
  );
}

export function ProjectList({ items }: { items: AppItem[] }) {
  return (
    <div className="home-inbox">
      {items.map((item) => {
        const href = addUtmParams(
          item.href,
          "projects",
          item.utmContent,
          item.host
        );
        const isExternal = href.startsWith("http");
        const blogPosts = resolveBlogPosts(item.blogPosts);

        const inner = (
          <>
            <span className="flex items-center gap-3 min-w-0">
              <Logo logo={item.logo} logoDark={item.logoDark} size={28} />
              <span className="min-w-0">
                <span className="home-inbox-from block">
                  <ColoredDomain domain={item.domain || item.host} />
                </span>
                <span className="home-inbox-subject block mt-0.5">
                  {item.name}
                </span>
              </span>
            </span>
            <span className="home-inbox-snip hidden md:block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              {item.description}
            </span>
            <span className="hidden sm:flex flex-wrap gap-1.5 justify-end">
              {item.tags?.slice(0, 2).map((tag) => (
                <SoftLabel key={tag} tone={toneFrom(tag)}>
                  {tag}
                </SoftLabel>
              ))}
            </span>
          </>
        );

        const rowClass =
          "home-inbox-row !grid-cols-1 md:!grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)_auto] no-underline text-inherit";

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
          <div key={item.name}>
            {row}
            <ProjectBlogLinks
              slugs={item.blogPosts}
              heading="Posts"
              className="flex flex-wrap items-center gap-3 px-4 pb-3"
              headingClassName="text-[11px] text-[var(--rd-text-3)]"
              linkClassName="home-text-link text-[12px]"
            />
          </div>
        );
      })}
    </div>
  );
}
