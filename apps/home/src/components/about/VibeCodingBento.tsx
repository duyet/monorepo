import { Bot, Flame } from "lucide-react";
import { Eyebrow } from "@duyet/components";

interface Agent {
  name: string;
  role: string;
  desc: string;
}

interface VibeCodingBentoProps {
  agentsList: Agent[];
}

function VibeCodingBento({ agentsList }: VibeCodingBentoProps) {
  return (
    <div className="rd-vibe-bento mt-3">
      {/* Left: vibe-coding lead card */}
      <div className="rd-card rd-vibe-lead">
        <div className="rd-vibe-badge">
          <Flame size={12} />
          <a
            href="https://blog.duyet.net/2026/01/coding-agent/"
            className="no-underline text-inherit hover:text-[var(--rd-accent)] transition-colors"
          >
            Deep in vibe-coding mode
          </a>
        </div>
        <p className="mt-5 max-w-[40ch] text-[clamp(0.95rem,1.3vw,1.08rem)] leading-[1.6] text-[var(--rd-text-2)]">
          These days most of what ships here is written alongside coding
          agents, with me steering. I describe intent, review diffs, and
          keep the architecture honest — the agents do the typing, the
          searching, and a lot of the grunt work.
        </p>
        <div className="rd-vibe-stat">
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none">
            1.24<span className="rd-unit">B</span>
          </div>
          <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
            tokens burned all-time
          </span>
        </div>
      </div>

      {/* Right: agent cards */}
      <div className="rd-vibe-agents">
        {agentsList.map((agent) => (
          <div key={agent.name} className="rd-card rd-agent-card">
            <div className="rd-ac-top">
              <div className="rd-ac-ic">
                <Bot size={15} />
              </div>
              <span className="rd-ac-name">{agent.name}</span>
              <span className="rd-ac-role">{agent.role}</span>
            </div>
            <p className="rd-ac-desc">{agent.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { VibeCodingBento };
