"use client";

export function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="rounded-lg bg-terracotta px-6 py-2 font-medium text-white transition-colors hover:bg-terracotta-medium"
    >
      Try Again
    </button>
  );
}
