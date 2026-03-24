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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
        {/* Header */}
        <header className="mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="animate-fade-in">
              {/* Subtitle row with status dot */}
              <div className="mb-1.5 flex items-center gap-2 animate-fade-in">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-mono tracking-wide uppercase text-muted-foreground">
                  Interactive LLM Release History
                </span>
              </div>

              <Link
                to="/"
                className="group inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight transition-opacity group-hover:opacity-80 font-[family-name:var(--font-display)]">
                  LLM Timeline
                </h1>
              </Link>
              {description && (
                <p className="mt-2 text-sm text-muted-foreground max-w-xl animate-fade-in animate-fade-in-delay-1">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 animate-fade-in animate-fade-in-delay-2">
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
                signInClassName="rounded-lg border border-border bg-card p-2.5 transition-all hover:bg-accent hover:shadow-sm"
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

        {/* Gradient separator */}
        <div className="mb-5 h-px bg-gradient-to-r from-transparent via-border to-transparent animate-fade-in animate-fade-in-delay-2" />

        {/* Content */}
        <div className="animate-fade-in animate-fade-in-delay-3">
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8 pb-8">
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
    </div>
  );
}
