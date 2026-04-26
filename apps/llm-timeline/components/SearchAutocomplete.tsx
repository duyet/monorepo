import { cn } from "@duyet/libs/utils";
import { Search } from "lucide-react";
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
  placeholder?: string;
}

export function SearchAutocomplete({
  value,
  onChange,
  inputClassName,
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
      part.toLowerCase().includes(query.toLowerCase()) ? (
        <strong key={i} className="font-semibold text-foreground">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative">
      {/* Search Icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />

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
        className={cn(
          "flex h-10 w-full rounded-xl border border-border bg-card text-foreground",
          "pl-9 pr-4 text-sm ring-offset-background",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          inputClassName
        )}
        autoComplete="off"
        role="combobox"
        aria-expanded={showSuggestions}
        aria-controls="search-suggestions"
        aria-autocomplete="list"
        aria-activedescendant={
          selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
        }
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          className="absolute z-30 mt-1.5 w-full rounded-xl border border-border bg-card max-h-64 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.name}`}
              id={`suggestion-${index}`}
              role="option"
              tabIndex={0}
              aria-selected={index === selectedIndex}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "mx-1 my-0.5 px-3 py-2 rounded-lg cursor-pointer text-sm flex items-center justify-between gap-3 transition-colors",
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground shrink-0"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      suggestion.type === "model"
                        ? "bg-muted-foreground/40"
                        : "bg-muted-foreground"
                    )}
                  />
                  {suggestion.type === "model" ? "Model" : "Org"}
                </span>
                <span className="truncate text-foreground">
                  {highlightMatch(suggestion.name, value)}
                </span>
                {suggestion.org && (
                  <span className="text-muted-foreground text-xs">
                    · {suggestion.org}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
