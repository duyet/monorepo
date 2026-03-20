import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { d as cn, m as models, g as getSlug, o as organizations } from "./router-Dyrqdy-I.js";
import { Search, X, GitCompare, List, Keyboard, Info, Check, ChevronUp, ChevronDown, Link2, Sparkles, Building2, Database, Calendar } from "lucide-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { d as getTypeColor, g as getLicenseColor, e as getSourceColor, h as getRelatedModels, M as MODEL_CARD_RELATED_MODELS_LIMIT, c as filterModels, i as groupByYear, j as groupByOrg, D as DEFAULT_FILTERS, p as parseParamValue, f as formatDate, a as getLicenseBarColor } from "./utils-BYY1hTdF.js";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
function FilterInfo({
  resultCount,
  view,
  license = "all",
  liteMode,
  searchQuery = "",
  onSearchChange,
  onLicenseChange,
  comparisonMode,
  onToggleComparisonMode
}) {
  const handleSearchChange = (e) => {
    onSearchChange?.(e.target.value);
  };
  const clearSearch = () => {
    onSearchChange?.("");
  };
  const toggleLiteMode = () => {
    const url = new URL(window.location.href);
    if (liteMode) {
      url.searchParams.delete("lite");
    } else {
      url.searchParams.set("lite", "true");
    }
    window.location.href = url.toString();
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] px-4 py-3 animate-fade-in animate-fade-in-delay-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Search models...",
              value: searchQuery,
              onChange: handleSearchChange,
              className: "w-64 h-[42px] rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] text-neutral-900 dark:text-neutral-100 py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            }
          ),
          searchQuery && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: clearSearch,
              className: "absolute right-3 top-1/2 -translate-y-1/2 transition-all hover:opacity-70 text-neutral-500 dark:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 rounded",
              children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm whitespace-nowrap text-neutral-500 dark:text-neutral-400", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-neutral-900 dark:text-neutral-100", children: resultCount.toLocaleString() }),
          " ",
          view === "organizations" ? "organizations" : "models"
        ] })
      ] }),
      onLicenseChange && /* @__PURE__ */ jsxs(
        "select",
        {
          value: license,
          onChange: (e) => onLicenseChange(
            e.target.value
          ),
          className: "rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] text-neutral-900 dark:text-neutral-100 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500",
          children: [
            /* @__PURE__ */ jsx("option", { value: "all", children: "All Licenses" }),
            /* @__PURE__ */ jsx("option", { value: "open", children: "Open Weights" }),
            /* @__PURE__ */ jsx("option", { value: "closed", children: "Closed" }),
            /* @__PURE__ */ jsx("option", { value: "partial", children: "Partials" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        view === "models" && onToggleComparisonMode && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onToggleComparisonMode,
            className: cn(
              "rounded-xl p-2 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-400",
              comparisonMode && "bg-neutral-200 dark:bg-neutral-700 border border-neutral-400 dark:border-neutral-500"
            ),
            title: comparisonMode ? "Exit comparison mode" : "Enter comparison mode (select 2-3 models to compare)",
            "aria-label": comparisonMode ? "Exit comparison mode" : "Enter comparison mode",
            children: /* @__PURE__ */ jsx(
              GitCompare,
              {
                className: `h-4 w-4 ${comparisonMode ? "text-white" : "text-neutral-500 dark:text-neutral-400"}`
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: toggleLiteMode,
            className: cn(
              "rounded-xl p-2 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-400",
              liteMode && "bg-neutral-200 dark:bg-neutral-700 border border-neutral-400 dark:border-neutral-500"
            ),
            title: liteMode ? "Switch to full view" : "Switch to lite mode",
            "aria-label": "Toggle lite mode",
            children: /* @__PURE__ */ jsx(List, { className: "h-4 w-4 text-neutral-500 dark:text-neutral-400" })
          }
        )
      ] })
    ] }),
    comparisonMode && /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] px-4 py-2 text-sm", children: /* @__PURE__ */ jsxs("span", { className: "text-neutral-900 dark:text-neutral-100", children: [
      /* @__PURE__ */ jsx("strong", { children: "Comparison mode:" }),
      " Click on model cards to select them (max 3). Press",
      " ",
      /* @__PURE__ */ jsx("kbd", { className: "rounded border border-neutral-200 dark:border-white/10 px-1.5 py-0.5 font-mono text-xs", children: "c" }),
      " ",
      "when ready to compare."
    ] }) })
  ] });
}
const TOP_ORGANIZATIONS = [
  "Google",
  "Google DeepMind",
  "Meta",
  "OpenAI",
  "Microsoft",
  "Anthropic",
  "NVIDIA",
  "University of California, Berkeley",
  "Stanford University"
];
function useKeyboardShortcuts({
  organizations: organizations2,
  onFilterByOrg,
  onClearFilters
}) {
  const shortcutOrgs = useMemo(() => {
    return TOP_ORGANIZATIONS.slice(0, 9).filter((org) => organizations2.includes(org)).map((name, index) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      key: String(index + 1),
      name
    }));
  }, [organizations2]);
  const [activeKey, setActiveKey] = useState(null);
  const [showBadges, setShowBadges] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key, 10) - 1;
        if (index < shortcutOrgs.length) {
          e.preventDefault();
          const org = shortcutOrgs[index];
          setActiveKey(org.key);
          setShowBadges(true);
          onFilterByOrg(org.name);
        }
      }
      if (e.code.startsWith("Numpad")) {
        const numpadNum = parseInt(e.code.replace("Numpad", ""), 10);
        if (numpadNum >= 1 && numpadNum <= 9) {
          const index = numpadNum - 1;
          if (index < shortcutOrgs.length) {
            e.preventDefault();
            const org = shortcutOrgs[index];
            setActiveKey(org.key);
            setShowBadges(true);
            onFilterByOrg(org.name);
          }
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setActiveKey(null);
        setShowBadges(false);
        onClearFilters();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        setShowBadges((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcutOrgs, onFilterByOrg, onClearFilters]);
  return {
    activeKey,
    showBadges,
    showHelp,
    setShowHelp,
    shortcutOrgs
  };
}
function KeyboardHelpTooltip({
  isOpen,
  onClose,
  shortcutOrgs
}) {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-lg rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-neutral-900", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Keyboard, { className: "h-4 w-4 text-neutral-600 dark:text-neutral-400" }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-neutral-900 dark:text-white", children: "Keyboard Shortcuts" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "rounded p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors",
          "aria-label": "Close help",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
        /* @__PURE__ */ jsx("p", { className: "text-neutral-600 dark:text-neutral-400 mb-2", children: "Filter by organization:" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2", children: shortcutOrgs.map((org) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between gap-2",
            children: [
              /* @__PURE__ */ jsx("span", { className: "truncate text-neutral-700 dark:text-neutral-300", children: org.name }),
              /* @__PURE__ */ jsx("kbd", { className: "shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-white", children: org.key })
            ]
          },
          org.id
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-neutral-200 dark:border-white/10 pt-2 space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-neutral-600 dark:text-neutral-400", children: "Clear filters" }),
          /* @__PURE__ */ jsx("kbd", { className: "rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-white", children: "Esc" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-neutral-600 dark:text-neutral-400", children: "Toggle this help" }),
          /* @__PURE__ */ jsx("kbd", { className: "rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-white", children: "?" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-neutral-600 dark:text-neutral-400", children: "Open comparison (when 2+ models selected)" }),
          /* @__PURE__ */ jsx("kbd", { className: "rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-white", children: "c" })
        ] })
      ] })
    ] })
  ] }) });
}
function KeyboardHelpButton({ onClick }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      className: "fixed bottom-6 right-6 z-40 rounded-full border border-neutral-200 bg-white p-3 shadow-md transition-all hover:scale-105 hover:shadow-lg dark:border-white/10 dark:bg-neutral-900",
      "aria-label": "Show keyboard shortcuts",
      children: /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 text-neutral-600 dark:text-neutral-400" })
    }
  );
}
const ORG_LOGOS = {
  // --- simple-icons (confirmed in v16.9.0) ---
  Anthropic: { source: "simpleicons", slug: "anthropic", hex: "191919" },
  Google: { source: "simpleicons", slug: "google", hex: "4285F4" },
  "Google DeepMind": { source: "simpleicons", slug: "deepmind", hex: "4285F4" },
  DeepMind: { source: "simpleicons", slug: "deepmind", hex: "4285F4" },
  Meta: { source: "simpleicons", slug: "meta", hex: "0467DF" },
  "Meta AI": { source: "simpleicons", slug: "meta", hex: "0467DF" },
  "Mistral AI": { source: "simpleicons", slug: "mistralai", hex: "FA520F" },
  Mistral: { source: "simpleicons", slug: "mistralai", hex: "FA520F" },
  Alibaba: { source: "simpleicons", slug: "alibabadotcom", hex: "FF6A00" },
  "Hugging Face": { source: "simpleicons", slug: "huggingface", hex: "FFD21E" },
  Apple: { source: "simpleicons", slug: "apple", hex: "000000" },
  Baidu: { source: "simpleicons", slug: "baidu", hex: "2932E1" },
  ByteDance: { source: "simpleicons", slug: "bytedance", hex: "3C8CFF" },
  Nvidia: { source: "simpleicons", slug: "nvidia", hex: "76B900" },
  MiniMax: { source: "simpleicons", slug: "minimax", hex: "E73562" },
  Salesforce: { source: "simpleicons", slug: "salesforce", hex: "00A1E0" },
  Tencent: { source: "simpleicons", slug: "tencent", hex: "1DB954" },
  // --- @lobehub/icons-static-svg (AI-specific, covers trademark-removed brands) ---
  OpenAI: { source: "lobehub", slug: "openai" },
  Microsoft: { source: "lobehub", slug: "microsoft" },
  xAI: { source: "lobehub", slug: "xai" },
  "DeepSeek-AI": { source: "lobehub", slug: "deepseek" },
  Cohere: { source: "lobehub", slug: "cohere" },
  Amazon: { source: "lobehub", slug: "aws" },
  IBM: { source: "lobehub", slug: "ibm" },
  "Stability AI": { source: "lobehub", slug: "stability" },
  Qwen: { source: "lobehub", slug: "qwen" },
  "Zhipu AI": { source: "lobehub", slug: "zhipu" },
  "Moonshot AI": { source: "lobehub", slug: "kimi" },
  Yi: { source: "lobehub", slug: "yi" },
  "01-ai": { source: "lobehub", slug: "yi" },
  "Allen AI": { source: "lobehub", slug: "ai2" },
  AllenAI: { source: "lobehub", slug: "ai2" },
  TII: { source: "lobehub", slug: "tii" },
  Falcon: { source: "lobehub", slug: "tii" },
  Inception: { source: "lobehub", slug: "inception" },
  "Liquid AI": { source: "lobehub", slug: "liquid" }
};
const LOBEHUB_CDN = "https://unpkg.com/@lobehub/icons-static-svg@latest/icons";
const SIMPLEICONS_CDN = "https://cdn.simpleicons.org";
function getOrgLogoUrl(org, darkMode = false) {
  const logo = ORG_LOGOS[org];
  if (!logo) return null;
  if (logo.source === "lobehub") {
    return `${LOBEHUB_CDN}/${logo.slug}.svg`;
  }
  const hex = logo.hex ?? "888888";
  const color = darkMode && isPerceivedDark(hex) ? "ffffff" : hex;
  return `${SIMPLEICONS_CDN}/${logo.slug}/${color}`;
}
function isPerceivedDark(hex) {
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1e3 < 128;
}
function getOrgInitials(org) {
  return org.split(/[\s\-_]+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
function getOrgColor(org) {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
  ];
  let hash = 0;
  for (const ch of org) hash = hash * 31 + ch.charCodeAt(0) & 4294967295;
  return colors[Math.abs(hash) % colors.length];
}
function OrgAvatar({ org, size = "sm" }) {
  const [logoError, setLogoError] = useState(false);
  const { resolvedTheme } = useTheme();
  const darkMode = resolvedTheme === "dark";
  const logoUrl = getOrgLogoUrl(org, darkMode);
  const initials = getOrgInitials(org);
  const colorClass = getOrgColor(org);
  const sizeClass = size === "sm" ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-xs";
  const px = size === "sm" ? 24 : 32;
  if (logoUrl && !logoError) {
    return /* @__PURE__ */ jsx(
      "img",
      {
        src: logoUrl,
        alt: `${org} logo`,
        width: px,
        height: px,
        className: cn("rounded-md object-contain", sizeClass),
        onError: () => setLogoError(true)
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "flex shrink-0 items-center justify-center rounded-md font-semibold",
        sizeClass,
        colorClass
      ),
      title: org,
      children: initials
    }
  );
}
function ModelCard({
  model,
  isLast,
  lite,
  isSelectable,
  isSelected,
  onSelectionChange
}) {
  if (lite) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative flex items-center gap-3 py-1.5 group",
        style: { minHeight: "32px" },
        children: [
          isSelectable && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onSelectionChange?.(!isSelected),
              className: cn(
                "shrink-0 relative flex items-center justify-center transition-all",
                "w-5 h-5 rounded border",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
                "dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2",
                isSelected ? "bg-neutral-700 dark:bg-neutral-300 border-neutral-700 dark:border-neutral-300" : "bg-white dark:bg-[#111] border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30"
              ),
              "aria-label": isSelected ? `Deselect ${model.name}` : `Select ${model.name} for comparison`,
              children: isSelected && /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-white dark:text-black" })
            }
          ),
          !isSelectable && /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "shrink-0 w-2 h-2 rounded-full",
                model.type === "milestone" ? "bg-neutral-500 dark:bg-neutral-400" : "bg-neutral-300 dark:bg-neutral-600"
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx(OrgAvatar, { org: model.org, size: "sm" }),
            /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-medium text-neutral-900 dark:text-neutral-100", children: model.name })
          ] }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex-1 px-2 opacity-40 bg-[length:4px_4px] bg-repeat-x bg-center [background-image:radial-gradient(circle,rgb(212_212_212)_1px,transparent_1px)] dark:[background-image:radial-gradient(circle,rgb(64_64_64)_1px,transparent_1px)]"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-[family-name:var(--font-mono)] text-neutral-500 dark:text-neutral-400", children: model.date.slice(0, 4) }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  getTypeColor(model.type)
                ),
                children: model.type
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  getLicenseColor(model.license)
                ),
                children: model.license
              }
            ),
            model.source && /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  getSourceColor(model.source)
                ),
                children: model.source === "epoch" ? "Epoch" : "Curated"
              }
            )
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-3 pb-6 group", children: [
    !isLast && /* @__PURE__ */ jsx("div", { className: "absolute left-[13px] top-0 h-full w-px bg-neutral-200 dark:bg-white/10" }),
    isSelectable ? /* @__PURE__ */ jsx("div", { className: "relative z-10 shrink-0 bg-[#fbf7f0] dark:bg-[#1f1f1f]", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => onSelectionChange?.(!isSelected),
        className: cn(
          "flex items-center justify-center transition-all rounded-lg p-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
          "dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2",
          isSelected ? "bg-neutral-700 dark:bg-neutral-300" : "bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30"
        ),
        "aria-label": isSelected ? `Deselect ${model.name}` : `Select ${model.name} for comparison`,
        children: isSelected ? /* @__PURE__ */ jsx(Check, { className: "h-5 w-5 text-white dark:text-black" }) : /* @__PURE__ */ jsx(OrgAvatar, { org: model.org, size: "sm" })
      }
    ) }) : /* @__PURE__ */ jsx("div", { className: "relative z-10 shrink-0 rounded-lg p-1 bg-[#fbf7f0] dark:bg-[#1f1f1f]", children: /* @__PURE__ */ jsx(OrgAvatar, { org: model.org, size: "sm" }) }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex-1 rounded-xl border p-4 transition-all bg-white dark:bg-[#111]",
          "hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm",
          isSelectable && isSelected ? "ring-2 ring-neutral-400 dark:ring-neutral-500 ring-offset-2 border-neutral-400 dark:border-white/20" : "border-neutral-200 dark:border-white/10"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex flex-wrap items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold truncate text-neutral-900 dark:text-neutral-100", children: model.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs truncate text-neutral-500 dark:text-neutral-400", children: model.org })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-[family-name:var(--font-mono)] text-neutral-500 dark:text-neutral-400", children: model.date.slice(0, 7) }),
              model.params && /* @__PURE__ */ jsx("div", { className: "text-xs font-[family-name:var(--font-mono)] text-neutral-500 dark:text-neutral-400", children: model.params })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex gap-1.5", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  getTypeColor(model.type)
                ),
                children: model.type
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  getLicenseColor(model.license)
                ),
                children: model.license
              }
            ),
            model.source && /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  getSourceColor(model.source)
                ),
                children: model.source === "epoch" ? "Epoch" : "Curated"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed line-clamp-3 text-neutral-500 dark:text-neutral-400", children: model.desc }),
          (model.domain || model.link || model.trainingCompute || model.trainingHardware || model.authors) && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-neutral-200 dark:border-white/10 pt-2 text-[11px] text-neutral-500 dark:text-neutral-400", children: [
            model.domain && /* @__PURE__ */ jsx("span", { children: model.link ? /* @__PURE__ */ jsx(
              "a",
              {
                href: model.link,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200",
                children: model.domain
              }
            ) : model.domain }),
            !model.domain && model.link && /* @__PURE__ */ jsx(
              "a",
              {
                href: model.link,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200",
                children: "Paper"
              }
            ),
            model.trainingCompute && /* @__PURE__ */ jsxs("span", { className: "font-[family-name:var(--font-mono)]", children: [
              model.trainingCompute,
              " FLOP"
            ] }),
            model.trainingHardware && /* @__PURE__ */ jsx("span", { children: model.trainingHardware }),
            model.authors && /* @__PURE__ */ jsx("span", { className: "truncate max-w-[200px]", title: model.authors, children: model.authors })
          ] }),
          /* @__PURE__ */ jsx(RelatedModelsSection, { model })
        ]
      }
    )
  ] });
}
function RelatedModelsSection({ model }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const relatedModels = useMemo(() => {
    return getRelatedModels(model, models, MODEL_CARD_RELATED_MODELS_LIMIT);
  }, [model]);
  if (relatedModels.length === 0) {
    return null;
  }
  const handleCompareAll = () => {
    const modelSlugs = relatedModels.map((m) => getSlug(m.name));
    navigate({ to: "/compare", search: { models: modelSlugs.join(",") } });
  };
  return /* @__PURE__ */ jsxs("div", { className: "mt-3 border-t border-neutral-200 dark:border-white/10 pt-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setIsExpanded(!isExpanded),
          className: "flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 transition-all hover:text-neutral-900 dark:hover:text-neutral-200",
          children: [
            isExpanded ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Related Models (",
              relatedModels.length,
              ")"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleCompareAll,
          className: cn(
            "rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs",
            "dark:border-white/10 dark:bg-white/5",
            "text-neutral-600 dark:text-neutral-400 transition-colors",
            "hover:border-neutral-300 dark:hover:border-white/20 hover:text-neutral-900 dark:hover:text-neutral-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
            "dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
          ),
          children: "Compare All"
        }
      )
    ] }),
    isExpanded && /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-col gap-1.5", children: relatedModels.map((related) => /* @__PURE__ */ jsxs(
      "a",
      {
        href: `#${related.name}`,
        className: "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50 dark:hover:bg-white/5",
        title: related.desc,
        children: [
          /* @__PURE__ */ jsx(OrgAvatar, { org: related.org, size: "sm" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "truncate text-xs font-medium text-neutral-900 dark:text-neutral-100", children: related.name }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400", children: [
              /* @__PURE__ */ jsx("span", { children: related.org }),
              related.params && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { children: "·" }),
                /* @__PURE__ */ jsx("span", { className: "font-[family-name:var(--font-mono)]", children: related.params })
              ] }),
              /* @__PURE__ */ jsx("span", { children: "·" }),
              /* @__PURE__ */ jsx("span", { children: related.date.slice(0, 4) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Link2, { className: "h-3 w-3 shrink-0 text-neutral-500 dark:text-neutral-400" })
        ]
      },
      related.name
    )) })
  ] });
}
function OrgTimeline({ modelsByOrg, liteMode }) {
  const sortedOrgs = Array.from(modelsByOrg.keys());
  if (sortedOrgs.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-8 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-neutral-500 dark:text-neutral-400", children: "No models found matching your filters." }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "space-y-8", children: sortedOrgs.map((org) => {
    const orgModels = modelsByOrg.get(org) || [];
    return /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          contentVisibility: "auto",
          containIntrinsicSize: "0 500px"
        },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-4 overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "shrink-0 overflow-hidden", children: /* @__PURE__ */ jsx(
              "span",
              {
                className: "select-none text-3xl font-bold leading-none block font-[family-name:var(--font-mono)] whitespace-nowrap text-neutral-200 dark:text-neutral-700",
                "aria-hidden": "true",
                children: org
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "h-px flex-1 min-w-0 shrink bg-neutral-200 dark:bg-white/10" }),
            /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
              /* @__PURE__ */ jsx(OrgAvatar, { org, size: "sm" }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "text-sm font-medium truncate max-w-[12rem] text-neutral-900 dark:text-neutral-100",
                  children: org
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "text-xs uppercase tracking-widest font-[family-name:var(--font-mono)] text-neutral-500 dark:text-neutral-400", children: [
                orgModels.length,
                " model",
                orgModels.length !== 1 ? "s" : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "ml-2", children: orgModels.map((model, index) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "transition-all rounded-xl",
              children: /* @__PURE__ */ jsx(
                ModelCard,
                {
                  model,
                  isLast: index === orgModels.length - 1,
                  lite: liteMode
                }
              )
            },
            `${model.org}-${model.date}-${model.name}-${index}`
          )) })
        ]
      },
      org
    );
  }) });
}
function StatsCards({
  models: models2,
  organizations: organizations2,
  activeView,
  sourceStats
}) {
  const totalSources = sourceStats ? Object.values(sourceStats).reduce((a, b) => a + b, 0) : 0;
  return /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-in animate-fade-in-delay-1", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: cn(
          "group rounded-xl border p-5 transition-all hover:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2",
          activeView === "models" ? "border-neutral-300 dark:border-white/20 bg-white dark:bg-[#111] shadow-sm" : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] hover:border-neutral-300 dark:hover:border-white/20"
        ),
        children: [
          /* @__PURE__ */ jsx("div", { className: "mb-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-neutral-600 dark:text-neutral-400" }) }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-[family-name:var(--font-mono)] tracking-tight", children: models2.toLocaleString() }),
          /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider", children: "Models" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/org",
        className: cn(
          "group rounded-xl border p-5 transition-all hover:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2",
          activeView === "organizations" ? "border-neutral-300 dark:border-white/20 bg-white dark:bg-[#111] shadow-sm" : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] hover:border-neutral-300 dark:hover:border-white/20"
        ),
        children: [
          /* @__PURE__ */ jsx("div", { className: "mb-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5", children: /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4 text-neutral-600 dark:text-neutral-400" }) }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-[family-name:var(--font-mono)] tracking-tight", children: organizations2.toLocaleString() }),
          /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider", children: "Organizations" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5", children: /* @__PURE__ */ jsx(Database, { className: "h-4 w-4 text-neutral-600 dark:text-neutral-400" }) }),
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-[family-name:var(--font-mono)] tracking-tight", children: totalSources > 0 ? totalSources.toLocaleString() : "—" }),
      /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider", children: "Data Points" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5", children: /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-neutral-600 dark:text-neutral-400" }) }),
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-[family-name:var(--font-mono)] tracking-tight", children: "2017–26" }),
      /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider", children: "Years Covered" })
    ] })
  ] });
}
function useTimelineKeyboardNavigation({
  isEnabled,
  totalItems,
  currentIndex,
  onNavigate,
  onClear
}) {
  const handleKeyDown = useCallback(
    (event) => {
      if (!isEnabled) return;
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (currentIndex < totalItems - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
        case "Home":
          event.preventDefault();
          onNavigate(0);
          break;
        case "End":
          event.preventDefault();
          onNavigate(totalItems - 1);
          break;
        case "Escape":
          event.preventDefault();
          onClear?.();
          break;
      }
    },
    [isEnabled, currentIndex, totalItems, onNavigate, onClear]
  );
  useEffect(() => {
    if (!isEnabled) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled, handleKeyDown]);
  return { handleKeyDown };
}
function Timeline({
  modelsByYear,
  liteMode,
  focusedIndex = -1,
  onFocusChange,
  comparisonMode,
  selectedModelNames,
  onToggleSelection
}) {
  const sortedYears = useMemo(
    () => Array.from(modelsByYear.keys()).sort((a, b) => b - a),
    [modelsByYear]
  );
  const flatModels = useMemo(() => {
    const result = [];
    for (const year of sortedYears) {
      const yearModels = modelsByYear.get(year) || [];
      yearModels.forEach((model, yearIndex) => {
        result.push({ model, year, yearIndex });
      });
    }
    return result;
  }, [modelsByYear, sortedYears]);
  const yearStartIndices = useMemo(() => {
    const indices = /* @__PURE__ */ new Map();
    let currentIndex = 0;
    for (const year of sortedYears) {
      indices.set(year, currentIndex);
      currentIndex += (modelsByYear.get(year) || []).length;
    }
    return indices;
  }, [modelsByYear, sortedYears]);
  useTimelineKeyboardNavigation({
    isEnabled: focusedIndex >= 0,
    totalItems: flatModels.length,
    currentIndex: focusedIndex,
    onNavigate: onFocusChange || (() => {
    })
  });
  if (sortedYears.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-12 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-medium text-neutral-400 dark:text-neutral-500", children: "No models found" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-neutral-400 dark:text-neutral-500", children: "Try adjusting your filters" })
    ] });
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "space-y-10",
      role: "listbox",
      "aria-label": "Timeline of LLM models",
      tabIndex: focusedIndex >= 0 ? 0 : -1,
      children: sortedYears.map((year) => {
        const yearModels = modelsByYear.get(year) || [];
        const yearStartIndex = yearStartIndices.get(year) || 0;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              contentVisibility: "auto",
              containIntrinsicSize: "0 500px"
            },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-4", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "select-none text-6xl sm:text-7xl font-bold leading-none text-neutral-200 dark:text-neutral-700 font-[family-name:var(--font-display)]",
                      "aria-hidden": "true",
                      children: year
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-[family-name:var(--font-mono)]", children: [
                    yearModels.length,
                    " model",
                    yearModels.length !== 1 ? "s" : ""
                  ] }) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 h-px bg-gradient-to-r from-neutral-200 dark:from-white/10 to-transparent" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "ml-2", children: yearModels.map((model, index) => {
                const globalIndex = yearStartIndex + index;
                const isFocused = focusedIndex === globalIndex;
                const isSelected = selectedModelNames?.has(model.name) ?? false;
                return /* @__PURE__ */ jsx(
                  "div",
                  {
                    onClick: () => {
                      if (comparisonMode) {
                        onToggleSelection?.(model);
                      } else {
                        onFocusChange?.(globalIndex);
                      }
                    },
                    className: `transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2 ${isFocused && !comparisonMode ? "ring-2 ring-neutral-400 dark:ring-neutral-500 ring-offset-2" : ""}`,
                    role: "option",
                    "aria-selected": isFocused,
                    tabIndex: isFocused ? 0 : -1,
                    "aria-label": `${model.name} by ${model.org}`,
                    children: /* @__PURE__ */ jsx(
                      ModelCard,
                      {
                        model,
                        isLast: index === yearModels.length - 1,
                        lite: liteMode,
                        isSelectable: comparisonMode,
                        isSelected,
                        onSelectionChange: () => {
                          onToggleSelection?.(model);
                        }
                      }
                    )
                  },
                  `${model.org}-${model.date}-${model.name}-${index}`
                );
              }) })
            ]
          },
          year
        );
      })
    }
  );
}
function VirtualOrgTimeline({
  modelsByOrg,
  liteMode
}) {
  const parentRef = useRef(null);
  const [scrollMargin, setScrollMargin] = useState(200);
  useEffect(() => {
    if (parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setScrollMargin(rect.top + scrollTop);
    }
  }, []);
  const sortedOrgs = Array.from(modelsByOrg.keys());
  const virtualItems = useMemo(() => {
    const items = [];
    sortedOrgs.forEach((org) => {
      const orgModels = modelsByOrg.get(org) || [];
      items.push({
        type: "group",
        key: `group-${org}`,
        org,
        modelCount: orgModels.length
      });
      orgModels.forEach((model) => {
        items.push({
          type: "model",
          key: `${model.org}-${model.date}-${model.name}`,
          model
        });
      });
    });
    return items;
  }, [sortedOrgs, modelsByOrg]);
  if (virtualItems.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-8 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-neutral-500 dark:text-neutral-400", children: "No models found matching your filters." }) });
  }
  const rowVirtualizer = useWindowVirtualizer({
    count: virtualItems.length,
    scrollMargin,
    // Offset from top of page
    estimateSize: (index) => {
      const item = virtualItems[index];
      if (item.type === "group") return 100;
      return liteMode ? 100 : 180;
    },
    overscan: 5
  });
  return /* @__PURE__ */ jsx("div", { className: "rounded-lg", children: /* @__PURE__ */ jsx(
    "div",
    {
      ref: parentRef,
      style: {
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: "relative",
        width: "100%"
      },
      children: rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const item = virtualItems[virtualRow.index];
        const isGroup = item.type === "group";
        if (isGroup) {
          const groupItem = item;
          return /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                padding: "0 1rem"
              },
              children: /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-4 overflow-hidden", children: [
                /* @__PURE__ */ jsx("div", { className: "shrink-0 overflow-hidden", children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "select-none text-3xl font-bold leading-none block font-[family-name:var(--font-mono)] whitespace-nowrap text-neutral-200 dark:text-neutral-700",
                    "aria-hidden": "true",
                    children: groupItem.org
                  }
                ) }),
                /* @__PURE__ */ jsx("div", { className: "h-px flex-1 min-w-0 shrink bg-gradient-to-r from-neutral-200 dark:from-white/10 to-transparent" }),
                /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
                  /* @__PURE__ */ jsx(OrgAvatar, { org: groupItem.org, size: "sm" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium truncate max-w-[12rem] text-neutral-900 dark:text-neutral-100", children: groupItem.org }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs uppercase tracking-widest font-[family-name:var(--font-mono)] text-neutral-500 dark:text-neutral-400", children: [
                    groupItem.modelCount,
                    " model",
                    groupItem.modelCount !== 1 ? "s" : ""
                  ] })
                ] })
              ] })
            },
            virtualRow.key
          );
        }
        const modelItem = item;
        return /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
              paddingLeft: "1rem",
              paddingRight: "1rem"
            },
            children: /* @__PURE__ */ jsx(
              ModelCard,
              {
                model: modelItem.model,
                lite: liteMode,
                isLast: false
              }
            )
          },
          virtualRow.key
        );
      })
    }
  ) });
}
function VirtualTimeline({
  modelsByYear,
  liteMode,
  comparisonMode,
  selectedModelNames,
  onToggleSelection
}) {
  const parentRef = useRef(null);
  const [scrollMargin, setScrollMargin] = useState(200);
  useEffect(() => {
    if (parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setScrollMargin(rect.top + scrollTop);
    }
  }, [modelsByYear]);
  const sortedYears = useMemo(
    () => Array.from(modelsByYear.keys()).sort((a, b) => b - a),
    [modelsByYear]
  );
  const virtualItems = useMemo(() => {
    const items = [];
    sortedYears.forEach((year) => {
      const yearModels = modelsByYear.get(year) || [];
      items.push({
        type: "group",
        key: `group-${year}`,
        year,
        groupIndex: items.length,
        modelCount: yearModels.length
      });
      yearModels.forEach((model) => {
        items.push({
          type: "model",
          key: `${model.org}-${model.date}-${model.name}`,
          model
        });
      });
    });
    return items;
  }, [sortedYears, modelsByYear]);
  if (virtualItems.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-8 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-neutral-500 dark:text-neutral-400", children: "No models found matching your filters." }) });
  }
  const rowVirtualizer = useWindowVirtualizer({
    count: virtualItems.length,
    scrollMargin,
    // Offset from top of page
    estimateSize: (index) => {
      const item = virtualItems[index];
      if (item.type === "group") return 80;
      return liteMode ? 100 : 180;
    },
    overscan: 5
  });
  return /* @__PURE__ */ jsx("div", { className: "rounded-lg", children: /* @__PURE__ */ jsx(
    "div",
    {
      ref: parentRef,
      style: {
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: "relative",
        width: "100%"
      },
      children: rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const item = virtualItems[virtualRow.index];
        const isGroup = item.type === "group";
        if (isGroup) {
          const groupItem = item;
          return /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                padding: "0 1rem"
              },
              children: /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-4", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "select-none text-6xl sm:text-7xl font-bold leading-none text-neutral-200 dark:text-neutral-700 font-[family-name:var(--font-display)]",
                      "aria-hidden": "true",
                      children: groupItem.year
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-[family-name:var(--font-mono)]", children: [
                    groupItem.modelCount,
                    " model",
                    groupItem.modelCount !== 1 ? "s" : ""
                  ] }) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 h-px bg-gradient-to-r from-neutral-200 dark:from-white/10 to-transparent" })
              ] })
            },
            virtualRow.key
          );
        }
        const modelItem = item;
        const isSelected = selectedModelNames?.has(modelItem.model.name) ?? false;
        return /* @__PURE__ */ jsx(
          "div",
          {
            onClick: () => {
              if (comparisonMode) {
                onToggleSelection?.(modelItem.model);
              }
            },
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
              paddingLeft: "1rem",
              paddingRight: "1rem"
            },
            children: /* @__PURE__ */ jsx(
              ModelCard,
              {
                model: modelItem.model,
                lite: liteMode,
                isLast: false,
                isSelectable: comparisonMode,
                isSelected,
                onSelectionChange: () => {
                  onToggleSelection?.(modelItem.model);
                }
              }
            )
          },
          virtualRow.key
        );
      })
    }
  ) });
}
function StaticView({
  models: allModels,
  stats,
  sourceStats,
  view,
  license = "all",
  year,
  org,
  liteMode: initialLiteMode = false
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [licenseFilter, setLicenseFilter] = useState(license);
  const [orgFilter, setOrgFilter] = useState("");
  const [liteMode, setLiteMode] = useState(initialLiteMode);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const updateFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const initialSearch = params.get("search") || "";
      const initialOrg = params.get("org") || "";
      const isLite = params.get("lite") === "true";
      setSearchQuery(initialSearch);
      setOrgFilter(initialOrg);
      setLiteMode(isLite);
      if (!year && !org) {
        const compareParam = params.get("compare");
        if (compareParam) {
          const slugs = compareParam.split(",").filter(Boolean).slice(0, 3);
          const found = [];
          for (const slug of slugs) {
            const model = allModels.find(
              (m) => m.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
            );
            if (model && !found.find((f) => f.name === model.name)) {
              found.push(model);
            }
          }
          setSelectedModels(found);
        }
      }
    };
    updateFromUrl();
    window.addEventListener("popstate", updateFromUrl);
    return () => window.removeEventListener("popstate", updateFromUrl);
  }, [year, org, allModels]);
  const filteredModels = useMemo(() => {
    const filters = {
      ...DEFAULT_FILTERS,
      search: searchQuery,
      license: licenseFilter,
      org: orgFilter
    };
    return filterModels(allModels, filters);
  }, [allModels, searchQuery, licenseFilter, orgFilter]);
  const modelsByYear = useMemo(
    () => groupByYear(filteredModels),
    [filteredModels]
  );
  const modelsByOrg = useMemo(
    () => groupByOrg(filteredModels),
    [filteredModels]
  );
  const selectedModelNames = useMemo(
    () => new Set(selectedModels.map((m) => m.name)),
    [selectedModels]
  );
  const handleToggleSelection = (model) => {
    const isSelected = selectedModelNames.has(model.name);
    if (isSelected) {
      setSelectedModels(selectedModels.filter((m) => m.name !== model.name));
    } else if (selectedModels.length < 3) {
      setSelectedModels([...selectedModels, model]);
    }
  };
  const removeModel = (modelName) => {
    setSelectedModels(selectedModels.filter((m) => m.name !== modelName));
  };
  useEffect(() => {
    if (year || org || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (selectedModels.length > 0) {
      params.set(
        "compare",
        selectedModels.map((m) => m.name.toLowerCase().replace(/\s+/g, "-")).join(",")
      );
    } else {
      params.delete("compare");
    }
    const newUrl = params.toString() ? `/?${params}` : "/";
    window.history.replaceState({}, "", newUrl);
  }, [selectedModels, year, org]);
  const { showBadges, showHelp, setShowHelp, shortcutOrgs } = useKeyboardShortcuts({
    organizations,
    onFilterByOrg: setOrgFilter,
    onClearFilters: () => {
      setOrgFilter("");
      setSearchQuery("");
      setLicenseFilter("all");
    }
  });
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.key === "c" && selectedModels.length >= 2) {
        e.preventDefault();
        setIsModalOpen(true);
      }
      if (e.key === "Escape" && isModalOpen) {
        e.preventDefault();
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModels.length, isModalOpen]);
  const canCompare = selectedModels.length >= 2;
  const enableComparisonToggle = !year && !org;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      StatsCards,
      {
        models: stats.models,
        organizations: stats.organizations,
        activeView: view,
        sourceStats
      }
    ),
    /* @__PURE__ */ jsx(
      FilterInfo,
      {
        resultCount: filteredModels.length,
        view,
        license: licenseFilter,
        year,
        org: orgFilter || org || "",
        liteMode,
        models: allModels,
        searchQuery,
        onSearchChange: setSearchQuery,
        onLicenseChange: setLicenseFilter,
        comparisonMode,
        onToggleComparisonMode: enableComparisonToggle ? () => setComparisonMode(!comparisonMode) : void 0
      }
    ),
    view === "models" && showBadges && !comparisonMode && /* @__PURE__ */ jsx("div", { className: "mb-4 flex flex-wrap gap-2", children: shortcutOrgs.map((shortcutOrg, index) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOrgFilter(shortcutOrg.name),
        className: `relative rounded-md border border-neutral-200 dark:border-white/10 px-3 py-1.5 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${orgFilter === shortcutOrg.name ? "bg-neutral-100 dark:bg-white/10" : "bg-white dark:bg-[#111]"}`,
        children: [
          /* @__PURE__ */ jsx("span", { className: "mr-2 font-mono text-xs opacity-60", children: index + 1 }),
          shortcutOrg.name
        ]
      },
      shortcutOrg.id
    )) }),
    /* @__PURE__ */ jsx("div", { children: view === "organizations" ? filteredModels.length > 500 ? /* @__PURE__ */ jsx(VirtualOrgTimeline, { modelsByOrg, liteMode }) : /* @__PURE__ */ jsx(OrgTimeline, { modelsByOrg, liteMode }) : filteredModels.length > 500 ? /* @__PURE__ */ jsx(
      VirtualTimeline,
      {
        modelsByYear,
        liteMode,
        comparisonMode,
        selectedModelNames,
        onToggleSelection: handleToggleSelection
      }
    ) : /* @__PURE__ */ jsx(
      Timeline,
      {
        modelsByYear,
        liteMode,
        comparisonMode,
        selectedModelNames,
        onToggleSelection: handleToggleSelection
      }
    ) }),
    /* @__PURE__ */ jsx(
      KeyboardHelpTooltip,
      {
        isOpen: showHelp,
        onClose: () => setShowHelp(false),
        shortcutOrgs
      }
    ),
    /* @__PURE__ */ jsx(KeyboardHelpButton, { onClick: () => setShowHelp(true) }),
    enableComparisonToggle && /* @__PURE__ */ jsxs(Fragment, { children: [
      selectedModels.length > 0 && /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 dark:border-white/10 bg-[#fbf7f0] dark:bg-[#1f1f1f] p-4 animate-in slide-in-from-bottom", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-4xl", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-1 flex-wrap gap-2", children: selectedModels.map((model) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] px-3 py-2",
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-neutral-900 dark:text-neutral-100", children: model.name }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => removeModel(model.name),
                  className: "rounded p-0.5 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700",
                  "aria-label": `Remove ${model.name} from comparison`,
                  children: "×"
                }
              )
            ]
          },
          model.name
        )) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setIsModalOpen(true),
            disabled: !canCompare,
            className: `flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${canCompare ? "bg-neutral-600 dark:bg-neutral-400 text-white" : "bg-white dark:bg-[#111] text-neutral-500 dark:text-neutral-400"}`,
            children: [
              "Compare (",
              selectedModels.length,
              ")"
            ]
          }
        )
      ] }) }) }),
      isModalOpen && canCompare && /* @__PURE__ */ jsx(
        "div",
        {
          className: "fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in",
          style: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          onClick: () => setIsModalOpen(false),
          children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl border border-neutral-200 dark:border-white/10 bg-[#fbf7f0] dark:bg-[#1f1f1f]",
              onClick: (e) => e.stopPropagation(),
              children: /* @__PURE__ */ jsx(
                ComparisonModalContent,
                {
                  models: selectedModels,
                  onClose: () => setIsModalOpen(false)
                }
              )
            }
          )
        }
      )
    ] })
  ] });
}
function ComparisonModalContent({
  models: models2,
  onClose
}) {
  const sortedModels = [...models2].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const maxParams = Math.max(
    ...sortedModels.map((m) => parseParamValue(m.params) || 0),
    1
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-10 border-b border-neutral-200 dark:border-white/10 p-6 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-neutral-900 dark:text-neutral-100", children: "Model Comparison" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: [
          sortedModels.length,
          " model",
          sortedModels.length > 1 ? "s" : "",
          " ",
          "selected"
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "aria-label": "Close comparison",
          children: "×"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-neutral-200 dark:border-white/10", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-neutral-200 dark:border-white/10", children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold w-32 text-neutral-900 dark:text-neutral-100", children: "Metric" }),
          sortedModels.map((model) => /* @__PURE__ */ jsx(
            "th",
            {
              className: "px-4 py-3 text-left font-semibold text-neutral-900 dark:text-neutral-100",
              children: model.name
            },
            model.name
          ))
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-neutral-200 dark:border-white/10", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400", children: "Organization" }),
            sortedModels.map((model) => /* @__PURE__ */ jsx(
              "td",
              {
                className: "px-4 py-3 text-neutral-900 dark:text-neutral-100",
                children: model.org
              },
              model.name
            ))
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-neutral-200 dark:border-white/10", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400", children: "Release Date" }),
            sortedModels.map((model) => /* @__PURE__ */ jsx(
              "td",
              {
                className: "px-4 py-3 text-neutral-900 dark:text-neutral-100",
                children: formatDate(model.date)
              },
              model.name
            ))
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-neutral-200 dark:border-white/10", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400", children: "Parameters" }),
            sortedModels.map((model) => /* @__PURE__ */ jsx(
              "td",
              {
                className: "px-4 py-3 text-neutral-900 dark:text-neutral-100",
                children: model.params || "Unknown"
              },
              model.name
            ))
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-neutral-200 dark:border-white/10", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400", children: "License" }),
            sortedModels.map((model) => /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
              "span",
              {
                className: `rounded border px-2 py-1 text-xs font-medium uppercase tracking-wide ${getLicenseColor(model.license)}`,
                children: model.license
              }
            ) }, model.name))
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400", children: "Type" }),
            sortedModels.map((model) => /* @__PURE__ */ jsx(
              "td",
              {
                className: "px-4 py-3 capitalize text-neutral-900 dark:text-neutral-100",
                children: model.type
              },
              model.name
            ))
          ] })
        ] })
      ] }) }),
      sortedModels.some((m) => m.params) && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100", children: "Parameter Count Comparison" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: sortedModels.map((model) => {
          const paramValue = parseParamValue(model.params);
          if (!paramValue) return null;
          const percentage = paramValue / maxParams * 100;
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-1 flex justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-neutral-900 dark:text-neutral-100", children: model.name }),
              /* @__PURE__ */ jsx("span", { className: "text-neutral-500 dark:text-neutral-400", children: model.params })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "relative h-8 overflow-hidden rounded-md bg-neutral-200 dark:bg-white/10 opacity-30", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full rounded-md transition-all duration-500",
                style: {
                  width: `${percentage}%`,
                  backgroundColor: getLicenseBarColor(model.license)
                }
              }
            ) })
          ] }, model.name);
        }) })
      ] })
    ] })
  ] });
}
export {
  StaticView as S
};
