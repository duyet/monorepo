"use client";

import type { Agent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AgentSwitcherProps {
  agents: Agent[];
  activeAgent: Agent;
  onAgentChange: (agent: Agent) => void;
  className?: string;
}

export function AgentSwitcher({
  agents,
  activeAgent,
  onAgentChange,
  className,
}: AgentSwitcherProps) {
  // With a single agent there's nothing to switch — render a compact status bar
  if (agents.length <= 1) {
    return (
      <div className={cn("border-b border-border bg-muted/20 px-4 py-1.5 flex items-center gap-2", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
        <span className="text-xs text-muted-foreground truncate">{activeAgent.description}</span>
      </div>
    );
  }

  return (
    <div className={cn("border-b border-border bg-card", className)}>
      <div className="flex items-center gap-1 px-3 py-1.5 overflow-x-auto">
        {agents.map((agent) => {
          const isActive = agent.id === activeAgent.id;
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => onAgentChange(agent)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>{agent.avatar || agent.name.slice(0, 2)}</span>
              <span>{agent.name}</span>
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
