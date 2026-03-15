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
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <div className="mx-auto max-w-4xl px-4 py-8 overflow-hidden">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded">
                <h1
                  className="text-3xl font-bold hover:opacity-80 transition-opacity"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--text)",
                  }}
                >
                  LLM Timeline
                </h1>
              </Link>
              {description && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/compare"
                className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                style={{ color: "var(--text-muted)" }}
                aria-label="Compare models"
              >
                <Scale className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com/duyet/monorepo"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                style={{ color: "var(--text-muted)" }}
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
                    className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    style={{ color: "var(--text-muted)" }}
                    title="Download all model data as JSON"
                    aria-label="Download data"
                  >
                    <Download className="h-5 w-5" />
                  </Link>
                }
                signedOutContent={
                  <button
                    disabled
                    className="rounded-lg p-2 opacity-50 cursor-not-allowed"
                    style={{ color: "var(--text-muted)" }}
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
        <footer
          className="mt-12 border-t pt-8 text-center text-sm"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          <p>
            Built by{" "}
            <Link
              href="https://duyet.net"
              className="underline"
              style={{ color: "var(--text)" }}
            >
              duyet
            </Link>
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
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
            <span style={{ fontFamily: "var(--font-mono)" }}>{lastSynced}</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
