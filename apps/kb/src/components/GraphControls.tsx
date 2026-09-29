/**
 * The collapsible "customize" section of the graph controls overlay: kind
 * chips, orphans-only, the four force sliders, and the camera reset.
 *
 * All state lives in the viewer; this only renders it and reports intent.
 */

import type { ReactElement } from "react";
import type { ForceSettings } from "./graph-build";
import { baseKind, KIND_LABEL, memoryTypeOfKey } from "./graph-kinds";
import { type GraphTheme, kindSwatch } from "./graph-theme";

interface GraphControlsProps {
  open: boolean;
  theme: GraphTheme;
  kinds: string[];
  hiddenKinds: Set<string>;
  onToggleKind: (kind: string) => void;
  orphansOnly: boolean;
  onToggleOrphans: () => void;
  forces: ForceSettings;
  onForceChange: (patch: Partial<ForceSettings>) => void;
  onResetCamera: () => void;
}

export function GraphControls({
  open,
  theme,
  kinds,
  hiddenKinds,
  onToggleKind,
  orphansOnly,
  onToggleOrphans,
  forces,
  onForceChange,
  onResetCamera,
}: GraphControlsProps): ReactElement | null {
  if (!open) return null;

  return (
    <>
      <div className="flex flex-wrap gap-1">
        {kinds.map((k) => {
          const on = !hiddenKinds.has(k);
          const swatch = kindSwatch(k, theme);
          const memoryType = memoryTypeOfKey(k);
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => onToggleKind(k)}
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-opacity"
              style={{
                borderColor: on ? swatch : "#3f3f46",
                color: on ? "#fafafa" : "#71717a",
                background: on ? `${swatch}33` : "#18181bcc",
                opacity: on ? 1 : 0.55,
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: swatch }}
              />
              {KIND_LABEL[baseKind(k)]}
              {memoryType !== undefined ? `: ${memoryType}` : ""}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={orphansOnly}
          onClick={onToggleOrphans}
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-opacity"
          style={{
            borderColor: orphansOnly ? "#f87171" : "#3f3f46",
            color: orphansOnly ? "#fafafa" : "#71717a",
            background: orphansOnly ? "#f8717133" : "#18181bcc",
          }}
        >
          orphans only
        </button>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-zinc-800 pt-2">
        <ForceSlider
          label="Center force"
          value={forces.gravity}
          min={0.1}
          max={5}
          step={0.1}
          onChange={(v) => onForceChange({ gravity: v })}
        />
        <ForceSlider
          label="Repel force"
          value={forces.scalingRatio}
          min={1}
          max={40}
          step={1}
          onChange={(v) => onForceChange({ scalingRatio: v })}
        />
        <ForceSlider
          label="Link force"
          value={forces.edgeWeightInfluence}
          min={0}
          max={3}
          step={0.1}
          onChange={(v) => onForceChange({ edgeWeightInfluence: v })}
        />
        <ForceSlider
          label="Link distance"
          value={forces.linkDistance}
          min={0.2}
          max={5}
          step={0.1}
          onChange={(v) => onForceChange({ linkDistance: v })}
        />
      </div>

      <button
        type="button"
        onClick={onResetCamera}
        className="h-8 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-300 hover:bg-zinc-800"
      >
        Reset view
      </button>
    </>
  );
}

interface ForceSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function ForceSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: ForceSliderProps): ReactElement {
  return (
    <label className="flex items-center gap-2 text-[11px] text-zinc-400">
      <span className="w-24 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 accent-zinc-400"
      />
      <span className="w-8 shrink-0 text-right tabular-nums">
        {value.toFixed(1)}
      </span>
    </label>
  );
}
