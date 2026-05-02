import { AuthButtons } from "@duyet/components/header/AuthButtons";
import Icons from "@duyet/components/Icons";
import { Link } from "@tanstack/react-router";
import { Download, Lock, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { lastSynced } from "@/lib/data";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function PageLayout({ children, description }: PageLayoutProps) {
  return (
    <main className="relative z-10 rounded-b-3xl bg-[#f8f8f2] text-[#1a1a1a] dark:bg-[#0d0e0c] dark:text-[#f8f8f2] 2xl:rounded-b-[4rem]">
      <div className="mx-auto max-w-[1360px] overflow-hidden px-5 pb-16 pt-8 sm:px-8 lg:px-10">
        <header className="mb-8 pt-8 lg:pt-12">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div className="animate-fade-in">
              <div className="mb-5 inline-flex animate-fade-in items-center gap-2 rounded-md bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-white">
                <span className="flex h-2 w-2 rounded-full bg-[#ff6a00]" />
                <span>Interactive LLM Release History</span>
              </div>

              <Link
                to="/"
                className="group inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                <h1 className="max-w-5xl text-balance font-[family-name:var(--font-sans)] text-5xl font-semibold tracking-tight text-[#1a1a1a] transition-opacity group-hover:opacity-80 dark:text-[#f8f8f2] sm:text-6xl lg:text-7xl">
                  LLM Timeline
                </h1>
              </Link>
              {description && (
                <p className="mt-6 max-w-3xl animate-fade-in animate-fade-in-delay-1 text-pretty text-lg leading-8 text-[#4d4d4d] dark:text-[#cfcfc8]">
                  {description}
                </p>
              )}
            </div>
            <div className="flex animate-fade-in animate-fade-in-delay-2 flex-wrap items-center gap-2 lg:justify-end">
              <ThemeToggle />
              <Button variant="icon" size="icon" asChild>
                <Link
                  to="/compare"
                  search={{ models: "" }}
                  aria-label="Compare models"
                >
                  <Scale className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="icon" size="icon" asChild>
                <a
                  href="https://github.com/duyet/monorepo"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Icons.Github className="h-4 w-4" />
                </a>
              </Button>
              <AuthButtons
                className="rounded-lg p-2.5"
                signInClassName="rounded-lg border border-border bg-card p-2.5 transition-all hover:bg-accent"
                signedInContent={
                  <Button variant="icon" size="icon" asChild>
                    <a
                      href="/data.json"
                      download="llm-timeline-data.json"
                      title="Download all model data as JSON"
                      aria-label="Download data"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                }
                signedOutContent={
                  <Button
                    variant="icon"
                    size="icon"
                    disabled
                    title="Sign in to download data"
                    aria-label="Download requires sign in"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </header>

        <div className="animate-fade-in animate-fade-in-delay-3 space-y-8">
          {children}
        </div>

        <footer className="mt-16 border-t border-black/10 pt-8 pb-8 dark:border-white/15">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Built by{" "}
              <a
                href="https://duyet.net"
                className="font-medium text-foreground underline decoration-border underline-offset-2 transition-all hover:decoration-foreground/40"
              >
                duyet
              </a>
            </p>
            <p className="font-[family-name:var(--font-mono)] text-xs">
              Updated {lastSynced}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground/70">
            <span className="text-muted-foreground/50">Data sources:</span>
            {[
              ["https://huggingface.co/models", "Hugging Face"],
              ["https://paperswithcode.com", "PapersWithCode"],
              [
                "https://en.wikipedia.org/wiki/Large_language_model",
                "Wikipedia",
              ],
              ["https://github.com", "GitHub"],
              ["https://epoch.ai/data", "Epoch AI"],
            ].map(([href, label]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-border underline-offset-2 transition-colors hover:text-muted-foreground"
              >
                {label}
              </a>
            ))}
            <span className="text-muted-foreground/50">
              Official announcements
            </span>
            <a
              href="/llms.txt"
              className="underline decoration-border underline-offset-2 transition-colors hover:text-muted-foreground"
            >
              llms.txt
            </a>
            <a
              href="/rss.xml"
              className="underline decoration-border underline-offset-2 transition-colors hover:text-muted-foreground"
            >
              RSS
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
