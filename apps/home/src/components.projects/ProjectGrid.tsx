import { tw } from "../lib/tw";
import { ProjectBlogLinks } from "../components/ProjectBlogLinks";
import { ProjectCardHeader } from "../components/ProjectCardHeader";
import { SoftLabel, toneFrom } from "../components/SoftLabel";
import { artFor } from "../data/ascii-art";
import type { AppItem } from "../data/projects";
import { categoryOf } from "./filter-utils";

export function ProjectGrid({ items }: { items: AppItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[1024px]:grid-cols-3">
      {items.map((item, i) => {
        const cat = categoryOf(item);
        const art = item.screenshot || artFor(item.name, i);
        return (
          <article
            key={item.name}
            className="flex flex-col overflow-hidden rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)]"
          >
            <div className="aspect-[16/10] overflow-hidden bg-[var(--rd-bg-sub)]" aria-hidden="true">
              <img
                src={art}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <ProjectCardHeader
                item={item}
                titleClass="text-[1.12rem]"
                utm={{
                  source: "projects",
                  content: item.utmContent,
                  medium: item.host,
                }}
              />
              <p className="mt-2 line-clamp-3 text-[0.85rem] leading-[1.5] text-[var(--rd-text-2)]">
                {item.description}
              </p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {item.tags?.slice(0, 3).map((tag) => (
                  <SoftLabel key={tag} tone={toneFrom(tag)}>
                    {tag}
                  </SoftLabel>
                ))}
                <SoftLabel tone="slate">{cat}</SoftLabel>
              </div>
              <ProjectBlogLinks
                slugs={item.blogPosts}
                limit={2}
                className="mt-2 flex flex-col gap-0.5"
                linkClassName={`${tw.link} text-[12px]`}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
