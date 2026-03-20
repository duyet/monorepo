import { jsxs, jsx } from "react/jsx-runtime";
import { c as cn, d as getAllPosts, e as getAllCategories, g as getAllTags, C as Container } from "./router-BL7fPxbg.js";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { I as IsNewPost, a as IsFeatured } from "./PostBadges-DtIPJPGt.js";
import "fs";
import "remark-math";
import "react-dom";
import "lucide-react";
import "next-themes";
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const STORAGE_KEY = "blog-search-history";
const MAX_HISTORY = 10;
function useSearchHistory() {
  const [history, setHistory] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((h) => typeof h === "string")) {
          setHistory(parsed);
        }
      }
    } catch {
    } finally {
      setIsInitialized(true);
    }
  }, []);
  const add = (query) => {
    if (!query.trim()) return;
    setHistory((prev) => {
      const filtered = prev.filter((h) => h !== query);
      const newHistory = [query, ...filtered].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch {
      }
      return newHistory;
    });
  };
  const clear = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
  };
  return { history, add, clear, isInitialized };
}
function SearchBar({
  placeholder = "Search posts...",
  className,
  inputClassName
}) {
  const navigate = useNavigate({ from: "/search" });
  const search = useSearch({ from: "/search" });
  const [query, setQuery] = useState(search.q || "");
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);
  const { history, add, clear, isInitialized } = useSearchHistory();
  const updateSearchQuery = useCallback(
    (newQuery) => {
      navigate({
        search: (prev) => ({ ...prev, q: newQuery || void 0 }),
        replace: true
      });
    },
    [navigate]
  );
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    updateSearchQuery(value);
    if (value) {
      setShowHistory(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      add(query.trim());
      setShowHistory(false);
    }
  };
  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery);
    updateSearchQuery(historyQuery);
    setShowHistory(false);
    inputRef.current?.focus();
  };
  const handleFocus = () => {
    if (!query && history.length > 0) {
      setShowHistory(true);
    }
  };
  const handleBlur = (e) => {
    setTimeout(() => {
      if (!inputRef.current?.contains(e.relatedTarget) && !e.relatedTarget?.closest("[data-search-history]")) {
        setShowHistory(false);
      }
    }, 100);
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "/" || e.key === "s") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    if (!showHistory) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowHistory(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showHistory]);
  return /* @__PURE__ */ jsxs("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: inputRef,
          id: "search-input",
          type: "text",
          value: query,
          onChange: handleChange,
          onFocus: handleFocus,
          onBlur: handleBlur,
          placeholder,
          className: cn(
            "w-full px-4 py-3 text-lg",
            "border border-neutral-300 dark:border-neutral-700",
            "bg-white dark:bg-neutral-900",
            "text-neutral-900 dark:text-neutral-100",
            "placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
            "rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-neutral-500",
            "transition-all",
            inputClassName
          ),
          autoComplete: "off"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400", children: /* @__PURE__ */ jsx("kbd", { className: "hidden rounded border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 sm:inline-block", children: "/" }) })
    ] }),
    showHistory && isInitialized && history.length > 0 && !query && /* @__PURE__ */ jsxs(
      "div",
      {
        "data-search-history": true,
        className: "absolute z-10 mt-2 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4 py-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-neutral-500 dark:text-neutral-400", children: "Recent searches" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: clear,
                className: "text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors",
                children: "Clear"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "max-h-64 overflow-y-auto", children: history.map((historyQuery) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleHistoryClick(historyQuery),
              className: "w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsx(
                  "svg",
                  {
                    className: "w-4 h-4 text-neutral-400 shrink-0",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "truncate", children: historyQuery })
              ]
            }
          ) }, historyQuery)) })
        ]
      }
    )
  ] });
}
function getDateRangeOptions() {
  const now = /* @__PURE__ */ new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return [
    { value: "all", label: "All time" },
    {
      value: "7days",
      label: "Last 7 days",
      fromDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1e3),
      toDate: today
    },
    {
      value: "30days",
      label: "Last 30 days",
      fromDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1e3),
      toDate: today
    },
    {
      value: "90days",
      label: "Last 90 days",
      fromDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1e3),
      toDate: today
    },
    {
      value: "1year",
      label: "Last year",
      fromDate: new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate()
      ),
      toDate: today
    },
    { value: "custom", label: "Custom range" }
  ];
}
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function SearchFilters({
  categories,
  tags,
  className
}) {
  const navigate = useNavigate({ from: "/search" });
  const search = useSearch({ from: "/search" });
  const currentCategory = search.category || "";
  const currentTags = (search.tags || "").split(",").filter(Boolean);
  const currentFromDate = search.from || "";
  const currentToDate = search.to || "";
  const [isCustomDateRange, setIsCustomDateRange] = useState(
    Boolean(currentFromDate && currentToDate)
  );
  const [customFromDate, setCustomFromDate] = useState(currentFromDate);
  const [customToDate, setCustomToDate] = useState(currentToDate);
  const dateRangeOptions = useMemo(() => getDateRangeOptions(), []);
  const sortedCategories = useMemo(
    () => Object.entries(categories).sort(([a], [b]) => a.localeCompare(b)),
    [categories]
  );
  const sortedTags = useMemo(
    () => Object.entries(tags).sort(([nameA, a], [nameB, b]) => {
      if (a !== b) return b - a;
      return nameA.localeCompare(nameB);
    }),
    [tags]
  );
  const updateFilters = useCallback(
    (updates) => {
      navigate({
        search: (prev) => {
          const next = { ...prev };
          if (updates.category !== void 0) {
            next.category = updates.category || void 0;
          }
          if (updates.tags !== void 0) {
            next.tags = updates.tags.length > 0 ? updates.tags.join(",") : void 0;
          }
          if (updates.preset !== void 0) {
            if (updates.preset === "all") {
              next.from = void 0;
              next.to = void 0;
            } else if (updates.preset !== "custom") {
              const option = dateRangeOptions.find(
                (opt) => opt.value === updates.preset
              );
              if (option?.fromDate && option?.toDate) {
                next.from = formatDateForInput(option.fromDate);
                next.to = formatDateForInput(option.toDate);
              }
            }
          }
          if (updates.from !== void 0) {
            next.from = updates.from || void 0;
          }
          if (updates.to !== void 0) {
            next.to = updates.to || void 0;
          }
          return next;
        },
        replace: true
      });
    },
    [navigate, dateRangeOptions]
  );
  const handleCategoryChange = useCallback(
    (category) => {
      updateFilters({ category: category === currentCategory ? "" : category });
    },
    [currentCategory, updateFilters]
  );
  const handleTagToggle = useCallback(
    (tag) => {
      const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
      updateFilters({ tags: newTags });
    },
    [currentTags, updateFilters]
  );
  const handleDatePresetChange = useCallback(
    (preset) => {
      if (preset === "custom") {
        setIsCustomDateRange(true);
      } else {
        setIsCustomDateRange(false);
        updateFilters({ preset });
      }
    },
    [updateFilters]
  );
  const handleCustomDateChange = useCallback(
    (field, value) => {
      if (field === "from") {
        setCustomFromDate(value);
      } else {
        setCustomToDate(value);
      }
      updateFilters({
        preset: "custom",
        from: field === "from" ? value : customFromDate,
        to: field === "to" ? value : customToDate
      });
    },
    [customFromDate, customToDate, updateFilters]
  );
  const activePreset = (() => {
    if (!currentFromDate && !currentToDate) return "all";
    return isCustomDateRange ? "custom" : "all";
  })();
  const datePresetButtons = useMemo(
    () => dateRangeOptions.filter((opt) => opt.value !== "custom").map((option) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => handleDatePresetChange(option.value),
        className: cn(
          "px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
          activePreset === option.value || !activePreset && option.value === "all" ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        ),
        children: option.label
      },
      option.value
    )),
    [activePreset, handleDatePresetChange, dateRangeOptions]
  );
  const clearAllFilters = useCallback(() => {
    navigate({
      search: (prev) => ({ q: prev.q }),
      replace: true
    });
    setIsCustomDateRange(false);
    setCustomFromDate("");
    setCustomToDate("");
  }, [navigate]);
  const hasActiveFilters = currentCategory || currentTags.length > 0 || currentFromDate || currentToDate;
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-6", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-neutral-900 dark:text-neutral-100", children: "Filters" }),
      hasActiveFilters && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: clearAllFilters,
          className: "text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
          children: "Clear all"
        }
      )
    ] }),
    hasActiveFilters && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
      currentCategory && /* @__PURE__ */ jsx(
        ActiveFilterBadge,
        {
          label: `Category: ${currentCategory}`,
          onRemove: () => handleCategoryChange(currentCategory)
        }
      ),
      currentTags.map((tag) => /* @__PURE__ */ jsx(
        ActiveFilterBadge,
        {
          label: `Tag: ${tag}`,
          onRemove: () => handleTagToggle(tag)
        },
        tag
      )),
      (currentFromDate || currentToDate) && /* @__PURE__ */ jsx(
        ActiveFilterBadge,
        {
          label: `Date: ${currentFromDate || "..."} - ${currentToDate || "..."}`,
          onRemove: () => updateFilters({ preset: "all" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx(FilterSection, { title: "Category", children: /* @__PURE__ */ jsxs(
      "select",
      {
        value: currentCategory,
        onChange: (e) => handleCategoryChange(e.target.value),
        className: "w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500",
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All categories" }),
          sortedCategories.map(([category, count]) => /* @__PURE__ */ jsxs("option", { value: category, children: [
            category,
            " (",
            count,
            ")"
          ] }, category))
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(FilterSection, { title: "Tags", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => updateFilters({ tags: [] }),
          className: cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            currentTags.length === 0 ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          ),
          children: "All tags"
        }
      ),
      sortedTags.slice(0, 20).map(([tag, count]) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => handleTagToggle(tag),
          className: cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            currentTags.includes(tag) ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          ),
          title: `${count} posts`,
          children: [
            tag,
            /* @__PURE__ */ jsxs("span", { className: "ml-1 text-xs opacity-70", children: [
              "(",
              count,
              ")"
            ] })
          ]
        },
        tag
      ))
    ] }) }),
    /* @__PURE__ */ jsx(FilterSection, { title: "Date Range", children: !isCustomDateRange ? /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: [
      datePresetButtons,
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => handleDatePresetChange("custom"),
          className: cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
            "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          ),
          children: "Custom range"
        }
      )
    ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "from-date",
              className: "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1",
              children: "From"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "from-date",
              type: "date",
              value: customFromDate,
              onChange: (e) => handleCustomDateChange("from", e.target.value),
              className: "w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "to-date",
              className: "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1",
              children: "To"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "to-date",
              type: "date",
              value: customToDate,
              onChange: (e) => handleCustomDateChange("to", e.target.value),
              className: "w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setIsCustomDateRange(false);
            updateFilters({ preset: "all" });
          },
          className: "text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
          children: "Back to presets"
        }
      )
    ] }) })
  ] });
}
function FilterSection({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: title }),
    children
  ] });
}
const CloseIcon = () => /* @__PURE__ */ jsx(
  "svg",
  {
    className: "w-3 h-3",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M6 18L18 6M6 6l12 12"
      }
    )
  }
);
function ActiveFilterBadge({
  label,
  onRemove
}) {
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md text-sm", children: [
    label,
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: onRemove,
        className: "hover:text-neutral-900 dark:hover:text-neutral-100",
        "aria-label": `Remove ${label} filter`,
        children: /* @__PURE__ */ jsx(CloseIcon, {})
      }
    )
  ] });
}
function SearchResultItem({
  post,
  highlight,
  className
}) {
  const highlightRegex = useMemo(() => {
    if (!highlight) return null;
    return new RegExp(`(${escapeRegExp(highlight)})`, "i");
  }, [highlight]);
  const highlightText = (text) => {
    if (!highlightRegex) return text;
    const parts = text.split(highlightRegex);
    return parts.map((part, i) => {
      return highlightRegex.test(part) ? /* @__PURE__ */ jsx(
        "mark",
        {
          className: "rounded bg-yellow-200 px-0.5 text-neutral-900 dark:bg-yellow-800 dark:text-neutral-100",
          children: part
        },
        i
      ) : part;
    });
  };
  return /* @__PURE__ */ jsxs(
    "article",
    {
      className: cn("group flex flex-row items-center gap-4 py-2", className),
      children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            className: "text-base text-neutral-800 transition-colors hover:text-neutral-900 hover:underline hover:underline-offset-4 dark:text-neutral-200 dark:hover:text-neutral-100",
            href: post.slug,
            children: [
              highlightText(post.title),
              /* @__PURE__ */ jsx(IsNewPost, { date: post.date }),
              /* @__PURE__ */ jsx(IsFeatured, { featured: post.featured })
            ]
          }
        ),
        /* @__PURE__ */ jsx("hr", { className: "shrink grow border-dotted border-neutral-300 dark:border-neutral-700" }),
        /* @__PURE__ */ jsx("time", { className: "flex-shrink-0 whitespace-nowrap text-sm text-neutral-500", children: post.date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        }) })
      ]
    }
  );
}
const DEFAULT_INITIAL_POST_COUNT = 20;
function SearchClient({ posts, categories, tags }) {
  const search = useSearch({ from: "/search" });
  const query = search.q || "";
  const categoryFilter = search.category || "";
  const tagsFilter = useMemo(() => {
    return (search.tags || "").split(",").filter(Boolean);
  }, [search.tags]);
  const fromDate = search.from || "";
  const toDate = search.to || "";
  const searchTerms = useMemo(() => {
    return query.toLowerCase().split(/\s+/).filter(Boolean);
  }, [query]);
  const fromDateObj = useMemo(() => {
    if (!fromDate) return null;
    const date = new Date(fromDate);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }, [fromDate]);
  const toDateObj = useMemo(() => {
    if (!toDate) return null;
    const date = new Date(toDate);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    );
  }, [toDate]);
  const hasFilters = query || categoryFilter || tagsFilter.length > 0 || fromDate || toDate;
  const filteredPosts = useMemo(() => {
    if (!query && !categoryFilter && tagsFilter.length === 0 && !fromDate && !toDate) {
      return posts.slice(0, DEFAULT_INITIAL_POST_COUNT);
    }
    return posts.filter((post) => {
      if (query) {
        const searchText = [
          post.title,
          post.category,
          ...post.tags || [],
          post.excerpt || ""
        ].join(" ").toLowerCase();
        if (!searchTerms.every((term) => searchText.includes(term))) {
          return false;
        }
      }
      if (categoryFilter && post.category !== categoryFilter) {
        return false;
      }
      if (tagsFilter.length > 0 && !tagsFilter.every((tag) => post.tags.includes(tag))) {
        return false;
      }
      if (fromDateObj && post.date < fromDateObj) {
        return false;
      }
      if (toDateObj && post.date > toDateObj) {
        return false;
      }
      return true;
    });
  }, [
    posts,
    searchTerms,
    query,
    categoryFilter,
    tagsFilter,
    fromDateObj,
    toDateObj,
    fromDate,
    toDate
  ]);
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }, [filteredPosts]);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:gap-8", children: [
    /* @__PURE__ */ jsx("aside", { className: "lg:w-64 lg:flex-shrink-0", children: /* @__PURE__ */ jsx(SearchFilters, { categories, tags }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx(SearchBar, { placeholder: "Search by title, category, or tags..." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
        hasFilters && /* @__PURE__ */ jsxs("p", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: [
          "Found ",
          sortedPosts.length,
          " ",
          sortedPosts.length === 1 ? "result" : "results",
          query && ` for "${query}"`
        ] }),
        sortedPosts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-12 text-center text-neutral-500 dark:text-neutral-500", children: hasFilters ? "No posts found matching your filters. Try adjusting your search criteria." : "Start typing to search posts, or use the filters to browse." }) : /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: sortedPosts.map((post) => /* @__PURE__ */ jsx(
          SearchResultItem,
          {
            post,
            highlight: query
          },
          post.slug
        )) })
      ] })
    ] })
  ] });
}
function SearchPage() {
  const allPosts = getAllPosts(["slug", "title", "date", "category", "featured", "excerpt", "tags"], 1e4);
  const categories = getAllCategories();
  const tags = getAllTags();
  return /* @__PURE__ */ jsx(Container, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "mb-4 font-serif text-5xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-6xl md:mb-6 md:text-7xl", children: "Search" }),
      /* @__PURE__ */ jsxs("p", { className: "text-neutral-600 dark:text-neutral-400", children: [
        "Search through ",
        allPosts.length,
        " blog posts by title, category, tags, or date range."
      ] })
    ] }),
    /* @__PURE__ */ jsx(SearchClient, { posts: allPosts, categories, tags })
  ] }) });
}
export {
  SearchPage as component
};
