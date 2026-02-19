"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { type Agent } from "@/lib/types";
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
  return (
    <div className={cn("border-b border-border bg-card", className)}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-4 overflow-x-auto">
          {agents.map((agent) => {
            const isActive = agent.id === activeAgent.id;

            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => onAgentChange(agent)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 border",
                  "hover:bg-muted/50",
                  isActive && "bg-accent border-border shadow-sm"
                )}
              >
                {/* Avatar */}
                <Avatar className="h-9 w-9 border-border">
                  <AvatarFallback className={cn(
                    "text-sm font-bold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {agent.avatar || agent.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {agent.name}
                    </span>
                    {isActive && (
                      <Badge
                        variant="default"
                        className="ml-2 border-border"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {agent.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
