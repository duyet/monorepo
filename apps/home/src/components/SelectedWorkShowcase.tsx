"use client";

import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { artFor } from "../data/ascii-art";
import type { AppItem } from "../data/projects";

const STEP_MS = 5200;

interface SelectedWorkShowcaseProps {
  featured: { item: AppItem; tag: string }[];
  more: AppItem[];
}

export function SelectedWorkShowcase({
  featured,
  more,
}: SelectedWorkShowcaseProps) {
  const items = featured.slice(0, 6);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (paused || items.length < 2) return;

    const id = window.setTimeout(() => {
      setActive((i) => (i + 1) % items.length);
      setTick((t) => t + 1);
    }, STEP_MS);

    return () => window.clearTimeout(id);
  }, [active, paused, items.length, tick]);

  const current = items[active];
  if (!current) return null;

  const logoOnlyArt =
    current.item.name === "AnyRouter" || current.item.name === "TemplateBot";
  const art = logoOnlyArt
    ? artFor(current.item.name, active)
    : current.item.screenshot || artFor(current.item.name, active);
  const video = logoOnlyArt ? undefined : current.item.video;
  const logo = current.item.logoDark || current.item.logo;
  const href = addUtmParams(
    current.item.href,
    "homepage",
    `${current.item.utmContent}_selected`,
    current.item.host
  );

  return (
    <div className="home-work">
      <div
        className="home-process"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          setTick((t) => t + 1);
        }}
      >
        <div className="home-process-copy">
          <div className="home-process-head">
            <h2 className="home-process-title">Selected work</h2>
            <Link to="/projects" className="home-text-link">
              All projects
              <ArrowUpRight size={13} />
            </Link>
          </div>
          <ol className="home-process-steps">
            {items.map(({ item, tag }, i) => {
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
                    className={`home-process-step ${isActive ? "is-active" : ""}`}
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
                    <span className="home-process-step-top">
                      <a
                        href={itemHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="home-process-step-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(item.logoDark || item.logo) && (
                          <img
                            src={item.logoDark || item.logo}
                            alt=""
                            className="home-process-step-mark"
                          />
                        )}
                        <span className="home-process-step-domain">
                          {item.domain || item.host}
                        </span>
                        <ArrowUpRight size={14} />
                      </a>
                    </span>
                    <span className="home-process-step-body">
                      {tag} · {item.description}
                    </span>
                    <span className="home-process-step-rail" aria-hidden="true">
                      <span
                        key={isActive ? `fill-${tick}-${i}` : `idle-${i}`}
                        className={`home-process-step-rail-fill ${
                          isActive ? "is-running" : ""
                        }`}
                        style={{
                          animationDuration: isActive
                            ? `${STEP_MS}ms`
                            : undefined,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                      />
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="home-process-foot">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="home-text-link inline-flex"
            >
              Open {current.item.domain || current.item.host}
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`home-process-art ${logoOnlyArt ? "is-logo-art" : ""}`}
          aria-label={`Visit ${current.item.name}`}
        >
          {video ? (
            <video
              key={video}
              className="home-process-art-img"
              src={video}
              poster={current.item.screenshot}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              key={`${current.item.name}-${art}`}
              src={art}
              alt=""
              className="home-process-art-img"
            />
          )}
          <div className="home-process-art-wash" />
          {logo ? (
            <div className="home-process-logo">
              <img src={logo} alt="" />
            </div>
          ) : null}
        </a>
      </div>

      {more.length > 0 ? (
        <div className="home-work-more">
          <p className="home-work-more-label">
            Also shipping
            <Link to="/projects" className="home-text-link">
              More →
            </Link>
          </p>
          <ul className="home-work-more-list">
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
                    className="home-work-more-link"
                  >
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
