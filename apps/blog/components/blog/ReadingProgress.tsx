"use client";

import { useEffect, useState } from "react";

/**
 * ReadingProgress - Fixed progress bar at top of viewport
 * Shows scroll progress (0-100%) based on reading position
 * Only visible when scrolling and progress > 0
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

      setProgress(Math.min(100, Math.max(0, scrollPercent)));
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    // Initial update
    updateProgress();

    // Use passive event listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-50 bg-gray-200/50 dark:bg-gray-800/50"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-blue-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default ReadingProgress;
