"use client";

import { AuthButtons } from "@duyet/components/header/AuthButtons";
import Icons from "@duyet/components/Icons";
import { Download, Lock, Scale } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { lastSynced } from "@/lib/data";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function PageLayout({ children, description }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#fbf7f0] dark:bg-[#1f1f1f]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2 rounded"
              >
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 hover:opacity-80 transition-opacity font-[family-name:var(--font-display)]">
                  LLM Timeline
                </h1>
              </Link>
              {description && (
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/compare"
                className="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Compare models"
              >
                <Scale className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com/duyet/monorepo"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="GitHub"
              >
                <Icons.Github className="h-5 w-5" />
              </Link>
              <AuthButtons
                className="rounded-lg p-2"
                signInClassName="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                signedInContent={
                  <Link
                    href="/data.json"
                    download="llm-timeline-data.json"
                    className="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Download all model data as JSON"
                    aria-label="Download data"
                  >
                    <Download className="h-5 w-5" />
                  </Link>
                }
                signedOutContent={
                  <button
                    disabled
                    className="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 opacity-50 cursor-not-allowed"
                    title="Sign in to download data"
                    aria-label="Download requires sign in"
                  >
                    <Lock className="h-5 w-5" />
                  </button>
                }
              />
            </div>
          </div>
        </header>

        {/* Content */}
        {children}

        {/* Footer */}
        <footer className="mt-12 border-t border-neutral-200 dark:border-white/10 pt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          <p>
            Built by{" "}
            <Link
              href="https://duyet.net"
              className="underline text-neutral-900 dark:text-neutral-100"
            >
              duyet
            </Link>
          </p>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Data from{" "}
            <Link
              href="https://lifearchitect.ai/models-table"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              LifeArchitect.AI Models Table
            </Link>{" "}
            ·{" "}
            <Link href="/llms.txt" className="underline hover:opacity-80">
              llms.txt
            </Link>{" "}
            · Last updated:{" "}
            <span className="font-[family-name:var(--font-mono)]">
              {lastSynced}
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}
