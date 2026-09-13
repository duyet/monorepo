import { cn } from "@duyet/libs/utils";
import type { LucideProps } from "lucide-react";
import {
  type DuyetLogoFormat,
  type DuyetLogoPngSize,
  type DuyetLogoTone,
  duyetLogoUrl,
} from "./duyet-logo";

export interface DuyetLogoProps {
  /** `auto` swaps light/dark with `prefers-color-scheme` / `.dark`. */
  tone?: DuyetLogoTone;
  format?: DuyetLogoFormat;
  pngSize?: DuyetLogoPngSize;
  className?: string;
  imgClassName?: string;
  alt?: string;
  width?: number;
  height?: number;
}

function src(
  tone: Exclude<DuyetLogoTone, "auto">,
  format: DuyetLogoFormat,
  pngSize: DuyetLogoPngSize
) {
  return duyetLogoUrl({ tone, format, pngSize });
}

function PixelD({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect x="10" y="10" width="14" height="44" />
      <rect x="24" y="10" width="14" height="14" />
      <rect x="24" y="40" width="14" height="14" />
      <rect x="38" y="24" width="14" height="16" />
    </svg>
  );
}

/** Theme-aware duyet.net mark. SVG by default; PNG when `format="png"`. */
export function DuyetLogo({
  tone = "auto",
  format = "svg",
  pngSize = 64,
  className,
  imgClassName,
  alt = "duyet.net",
  width,
  height,
}: DuyetLogoProps) {
  if (tone === "auto" && format === "svg") {
    return (
      <span
        className={cn("inline-flex text-[var(--rd-text,currentColor)]", className)}
      >
        <PixelD className={cn("h-full w-full", imgClassName)} title={alt} />
      </span>
    );
  }

  if (tone === "auto") {
    return (
      <img
        src={src("light", format, pngSize)}
        alt={alt}
        width={width}
        height={height}
        className={cn(className, imgClassName)}
      />
    );
  }

  return (
    <img
      src={src(tone, format, pngSize)}
      alt={alt}
      width={width}
      height={height}
      className={cn(className, imgClassName)}
    />
  );
}

/** Lucide-shaped wrapper for app switcher / nav icons. */
export function DuyetMark({ className }: LucideProps) {
  return (
    <DuyetLogo
      tone="auto"
      format="svg"
      className={cn("inline-flex h-4 w-4 shrink-0", className)}
      imgClassName="h-full w-full object-contain"
      alt=""
    />
  );
}
