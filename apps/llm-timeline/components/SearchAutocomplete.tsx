"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { models, organizations } from "@/lib/data";

interface Suggestion {
  type: "model" | "org";
  name: string;
  org?: string;
}

const MAX_SUGGESTIONS = 8;
const DEBOUNCE_MS = 150;

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
  inputStyle?: React.CSSProperties;
  placeholder?: string;
}

export function SearchAutocomplete({
  value,
  onChange,
  inputClassName,
  inputStyle,
  placeholder = "Search models, organizations...",
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  const filterSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const q = query.toLowerCase();
    const matches: Suggestion[] = [];

    // Add matching models (max 6)
    for (const model of models) {
      if (matches.length >= MAX_SUGGESTIONS) break;
      const modelName = model.name.toLowerCase();
      const orgName = model.org.toLowerCase();

      if (modelName.includes(q) || orgName.includes(q)) {
        matches.push({
          type: "model",
          name: model.name,
          org: model.org,
        });
      }
    }

    // Add matching organizations (remaining slots)
    if (matches.length < MAX_SUGGESTIONS) {
      for (const org of organizations) {
        if (matches.length >= MAX_SUGGESTIONS) break;
        const orgName = org.toLowerCase();

        // Only add org if not already matched via model search
        if (
          orgName.includes(q) &&
          !matches.some((m) => m.type === "org" && m.name === org)
        ) {
          matches.push({
            type: "org",
            name: org,
          });
        }
      }
    }

    // Prioritize model matches, then org matches
    matches.sort((a, b) => {
      if (a.type !== b.type) return a.type === "model" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    setSuggestions(matches.slice(0, MAX_SUGGESTIONS));
    setShowSuggestions(matches.length > 0);
    setSelectedIndex(-1);
  }, []);

  // Debounced filter
  useEffect(() => {
    const timeout = setTimeout(() => {
      filterSuggestions(value);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [value, filterSuggestions]);

  const handleSelect = (suggestion: Suggestion) => {
    const newValue =
      suggestion.type === "model"
        ? suggestion.name
        : suggestion.org || suggestion.name;
    onChange(newValue);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Highlight matching text in suggestion
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <strong
          key={i}
          className="font-semibold"
          style={{ color: "var(--accent)" }}
        >
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  const getSuggestionIcon = (suggestion: Suggestion) => {
    if (suggestion.type === "model") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--border)" }}
          />
          Model
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
        Organization
      </span>
    );
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (value && suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 ${inputClassName || ""}`}
        style={{
          ...inputStyle,
          // @ts-expect-error CSS custom properties
          "--tw-ring-color": "var(--accent)",
        }}
        autoComplete="off"
        role="combobox"
        aria-expanded={showSuggestions}
        aria-controls="search-suggestions"
        aria-autocomplete="list"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          className="absolute z-10 mt-1 w-full rounded-lg border bg-white dark:bg-neutral-900 shadow-lg max-h-64 overflow-y-auto"
          style={{ borderColor: "var(--border)" }}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.name}`}
              role="option"
              tabIndex={0}
              aria-selected={index === selectedIndex}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-2 cursor-pointer text-sm flex items-center justify-between gap-3 ${
                index === selectedIndex
                  ? "bg-neutral-100 dark:bg-neutral-800"
                  : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              } transition-colors`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getSuggestionIcon(suggestion)}
                <span className="truncate">
                  {highlightMatch(suggestion.name, value)}
                </span>
                {suggestion.org && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {suggestion.org}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Icon */}
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--text-muted)" }}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}
