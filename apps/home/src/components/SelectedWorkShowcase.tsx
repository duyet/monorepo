"use client";

import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { addUtmParams } from "../../app/lib/utm";
import { tw } from "../lib/tw";
import { ProjectBlogLinks } from "./ProjectBlogLinks";
import { ProjectMark } from "./ProjectMark";
import { artFor, SHOWCASE_LANDSCAPE } from "../data/ascii-art";
import type { AppItem } from "../data/projects";

const STEP_MS = 5200;

function workTone(item: AppItem): string {
  return (
    item.workTone ??
    item.tone?.match(/#[0-9a-fA-F]{3,8}/)?.[0] ??
    "#6b7280"
  );
}

function outboundLinks(
  item: AppItem,
  primaryHref: string
): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [];
  if (item.host !== "github.com") {
    links.push({ label: item.domain || item.host, href: primaryHref });
  }
  if (item.repo) {
    links.push({ label: "GitHub", href: item.repo });
  } else if (item.host === "github.com") {
    links.push({ label: "GitHub", href: primaryHref });
  }
  for (const extra of item.extraLinks ?? []) {
    if (!links.some((l) => l.href === extra.href)) links.push(extra);
  }
  return links;
}

interface SelectedWorkShowcaseProps {
  featured: { item: AppItem; tag: string; label: string }[];
  more: AppItem[];
}

export function SelectedWorkShowcase({
  featured,
  more,
}: SelectedWorkShowcaseProps) {
  const items = featured;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const [capBelow, setCapBelow] = useState(false);
  const copyRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || items.length < 2) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setTimeout(() => {
      setActive((i) => (i + 1) % items.length);
      setTick((t) => t + 1);
    }, STEP_MS);

    return () => window.clearTimeout(id);
  }, [active, paused, items.length, tick]);

  const current = items[active];
  const logoOnlyArt = Boolean(current?.item.showcaseLogoArt);
  const art = current
    ? logoOnlyArt
      ? SHOWCASE_LANDSCAPE
      : current.item.screenshot || artFor(current.item.name, active)
    : "";
  const logo = current
    ? (current.item.showcaseLogo ??
      current.item.logoDark ??
      current.item.logo)
    : undefined;

  useLayoutEffect(() => {
    const copy = copyRef.current;
    const frame = frameRef.current;
    if (!copy || !frame) return;

    const measure = () => {
      const stacked = window.matchMedia("(max-width: 899px)").matches;
      setCapBelow(
        stacked || frame.offsetHeight + 48 < copy.offsetHeight
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(copy);
    ro.observe(frame);
    const mq = window.matchMedia("(max-width: 899px)");
    mq.addEventListener("change", measure);
    const media = frame.querySelector("img");
    media?.addEventListener("load", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      media?.removeEventListener("load", measure);
    };
  }, [active, art]);

  if (!current) return null;
  const href = addUtmParams(
    current.item.href,
    "homepage",
    `${current.item.utmContent}_selected`,
    current.item.host
  );

  return (
    <div>
      <div
        className="grid items-start gap-[clamp(1.25rem,2.5vw,2rem)] max-[899px]:grid-cols-1 min-[900px]:grid-cols-[minmax(0,min(22rem,40%))_minmax(0,1fr)] min-[900px]:gap-[clamp(1.5rem,3vw,2.25rem)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          setTick((t) => t + 1);
        }}
      >
        <div className="flex min-w-0 flex-col" ref={copyRef}>
          <div className="mb-[0.55rem] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.45rem,2.4vw,1.75rem)] font-normal tracking-[-0.03em] leading-[1.1]">
              Selected work
            </h2>
            <Link to="/projects" className={tw.link}>
              All projects
              <ArrowUpRight size={13} />
            </Link>
          </div>
          <ol className="m-0 flex list-none flex-col p-0">
            {items.map(({ item, tag, label }, i) => {
              const isActive = i === active;
              const itemHref = addUtmParams(
                item.href,
                "homepage",
                `${item.utmContent}_selected`,
                item.host
              );
              return (
                <li key={item.name}>
                  <div
                    className="grid w-full cursor-pointer grid-cols-[1.15rem_minmax(0,1fr)] gap-x-[0.55rem] gap-y-[0.2rem] border-0 bg-transparent py-[0.42rem] text-left text-inherit"
                    style={
                      {
                        "--work-tone": workTone(item),
                      } as CSSProperties
                    }
                    onClick={() => {
                      setActive(i);
                      setTick((t) => t + 1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActive(i);
                        setTick((t) => t + 1);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                  >
                    <span
                      className="pt-[0.28rem] font-[family-name:var(--font-mono)] text-[0.68rem] tracking-[0.04em] text-[var(--work-tone,var(--rd-text-3))]"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="flex min-w-0 items-center justify-between gap-3">
                        <span
                          className="inline-flex min-w-0 items-center gap-[0.4rem] overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[0.9375rem] font-medium tracking-[-0.02em] text-[var(--rd-text)] max-[640px]:text-[0.875rem]"
                        >
                          <ProjectMark
                            item={item}
                            size={16}
                            className="inline-block h-4 w-4 shrink-0 overflow-hidden rounded-[3px] [&>svg]:h-4 [&>svg]:w-4"
                          />
                          {label}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-[0.45rem]">
                          <span className="text-[0.7rem] font-medium tracking-[0.06em] text-[var(--work-tone,var(--rd-text-3))] uppercase opacity-70 max-[640px]:hidden">
                            {tag}
                          </span>
                          <a
                            href={itemHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-6 w-6 items-center justify-center rounded text-[var(--work-tone,var(--rd-text))] no-underline hover:bg-[color-mix(in_srgb,var(--work-tone,var(--rd-text))_14%,transparent)]"
                            aria-label={`Open ${label}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ArrowUpRight size={15} />
                          </a>
                        </span>
                      </span>
                      {isActive ? (
                        <>
                          <span className="mt-[0.18rem] line-clamp-1 text-[0.8rem] leading-[1.4] text-[var(--rd-text-2)]">
                            {item.description}
                          </span>
                          <span className="mt-[0.12rem] text-[0.7rem] tracking-[-0.01em] text-[var(--rd-text-3)]">
                            {item.domain || item.host}
                          </span>
                          <span
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <ProjectBlogLinks
                              slugs={item.blogPosts}
                              limit={1}
                              className="mt-[0.28rem]"
                              linkClassName="inline-flex max-w-full items-center gap-[0.2rem] text-[0.75rem] text-[var(--work-tone,var(--rd-accent-ink))] no-underline hover:underline"
                              iconSize={11}
                            />
                          </span>
                          <span
                            className="mt-[0.4rem] block h-px overflow-hidden bg-[var(--rd-border)]"
                            aria-hidden="true"
                          >
                            <span
                              key={`fill-${tick}-${i}`}
                              className="block h-full origin-left bg-[var(--work-tone,var(--rd-text))] animate-[work-rail_linear_forwards]"
                              style={{
                                animationDuration: `${STEP_MS}ms`,
                                animationPlayState: paused
                                  ? "paused"
                                  : "running",
                              }}
                            />
                          </span>
                        </>
                      ) : null}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div
          className={`relative block h-auto w-full max-[899px]:order-[-1] min-[900px]:sticky min-[900px]:top-[calc(var(--rd-nav-h)+1rem)] ${capBelow ? "" : ""}`}
        >
          <div
            className="relative overflow-hidden rounded-[var(--rd-r-lg)] bg-[var(--rd-surface)]"
            ref={frameRef}
          >
            <img
              key={`${current.item.name}-${art}`}
              src={art}
              alt=""
              className="block h-auto w-full object-contain align-top"
            />
            {capBelow ? null : (
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(10_10_10/0.45),transparent_55%)]" />
            )}
            {logo ? (
              <div
                className={`pointer-events-none absolute inset-0 z-[1] grid place-items-center ${logoOnlyArt ? "" : ""}`}
              >
                <img
                  src={logo}
                  alt=""
                  className={
                    current.item.showcaseWordmark
                      ? "h-auto w-[min(78%,22rem)] drop-shadow-[0_8px_28px_rgb(0_0_0/0.45)]"
                      : logoOnlyArt
                        ? "max-h-[38%] w-[clamp(6.5rem,38%,12rem)] object-contain"
                        : "max-h-[28%] w-[clamp(4.5rem,22%,7rem)] object-contain"
                  }
                />
              </div>
            ) : null}
          </div>
          <div
            className={
              capBelow
                ? "static rounded-none bg-none px-[0.1rem] pt-[0.85rem] pb-0"
                : "absolute inset-x-0 bottom-0 z-[2] flex flex-col items-start gap-[0.45rem] rounded-b-[var(--rd-r-lg)] bg-[linear-gradient(to_top,rgb(10_10_10/0.72)_0%,rgb(10_10_10/0.28)_55%,transparent_100%)] px-[1.05rem] pt-[2.75rem] pb-[0.95rem]"
            }
          >
            <p
              className={
                capBelow
                  ? "m-0 line-clamp-4 max-w-[38rem] text-[0.8125rem] leading-[1.45] text-[var(--rd-text-2)]"
                  : "m-0 line-clamp-3 max-w-[38rem] text-[0.8125rem] leading-[1.45] text-white/90"
              }
            >
              {current.item.description}
            </p>
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
              {outboundLinks(current.item, href).map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    capBelow
                      ? "inline-flex items-center gap-1 border-b border-[color-mix(in_srgb,var(--rd-text)_28%,transparent)] text-[0.8125rem] font-medium text-[var(--rd-text)] no-underline hover:border-[var(--rd-text)]"
                      : "inline-flex items-center gap-1 border-b border-white/35 text-[0.8125rem] font-medium text-white no-underline hover:border-white"
                  }
                >
                  {l.label}
                  <ArrowUpRight size={13} />
                </a>
              ))}
            </span>
          </div>
        </div>
      </div>

      {more.length > 0 ? (
        <div className="mt-8">
          <p className="mb-2 flex items-center justify-between text-[0.7rem] font-medium tracking-[0.08em] text-[var(--rd-text-3)] uppercase">
            Also shipping
            <Link to="/projects" className={tw.link}>
              More →
            </Link>
          </p>
          <ul className="m-0 flex list-none flex-wrap items-center gap-x-1 gap-y-2 p-0">
            {more.map((item) => {
              const itemHref = addUtmParams(
                item.href,
                "homepage",
                `${item.utmContent}_more`,
                item.host
              );
              return (
                <li key={item.name}>
                  <a
                    href={itemHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[0.32rem] text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--rd-text-2)] no-underline hover:text-[var(--rd-text)]"
                  >
                    <ProjectMark
                      item={item}
                      size={16}
                      generated
                      className="inline-block h-4 w-4 shrink-0 overflow-hidden rounded [&>svg]:h-4 [&>svg]:w-4"
                    />
                    {item.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
