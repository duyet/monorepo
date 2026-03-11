"use client";

import { cn } from "@duyet/libs/utils";
import {
  Camera,
  CircleDot,
  Maximize2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { Photo } from "@/lib/photo-provider";

export interface EXIFFilterState {
  camera: string;
  lens: string;
  focalLength: [number, number];
  iso: [number, number];
  aperture: [number, number];
}

const DEFAULT_FILTERS: EXIFFilterState = {
  camera: "",
  lens: "",
  focalLength: [0, 500],
  iso: [0, 12800],
  aperture: [0, 22],
};

interface EXIFFiltersProps {
  photos: Photo[];
  onFilterChange: (filteredPhotos: Photo[]) => void;
  className?: string;
}

/**
 * EXIFFilters: Client-side EXIF metadata filtering component
 * Provides camera, lens, focal length, ISO, and aperture filters
 */
export default function EXIFFilters({
  photos,
  onFilterChange,
  className,
}: EXIFFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<EXIFFilterState>(DEFAULT_FILTERS);

  // Extract unique values from photos for select dropdowns
  const filterOptions = useMemo(() => {
    const cameras = new Set<string>();
    const lenses = new Set<string>();
    const focalLengths = new Set<number>();
    const isos = new Set<number>();
    const apertures = new Set<number>();

    photos.forEach((photo) => {
      const { exif } = photo;
      if (!exif) return;

      // Extract camera (make + model)
      if (exif.make || exif.model || exif.name) {
        const camera = exif.name || [exif.make, exif.model].filter(Boolean).join(" ");
        if (camera) cameras.add(camera);
      }

      // Note: Unsplash API doesn't provide lens model, but Cloudinary might
      // This is prepared for future data

      // Extract focal length as number
      if (exif.focal_length) {
        const fl = Number.parseFloat(exif.focal_length.toString());
        if (!Number.isNaN(fl)) focalLengths.add(fl);
      }

      // Extract ISO
      if (exif.iso) {
        isos.add(exif.iso);
      }

      // Extract aperture as number (remove "f/" prefix if present)
      if (exif.aperture) {
        const aptStr = exif.aperture.toString().replace(/^f\//, "");
        const apt = Number.parseFloat(aptStr);
        if (!Number.isNaN(apt)) apertures.add(apt);
      }
    });

    // Calculate min/max for ranges
    const focalLengthValues = Array.from(focalLengths).sort((a, b) => a - b);
    const isoValues = Array.from(isos).sort((a, b) => a - b);
    const apertureValues = Array.from(apertures).sort((a, b) => a - b);

    return {
      cameras: Array.from(cameras).sort(),
      lenses: Array.from(lenses).sort(),
      focalLength: {
        min: focalLengthValues[0] || 0,
        max: focalLengthValues[focalLengthValues.length - 1] || 500,
        values: focalLengthValues,
      },
      iso: {
        min: isoValues[0] || 0,
        max: isoValues[isoValues.length - 1] || 12800,
        values: isoValues,
      },
      aperture: {
        min: apertureValues[0] || 0,
        max: apertureValues[apertureValues.length - 1] || 22,
        values: apertureValues,
      },
    };
  }, [photos]);

  // Apply filters to photos
  const applyFilters = useCallback(
    (newFilters: EXIFFilterState) => {
      const filtered = photos.filter((photo) => {
        const { exif } = photo;
        if (!exif) return false;

        // Camera filter
        if (newFilters.camera) {
          const camera = exif.name || [exif.make, exif.model].filter(Boolean).join(" ");
          if (!camera || !camera.toLowerCase().includes(newFilters.camera.toLowerCase())) {
            return false;
          }
        }

        // Lens filter (not available in current data, but prepared)
        if (newFilters.lens) {
          // No lens data in current Photo type, would need extension
          return false;
        }

        // Focal length filter
        const focalLength = exif.focal_length
          ? Number.parseFloat(exif.focal_length.toString())
          : null;
        if (
          focalLength !== null &&
          !Number.isNaN(focalLength) &&
          (focalLength < newFilters.focalLength[0] ||
            focalLength > newFilters.focalLength[1])
        ) {
          return false;
        }

        // ISO filter
        if (
          exif.iso !== null &&
          exif.iso !== undefined &&
          (exif.iso < newFilters.iso[0] || exif.iso > newFilters.iso[1])
        ) {
          return false;
        }

        // Aperture filter
        const aperture = exif.aperture
          ? Number.parseFloat(exif.aperture.toString().replace(/^f\//, ""))
          : null;
        if (
          aperture !== null &&
          !Number.isNaN(aperture) &&
          (aperture < newFilters.aperture[0] || aperture > newFilters.aperture[1])
        ) {
          return false;
        }

        return true;
      });

      onFilterChange(filtered);
    },
    [photos, onFilterChange]
  );

  // Handle filter changes
  const updateFilter = useCallback(
    (key: keyof EXIFFilterState, value: EXIFFilterState[keyof EXIFFilterState]) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      applyFilters(newFilters);
    },
    [filters, applyFilters]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(photos);
  }, [onFilterChange, photos]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.camera !== "" ||
      filters.lens !== "" ||
      filters.focalLength[0] !== filterOptions.focalLength.min ||
      filters.focalLength[1] !== filterOptions.focalLength.max ||
      filters.iso[0] !== filterOptions.iso.min ||
      filters.iso[1] !== filterOptions.iso.max ||
      filters.aperture[0] !== filterOptions.aperture.min ||
      filters.aperture[1] !== filterOptions.aperture.max
    );
  }, [filters, filterOptions]);

  return (
    <div className={cn("w-full", className)}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "mb-6 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
          "bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 hover:shadow dark:bg-slate-800 dark:text-neutral-300 dark:hover:bg-slate-700",
          isExpanded && "border-terracotta bg-terracotta/5 dark:border-terracotta-light dark:bg-terracotta/10"
        )}
        aria-expanded={isExpanded}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filter by EXIF Metadata</span>
        {hasActiveFilters && (
          <span className="ml-2 rounded-full bg-terracotta px-2 py-0.5 text-xs text-white dark:bg-terracotta-medium">
            Active
          </span>
        )}
        {isExpanded ? (
          <X className="ml-auto h-4 w-4" />
        ) : (
          <Camera className="ml-auto h-4 w-4 opacity-50" />
        )}
      </button>

      {/* Expandable Filter Panel */}
      {isExpanded && (
        <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-slate-800">
          {/* Header with reset */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              EXIF Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-sm text-terracotta hover:text-terracotta-medium dark:text-terracotta-light dark:hover:text-terracotta"
              >
                Reset all
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Camera Filter */}
            {filterOptions.cameras.length > 0 && (
              <div className="space-y-2">
                <label
                  htmlFor="camera-filter"
                  className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <Camera className="h-4 w-4" />
                  Camera
                </label>
                <select
                  id="camera-filter"
                  value={filters.camera}
                  onChange={(e) => updateFilter("camera", e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors hover:border-neutral-400 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 dark:border-neutral-600 dark:bg-slate-700 dark:text-neutral-100 dark:hover:border-neutral-500 dark:focus:border-terracotta-light"
                >
                  <option value="">All cameras</option>
                  {filterOptions.cameras.map((camera) => (
                    <option key={camera} value={camera}>
                      {camera}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Lens Filter (placeholder - not available in current data) */}
            <div className="space-y-2 opacity-50">
              <label
                htmlFor="lens-filter"
                className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                <CircleDot className="h-4 w-4" />
                Lens
              </label>
              <select
                id="lens-filter"
                disabled
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-400 dark:border-neutral-600 dark:bg-slate-700 dark:text-neutral-500"
              >
                <option>Not available</option>
              </select>
            </div>

            {/* Focal Length Range */}
            <div className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                Focal Length: {filters.focalLength[0]}–{filters.focalLength[1]}mm
              </span>
              <div className="flex items-center gap-2">
                <input
                  id="focal-length-min"
                  type="number"
                  min={filterOptions.focalLength.min}
                  max={filterOptions.focalLength.max}
                  value={filters.focalLength[0]}
                  onChange={(e) =>
                    updateFilter("focalLength", [
                      Number.parseInt(e.target.value, 10) || filterOptions.focalLength.min,
                      filters.focalLength[1],
                    ])
                  }
                  aria-label="Minimum focal length in millimeters"
                  className="w-20 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-center text-sm text-neutral-900 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 dark:border-neutral-600 dark:bg-slate-700 dark:text-neutral-100 dark:focus:border-terracotta-light"
                />
                <span className="text-neutral-400 dark:text-neutral-600">–</span>
                <input
                  id="focal-length-max"
                  type="number"
                  min={filterOptions.focalLength.min}
                  max={filterOptions.focalLength.max}
                  value={filters.focalLength[1]}
                  onChange={(e) =>
                    updateFilter("focalLength", [
                      filters.focalLength[0],
                      Number.parseInt(e.target.value, 10) || filterOptions.focalLength.max,
                    ])
                  }
                  aria-label="Maximum focal length in millimeters"
                  className="w-20 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-center text-sm text-neutral-900 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 dark:border-neutral-600 dark:bg-slate-700 dark:text-neutral-100 dark:focus:border-terracotta-light"
                />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">mm</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Range: {filterOptions.focalLength.min}–{filterOptions.focalLength.max}mm
              </p>
            </div>

            {/* ISO Range */}
            <div className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                ISO: {filters.iso[0]}–{filters.iso[1]}
              </span>
              <div className="flex items-center gap-2">
                <input
                  id="iso-min"
                  type="number"
                  min={filterOptions.iso.min}
                  max={filterOptions.iso.max}
                  value={filters.iso[0]}
                  onChange={(e) =>
                    updateFilter("iso", [
                      Number.parseInt(e.target.value, 10) || filterOptions.iso.min,
                      filters.iso[1],
                    ])
                  }
                  aria-label="Minimum ISO value"
                  className="w-20 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-center text-sm text-neutral-900 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 dark:border-neutral-600 dark:bg-slate-700 dark:text-neutral-100 dark:focus:border-terracotta-light"
                />
                <span className="text-neutral-400 dark:text-neutral-600">–</span>
                <input
                  id="iso-max"
                  type="number"
                  min={filterOptions.iso.min}
                  max={filterOptions.iso.max}
                  value={filters.iso[1]}
                  onChange={(e) =>
                    updateFilter("iso", [
                      filters.iso[0],
                      Number.parseInt(e.target.value, 10) || filterOptions.iso.max,
                    ])
                  }
                  aria-label="Maximum ISO value"
                  className="w-20 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-center text-sm text-neutral-900 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 dark:border-neutral-600 dark:bg-slate-700 dark:text-neutral-100 dark:focus:border-terracotta-light"
                />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Range: {filterOptions.iso.min}–{filterOptions.iso.max}
              </p>
            </div>

            {/* Aperture Range */}
            <div className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Iris: f/{filters.aperture[0]}–f/{filters.aperture[1]}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">f/</span>
                <input
                  id="aperture-min"
                  type="number"
                  min={filterOptions.aperture.min}
                  max={filterOptions.aperture.max}
                  step="0.1"
                  value={filters.aperture[0]}
                  onChange={(e) =>
                    updateFilter("aperture", [
                      Number.parseFloat(e.target.value) || filterOptions.aperture.min,
                      filters.aperture[1],
                    ])
                  }
                  aria-label="Minimum aperture f-stop value"
                  className="w-20 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-center text-sm text-neutral-900 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 dark:border-neutral-600 dark:bg-slate-700 dark:text-neutral-100 dark:focus:border-terracotta-light"
                />
                <span className="text-neutral-400 dark:text-neutral-600">–</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">f/</span>
                <input
                  id="aperture-max"
                  type="number"
                  min={filterOptions.aperture.min}
                  max={filterOptions.aperture.max}
                  step="0.1"
                  value={filters.aperture[1]}
                  onChange={(e) =>
                    updateFilter("aperture", [
                      filters.aperture[0],
                      Number.parseFloat(e.target.value) || filterOptions.aperture.max,
                    ])
                  }
                  aria-label="Maximum aperture f-stop value"
                  className="w-20 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-center text-sm text-neutral-900 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 dark:border-neutral-600 dark:bg-slate-700 dark:text-neutral-100 dark:focus:border-terracotta-light"
                />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Range: f/{filterOptions.aperture.min}–f/{filterOptions.aperture.max}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper component to show filter count
 */
export function FilterCount({
  filtered,
  total,
}: {
  filtered: number;
  total: number;
}) {
  if (filtered === total) return null;

  return (
    <div className="mb-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
      Showing <span className="font-semibold text-terracotta dark:text-terracotta-light">{filtered}</span> of{" "}
      <span className="font-medium">{total}</span> photos
    </div>
  );
}
