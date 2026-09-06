"use client";

import { useState } from "react";
import { artFor } from "../data/ascii-art";

const STEPS = [
  {
    title: "Start from the data",
    body: "Pipelines, warehouses, and metrics first — so agents have something true to stand on.",
  },
  {
    title: "Wire agents on top",
    body: "Tools, memory, evals, and routing. Prefer boring reliability over demo magic.",
  },
  {
    title: "Ship it open",
    body: "Most of it lands on GitHub or a subdomain. If it works for me, it should work for you.",
  },
] as const;

const ART_BY_STEP = [
  artFor("process-data", 0),
  artFor("process-agents", 4),
  artFor("process-ship", 7),
];

export function ProcessShowcase() {
  const [active, setActive] = useState(0);

  return (
    <div className="home-process">
      <div className="home-process-art" aria-hidden="true">
        <img
          key={ART_BY_STEP[active]}
          src={ART_BY_STEP[active]}
          alt=""
          className="home-process-art-img"
        />
        <div className="home-process-art-wash" />
        <div className="home-process-float">
          <div className="home-process-bubble home-process-bubble-user">
            Build an agent that watches ClickHouse and pages me when queries
            regress.
          </div>
          <div className="home-process-bubble home-process-bubble-ai">
            Wired a monitor on chmonitor → MCP → agents.duyet.net. Drafting the
            alert path now.
          </div>
        </div>
      </div>

      <div className="home-process-copy">
        <h2 className="home-process-title">How the work usually goes</h2>
        <ol className="home-process-steps">
          {STEPS.map((step, i) => {
            const isActive = i === active;
            return (
              <li key={step.title}>
                <button
                  type="button"
                  className={`home-process-step ${isActive ? "is-active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                >
                  <span className="home-process-step-label">
                    {String(i + 1).padStart(2, "0")}. {step.title}
                  </span>
                  <span className="home-process-step-body">{step.body}</span>
                  <span className="home-process-step-rail" aria-hidden="true">
                    <span
                      className="home-process-step-rail-fill"
                      style={{ width: isActive ? "34%" : "0%" }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
