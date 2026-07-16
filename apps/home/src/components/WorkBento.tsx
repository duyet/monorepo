import { ArrowUpRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { addUtmParams } from "../../app/lib/utm";
import type { AppItem } from "../data/projects";
import { ProjectCardHeader } from "./ProjectCardHeader";
import { Badge } from "./ui/badge";

interface WorkBentoProps {
  selectedProjects: { item: AppItem; tag: string }[];
}

/** Detail tile used inside the expanded 2×2 block. */
function Tile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 border border-[var(--rd-border)] rounded-[var(--rd-r)] p-3">
      <div className="font-[var(--font-mono)] text-[9.5px] uppercase tracking-[0.08em] text-[var(--rd-text-4)]">
        {label}
      </div>
      <div className="mt-1.5 text-[12.5px] leading-[1.5] text-[var(--rd-text-2)]">
        {children}
      </div>
    </div>
  );
}

export function WorkBento({ selectedProjects }: WorkBentoProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Springy enough to feel alive, damped enough not to wobble the whole grid.
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 38, mass: 0.9 };

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

        return (
          <motion.div
            key={item.name}
            layout
            transition={transition}
            style={{ borderRadius: "var(--rd-r)" }}
            className={`rd-card relative flex flex-col p-4 min-h-[128px] text-inherit ${
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
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.22, delay: 0.06 }
                  }
                  className="relative z-10 mt-3 flex-1 pointer-events-none [&_a]:pointer-events-auto"
                >
                  {/* 2×2 block of detail tiles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Tile label="What it is">{item.description}</Tile>
                    <Tile label="Where">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rd-ulink font-[var(--font-mono)] text-[12px] break-all"
                      >
                        {item.domain || item.host}
                      </a>
                    </Tile>
                    <Tile label="Tags">
                      <div className="flex flex-wrap gap-1.5">
                        {(item.tags?.length ? item.tags : [tag]).map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="font-[var(--font-mono)] text-[10.5px] px-2 py-0"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </Tile>
                    <Tile label="Open">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rd-ulink text-[12.5px]"
                      >
                        Visit project <ArrowUpRight size={13} />
                      </a>
                    </Tile>
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close affordance — only while open. */}
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.button
                  type="button"
                  key="close"
                  initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: -30 }}
                  transition={
                    reduceMotion ? { duration: 0 } : { duration: 0.16 }
                  }
                  onClick={() => setExpanded(null)}
                  aria-label={`Collapse ${item.name}`}
                  className="absolute top-3 right-3 z-20 grid h-6 w-6 cursor-pointer place-items-center rounded-full border border-[var(--rd-border)] bg-[var(--rd-surface)] text-[var(--rd-text-3)] hover:text-[var(--rd-text)] hover:border-[var(--rd-border-2)] transition-colors"
                >
                  <X size={12} />
                </motion.button>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
