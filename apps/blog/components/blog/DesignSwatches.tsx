"use client";

import { cn } from "@duyet/libs/utils";

export interface SwatchItem {
  name: string;
  value: string;
  description?: string;
}

interface DesignSwatchesProps {
  title?: string;
  swatches: SwatchItem[];
  variant?: "colors" | "spacing" | "tokens";
  className?: string;
}

/**
 * DesignSwatches - Visual display of design tokens
 * Inspired by HTML effectiveness pattern for design system documentation
 */
export function DesignSwatches({
  title,
  swatches,
  variant = "colors",
  className = "",
}: DesignSwatchesProps) {
  return (
    <div
      className={cn(
        "my-8 p-6 rounded-lg bg-[var(--surface-soft)] border border-[var(--hairline)]",
        className
      )}
    >
      {title && (
        <h4 className="mb-4 font-serif text-lg text-[var(--ink)] dark:text-[var(--on-dark)]">
          {title}
        </h4>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {swatches.map((swatch) => (
          <div
            key={swatch.name}
            className="group relative overflow-hidden rounded-lg bg-white dark:bg-[var(--surface-dark)] border border-[var(--hairline)] transition-shadow hover:shadow-md"
          >
            {variant === "colors" ? (
              <>
                <div
                  className="h-24 w-full transition-transform group-hover:scale-105"
                  style={{ backgroundColor: swatch.value }}
                />
                <div className="p-3">
                  <div className="font-mono text-sm font-medium text-[var(--ink)] dark:text-[var(--on-dark)]">
                    {swatch.name}
                  </div>
                  <div className="font-mono text-xs text-[var(--muted)] mt-0.5">
                    {swatch.value}
                  </div>
                  {swatch.description && (
                    <div className="text-xs text-[var(--body)] mt-2">
                      {swatch.description}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-4">
                <div className="font-mono text-sm font-medium text-[var(--ink)] dark:text-[var(--on-dark)]">
                  {swatch.name}
                </div>
                <div className="font-mono text-xs text-[var(--muted)] mt-0.5">
                  {swatch.value}
                </div>
                {swatch.description && (
                  <div className="text-xs text-[var(--body)] mt-2">
                    {swatch.description}
                  </div>
                )}
                {variant === "spacing" && (
                  <div className="mt-3 h-2 bg-[var(--primary)]/20 rounded" style={{ width: swatch.value }} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ColorPaletteProps {
  name: string;
  colors: { shade: string; value: string }[];
  className?: string;
}

/**
 * ColorPalette - Display a full color palette with shades
 */
export function ColorPalette({
  name,
  colors,
  className = "",
}: ColorPaletteProps) {
  return (
    <div
      className={cn(
        "my-8 p-6 rounded-lg bg-[var(--surface-soft)] border border-[var(--hairline)]",
        className
      )}
    >
      <h4 className="mb-4 font-serif text-lg text-[var(--ink)] dark:text-[var(--on-dark)]">
        {name}
      </h4>
      <div className="flex gap-1 rounded-lg overflow-hidden border border-[var(--hairline)]">
        {colors.map(({ shade, value }) => (
          <div
            key={shade}
            className="flex-1 h-20 relative group"
            style={{ backgroundColor: value }}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-end justify-center pb-2">
              <span className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 px-1.5 py-0.5 rounded text-white">
                {shade}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DesignSwatches;
