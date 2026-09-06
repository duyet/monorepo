import { Reveal } from "@duyet/components";
import { ProjectBlogLinks } from "../components/ProjectBlogLinks";
import { ProjectCardHeader } from "../components/ProjectCardHeader";
import { SoftLabel, toneFrom } from "../components/SoftLabel";
import { artFor } from "../data/ascii-art";
import type { AppItem } from "../data/projects";
import { categoryOf } from "./filter-utils";

export function ProjectGrid({ items }: { items: AppItem[] }) {
  return (
    <div className="home-proj-grid">
      {items.map((item, i) => {
        const cat = categoryOf(item);
        const art = item.screenshot || artFor(item.name, i);
        return (
          <Reveal key={item.name} delay={Math.min(i * 20, 200)}>
            <article className="home-proj-card">
              <div className="home-proj-art" aria-hidden="true">
                <img src={art} alt="" loading="lazy" />
              </div>
              <div className="home-proj-body">
                <ProjectCardHeader
                  item={item}
                  titleClass="text-[1.12rem]"
                  utm={{
                    source: "projects",
                    content: item.utmContent,
                    medium: item.host,
                  }}
                />
                <p className="home-proj-desc">{item.description}</p>
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
                  linkClassName="home-text-link text-[12px]"
                />
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
