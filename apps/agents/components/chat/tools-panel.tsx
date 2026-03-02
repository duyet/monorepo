"use client";

import { cn } from "@duyet/libs";
import {
  BarChart2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Globe,
  Home,
  Loader2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ToolInfo {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  needsApproval?: boolean;
}

const TOOLS: ToolInfo[] = [
  {
    name: "searchBlog",
    description: "Search blog posts by topic, keyword, or technology",
    icon: BookOpen,
    color: "text-orange-700 dark:text-orange-400",
  },
  {
    name: "getBlogPost",
    description: "Get full content of a specific blog post",
    icon: BookOpen,
    color: "text-orange-700 dark:text-orange-400",
  },
  {
    name: "getCV",
    description: "Retrieve professional experience and skills",
    icon: User,
    color: "text-purple-700 dark:text-purple-400",
  },
  {
    name: "getGitHub",
    description: "Fetch recent GitHub activity",
    icon: GitBranch,
    color: "text-blue-700 dark:text-blue-400",
    needsApproval: true,
  },
  {
    name: "getAnalytics",
    description: "Get contact form analytics and reports",
    icon: BarChart2,
    color: "text-amber-700 dark:text-amber-400",
    needsApproval: true,
  },
  {
    name: "getAbout",
    description: "Get general background information",
    icon: User,
    color: "text-purple-700 dark:text-purple-400",
  },
  {
    name: "fetchLlmsTxt",
    description: "Fetch llms.txt from any domain for AI-readable documentation",
    icon: Globe,
    color: "text-green-700 dark:text-green-400",
  },
];

const LLMS_DOMAINS = [
  { key: "home", url: "https://duyet.net/llms.txt", desc: "Central hub" },
  {
    key: "blog",
    url: "https://blog.duyet.net/llms.txt",
    desc: "297+ technical posts",
  },
  {
    key: "insights",
    url: "https://insights.duyet.net/llms.txt",
    desc: "Analytics dashboard",
  },
  {
    key: "llmTimeline",
    url: "https://llm-timeline.duyet.net/llms.txt",
    desc: "769+ LLM models",
  },
  { key: "cv", url: "https://cv.duyet.net/llms.txt", desc: "Professional CV" },
  {
    key: "photos",
    url: "https://photos.duyet.net/llms.txt",
    desc: "Photography portfolio",
  },
  {
    key: "homelab",
    url: "https://homelab.duyet.net/llms.txt",
    desc: "Homelab docs",
  },
];

interface ToolsPanelProps {
  onClose?: () => void;
}

export function ToolsPanel({ onClose }: ToolsPanelProps) {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [settings, setSettings] = useState<{
    customInstructions?: string;
    language?: string;
    timezone?: string;
  } | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);

  useEffect(() => {
    fetch("/api/user/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setSettings(data);
      })
      .catch((err) =>
        console.error("Failed to load settings in ToolsPanel:", err)
      )
      .finally(() => setLoadingContext(false));
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Available Tools</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
        {/* System Context */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Active System Context
          </h3>
          <div className="bg-muted/30 rounded-lg p-3 border border-border text-xs space-y-2">
            {loadingContext ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading context...
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-muted-foreground">Instructions:</span>
                  <span className="font-medium text-foreground text-right italic line-clamp-3">
                    "
                    {settings?.customInstructions ||
                      "No custom instructions set"}
                    "
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-medium text-foreground">
                    {settings?.language || "Auto-detect"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Timezone:</span>
                  <span className="font-medium text-foreground">
                    {settings?.timezone ||
                      Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tools List */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Agent Capabilities
          </h3>
          <div className="space-y-1">
            {TOOLS.map((tool) => (
              <div
                key={tool.name}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTool(
                      expandedTool === tool.name ? null : tool.name
                    )
                  }
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                >
                  {expandedTool === tool.name ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <tool.icon
                    className={cn("h-4 w-4 flex-shrink-0", tool.color)}
                  />
                  <span className="text-sm font-medium text-foreground flex-1">
                    {tool.name}
                  </span>
                  {tool.needsApproval && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                      Approval
                    </span>
                  )}
                </button>
                {expandedTool === tool.name && (
                  <div className="px-3 pb-2 pl-9">
                    <p className="text-xs text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* llms.txt Domains */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            llms.txt Domains
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {LLMS_DOMAINS.map((domain) => (
              <a
                key={domain.key}
                href={domain.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-foreground/30 hover:bg-muted/30 transition-all"
              >
                <Home className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {domain.key}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {domain.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
