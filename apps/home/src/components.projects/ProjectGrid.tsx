import { Reveal } from "@duyet/components";
import { ArrowUpRight } from "lucide-react";
import { ProjectCardHeader } from "../components/ProjectCardHeader";
import { Badge } from "../components/ui/badge";
import type { AppItem } from "../data/projects";
import { categoryOf } from "./filter-utils";
import rawBlogPosts from "../../../blog/public/posts-data.json";

type BlogPost = { slug: string; title: string };
const blogBySlug = new Map<string, BlogPost>(
  (rawBlogPosts as BlogPost[]).map((p) => [p.slug, p]),
);

export function ProjectGrid({ items }: { items: AppItem[] }) {
  return (
    <div className="rd-work-grid">
      {items.map((item, i) => {
        const cat = categoryOf(item);

        return (
          <Reveal key={item.name} delay={i * 25}>
            <div className="rd-card flex flex-col p-4 min-h-[176px] text-inherit h-full">
              <ProjectCardHeader
                item={item}
                titleClass="text-[1.18rem]"
                utm={{
                  source: "projects",
                  content: item.utmContent,
                  medium: item.host,
                }}
              />
              <p className="rd-work-desc">{item.description}</p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1 flex-wrap">
                  {item.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="font-[var(--font-mono)] text-[10.5px] px-2 py-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className="font-[var(--font-mono)] text-[10.5px] px-2 py-0"
                  >
                    {cat}
                  </Badge>
                </div>
              </div>
              {item.blogPosts ? (
                <div className="mt-2 flex flex-col gap-0.5">
                  {item.blogPosts
                    .map((slug) => blogBySlug.get(slug))
                    .filter((p): p is BlogPost => p !== undefined)
                    .slice(0, 2)
                    .map((post) => (
                      <a
                        key={post.slug}
                        href={`https://blog.duyet.net${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rd-ulink text-[11.5px] leading-snug inline-flex items-center gap-1"
                      >
                        {post.title} <ArrowUpRight size={10} />
                      </a>
                    ))}
                </div>
              ) : null}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
