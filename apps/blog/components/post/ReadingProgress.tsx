"use client";

import { cn } from "@duyet/libs/utils";
import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      const scrollProgress = (scrollTop / scrollableHeight) * 100;
      setProgress(Math.min(Math.max(scrollProgress, 0), 100));
    };

    // Use requestAnimationFrame for smooth updates
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 h-1",
        "z-50",
        "bg-gray-200 dark:bg-gray-800"
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "h-full transition-all duration-150 ease-out",
          "bg-gradient-to-r from-blue-500 to-purple-600"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
