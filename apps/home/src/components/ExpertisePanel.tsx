"use client";

import {
  DEFAULT_AREAS,
  type Area,
} from "@duyet/components";
import {
  BrainCircuit,
  Cloud,
  Code2,
  Database,
  type LucideIcon,
  Server,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { artFor } from "../data/ascii-art";
import { SoftLabel, toneFrom } from "./SoftLabel";

const ICONS: Record<string, LucideIcon> = {
  "Data Engineering": Database,
  "AI Agent Engineering": Sparkles,
  "Cloud Infrastructure": Cloud,
  "Backend & APIs": Server,
  "Frontend & UI": Code2,
  "DevOps & Observability": Terminal,
  "Open Source": BrainCircuit,
};

export function ExpertisePanel({
  areas = DEFAULT_AREAS,
}: {
  areas?: Area[];
}) {
  const [active, setActive] = useState(0);
  const current = areas[active] ?? areas[0];
  const ActiveIcon = ICONS[current.title] || Sparkles;

  return (
    <div className="home-expertise-split">
      <div className="home-expertise-list">
        <h2 className="home-process-title home-expertise-heading">
          Areas of expertise
        </h2>
        <ul className="home-expertise-items">
          {areas.map((area, i) => {
            const Icon = ICONS[area.title] || Sparkles;
            const isActive = i === active;
            return (
              <li key={area.title}>
                <button
                  type="button"
                  className={`home-expertise-item ${isActive ? "is-active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                >
                  <span className="home-expertise-item-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0">
                    <span className="home-feature-name">{area.title}</span>
                    <span className="home-feature-desc mt-0.5 block">
                      {area.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="home-expertise-stage" aria-live="polite">
        <div className="home-expertise-stage-art" aria-hidden="true">
          <img src={artFor(current.title, active)} alt="" />
        </div>
        <div className="home-expertise-stage-inner">
          <span className="home-expertise-stage-icon" aria-hidden="true">
            <ActiveIcon size={22} strokeWidth={1.5} />
          </span>
          <p className="home-cap-eyebrow">
            {current.years} years · {current.projectCount} projects
          </p>
          <h3 className="home-expertise-stage-title">{current.title}</h3>
          <p className="home-cap-body">{current.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {current.tags.map((tag) => (
              <SoftLabel key={tag} tone={toneFrom(tag)}>
                {tag}
              </SoftLabel>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
