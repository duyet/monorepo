import type { JSX } from "react";

interface TextTabsProps<K extends string> {
  /** Accessible name for the group. */
  label: string;
  options: readonly { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
}

/** Plain-text switch: the active option is solid, the rest are muted. */
export function TextTabs<K extends string>({
  label,
  options,
  value,
  onChange,
}: TextTabsProps<K>): JSX.Element {
  return (
    <div className="burns-tabs" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          type="button"
          key={o.key}
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
