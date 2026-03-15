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
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 overflow-hidden">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="animate-fade-in">
              <Link
                href="/"
                className="group inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2 rounded"
              >
                <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight transition-opacity group-hover:opacity-80 font-[family-name:var(--font-display)]">
                  LLM Timeline
                </h1>
              </Link>
              {description && (
                <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400 max-w-xl animate-fade-in animate-fade-in-delay-1">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 animate-fade-in animate-fade-in-delay-2">
              <ThemeToggle />
              <Link
                href="/compare"
                className="rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 text-neutral-600 dark:text-neutral-400 dark:border-white/10 dark:bg-white/5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm"
                aria-label="Compare models"
              >
                <Scale className="h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/duyet/monorepo"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 text-neutral-600 dark:text-neutral-400 dark:border-white/10 dark:bg-white/5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm"
                aria-label="GitHub"
              >
                <Icons.Github className="h-4 w-4" />
              </Link>
              <AuthButtons
                className="rounded-lg p-2.5"
                signInClassName="rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm"
                signedInContent={
                  <Link
                    href="/data.json"
                    download="llm-timeline-data.json"
                    className="rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 text-neutral-600 dark:text-neutral-400 dark:border-white/10 dark:bg-white/5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm"
                    title="Download all model data as JSON"
                    aria-label="Download data"
                  >
                    <Download className="h-4 w-4" />
                  </Link>
                }
                signedOutContent={
                  <button
                    disabled
                    className="rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 text-neutral-600 dark:text-neutral-400 dark:border-white/10 dark:bg-white/5 opacity-50 cursor-not-allowed"
                    title="Sign in to download data"
                    aria-label="Download requires sign in"
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                }
              />
            </div>
          </div>
        </header>

        {/* Gradient separator */}
        <div className="mb-8 h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-white/10 to-transparent animate-fade-in animate-fade-in-delay-2" />

        {/* Content */}
        <div className="animate-fade-in animate-fade-in-delay-3">
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-neutral-200 dark:border-white/10 pt-8 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-500 dark:text-neutral-400">
            <p>
              Built by{" "}
              <Link
                href="https://duyet.net"
                className="font-medium text-neutral-900 dark:text-neutral-100 underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 transition-colors hover:text-neutral-700 dark:hover:text-white"
              >
                duyet
              </Link>
            </p>
            <p className="font-[family-name:var(--font-mono)] text-xs">
              Updated {lastSynced}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
            <Link
              href="https://lifearchitect.ai/models-table"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              LifeArchitect.AI
            </Link>
            <span>·</span>
            <a
              href="https://epoch.ai/data"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              Epoch AI
            </a>
            <span>·</span>
            <Link
              href="/llms.txt"
              className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              llms.txt
            </Link>
            <span>·</span>
            <Link
              href="/rss.xml"
              className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              RSS
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
