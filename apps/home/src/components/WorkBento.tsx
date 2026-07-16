import {
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Bot,
  BrainCircuit,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Link as LinkIcon,
  type LucideIcon,
  Package,
  Plug,
  Puzzle,
  Rss,
  Share2,
  Shield,
  ShoppingCart,
  Tag as TagIcon,
  Terminal,
  Type,
  X,
  ZoomIn,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { addUtmParams } from "../../app/lib/utm";
import type { AppItem } from "../data/projects";
import { ProjectCardHeader } from "./ProjectCardHeader";
import { Badge } from "./ui/badge";

interface WorkBentoProps {
  selectedProjects: { item: AppItem; tag: string }[];
}

/** Icons referenced by `AppItem.iconName` in src/data/projects.ts. */
const ICONS: Record<string, LucideIcon> = {
  BarChart2,
  BookOpen,
  Bot,
  BrainCircuit,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Link: LinkIcon,
  Package,
  Plug,
  Puzzle,
  Rss,
  Share2,
  Shield,
  ShoppingCart,
  Terminal,
  Type,
};

export function WorkBento({ selectedProjects }: WorkBentoProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Plain ease-out zoom — no spring, so the grid never wobbles on expand.
  const transition = reduceMotion
    ? { duration: 0 }
    : {
        type: "tween" as const,
        duration: 0.26,
        ease: [0.22, 1, 0.36, 1] as const,
      };

  return (
    <div className="rd-work-grid">
      {selectedProjects.map(({ item, tag }) => {
        const isOpen = expanded === item.name;
        const href = addUtmParams(
          item.href,
          "homepage",
          item.utmContent,
          item.host
        );
        const Icon = (item.iconName && ICONS[item.iconName]) || Globe;
        const tags = item.tags?.length ? item.tags : [tag];

        return (
          <motion.div
            key={item.name}
            layout
            transition={transition}
            style={{ borderRadius: "var(--rd-r)" }}
            className={`rd-card group relative flex flex-col p-4 min-h-[128px] text-inherit ${
              isOpen ? "sm:col-span-2 row-span-2" : ""
            }`}
          >
            {/* Click target sits behind the content so inner links still win. */}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : item.name)}
              aria-expanded={isOpen}
              aria-label={
                isOpen ? `Collapse ${item.name}` : `Expand ${item.name}`
              }
              className="absolute inset-0 z-0 cursor-pointer rounded-[var(--rd-r)]"
            />

            <motion.div
              layout="position"
              transition={transition}
              className="relative z-10 pointer-events-none [&_a]:pointer-events-auto"
            >
              <ProjectCardHeader
                item={item}
                titleClass={isOpen ? "text-[1.28rem]" : "text-[1.02rem]"}
                utm={{
                  source: "homepage",
                  content: item.utmContent,
                  medium: item.host,
                }}
              />
            </motion.div>

            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.div
                  key="detail"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.2, delay: 0.06 }
                  }
                  className="relative z-10 mt-3 flex-1 pointer-events-none [&_a]:pointer-events-auto"
                >
                  <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="min-w-0">
                      <p className="text-[13px] leading-[1.6] text-[var(--rd-text-2)]">
                        {item.description}
                      </p>

                      <div className="mt-3 flex flex-col gap-2 text-[12.5px]">
                        <span className="flex items-center gap-2 text-[var(--rd-text-3)]">
                          <Icon size={14} className="shrink-0" />
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rd-ulink font-[var(--font-mono)] text-[12px] break-all"
                          >
                            {item.domain || item.host}
                          </a>
                        </span>

                        <span className="flex items-center gap-2">
                          <TagIcon
                            size={14}
                            className="shrink-0 text-[var(--rd-text-3)]"
                          />
                          <span className="flex flex-wrap gap-1.5">
                            {tags.map((t) => (
                              <Badge
                                key={t}
                                variant="outline"
                                className="font-[var(--font-mono)] text-[10.5px] px-2 py-0"
                              >
                                {t}
                              </Badge>
                            ))}
                          </span>
                        </span>

                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rd-ulink w-fit"
                        >
                          Visit project <ArrowUpRight size={13} />
                        </a>
                      </div>
                    </div>

                    {item.screenshot ? (
                      <img
                        src={item.screenshot}
                        alt=""
                        loading="lazy"
                        className="w-full rounded-[var(--rd-r-sm)] border border-[var(--rd-border)] object-cover"
                      />
                    ) : null}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="summary"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    reduceMotion ? { duration: 0 } : { duration: 0.18 }
                  }
                  className="relative z-10 flex flex-1 flex-col pointer-events-none"
                >
                  <p className="rd-work-desc">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="font-[var(--font-mono)] text-[10.5px] px-2 py-0"
                    >
                      {tag}
                    </Badge>
                    {/* Expand affordance — the full-card button owns the click. */}
                    <ZoomIn
                      size={14}
                      aria-hidden="true"
                      className="shrink-0 text-[var(--rd-text-4)] transition-colors group-hover:text-[var(--rd-accent)]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isOpen ? (
              <button
                type="button"
                onClick={() => setExpanded(null)}
                aria-label={`Collapse ${item.name}`}
                className="absolute top-3 right-3 z-20 grid h-6 w-6 cursor-pointer place-items-center rounded-full border border-[var(--rd-border)] bg-[var(--rd-surface)] text-[var(--rd-text-3)] hover:text-[var(--rd-text)] hover:border-[var(--rd-border-2)] transition-colors"
              >
                <X size={12} />
              </button>
            ) : null}
          </motion.div>
        );
      })}
    </div>
  );
}
