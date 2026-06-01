import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@duyet/components";
import { type AppItem } from "../data/projects";
import { addUtmParams } from "../../app/lib/utm";
import { Badge } from "../components/ui/badge";
import { categoryOf } from "./filter-utils";

export function ProjectGrid({ items }: { items: AppItem[] }) {
  return (
    <div className="rd-work-grid">
      {items.map((item, i) => {
        const href = addUtmParams(
          item.href,
          "projects",
          item.utmContent,
          item.host,
        );
        const cat = categoryOf(item);
        const isExternal = href.startsWith("http");

        const cardClass =
          "rd-card flex flex-col p-5 min-h-[176px] no-underline text-inherit h-full";

        return (
          <Reveal key={item.name} delay={i * 25}>
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
              >
                <WorkCardBody item={item} cat={String(cat)} />
              </a>
            ) : (
              <Link to={href} className={cardClass}>
                <WorkCardBody item={item} cat={String(cat)} />
              </Link>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

function WorkCardBody({ item, cat }: { item: AppItem; cat: string }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2.5">
        <span className="flex items-center gap-2 font-[var(--font-mono)] rd-work-dom">
          {item.logo && (
            <img
              src={item.logo}
              alt=""
              width={16}
              height={16}
              className="shrink-0"
            />
          )}
          {item.domain || item.host}
        </span>
      </div>
      <h3 className="text-[1.18rem] tracking-[-0.03em] mt-[15px]">{item.name}</h3>
      <p className="rd-work-desc">{item.description}</p>
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-1 flex-wrap">
          {item.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{tag}</Badge>
          ))}
          <Badge variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{cat}</Badge>
        </div>
        <span className="text-[var(--rd-text-4)]">
          <ArrowUpRight size={15} />
        </span>
      </div>
    </>
  );
}
