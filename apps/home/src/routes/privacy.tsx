import { Eyebrow, Reveal } from "@duyet/components";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

const EFFECTIVE_DATE = "2026-08-22";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy – duyet.net" },
      {
        name: "description",
        content:
          "How duyet.net handles data: aggregate privacy-respecting analytics via Cloudflare, no advertising and no sale of personal data, and how to request deletion.",
      },
    ],
    links: [{ rel: "canonical", href: "https://duyet.net/privacy" }],
  }),
});

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-9 border-t border-[var(--rd-border)] pt-7">
      <h2 className="text-[1.05rem] font-medium tracking-[-0.01em]">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-[14.5px] leading-[1.65] text-[var(--rd-text-2)]">
        {children}
      </div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <div className="page-enter bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="mx-auto max-w-[640px] px-[var(--rd-pad)] pt-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]">
        <Reveal>
          <Eyebrow>Legal · Effective {EFFECTIVE_DATE}</Eyebrow>
          <h1 className="rd-display mt-[13px] text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.04]">
            Privacy Policy
          </h1>
          <p className="rd-lead mt-6 max-w-[56ch]">
            This site is a personal homepage, and it is built to be read — by
            people and by machines — without collecting more than it needs.
            This page describes what data duyet.net handles, in plain terms.
          </p>
        </Reveal>

        <Section title="What this site collects">
          <p>
            This site uses aggregate, privacy-respecting analytics served
            through Cloudflare. The analytics are counted in aggregate — they
            show that visits happened, not who you are. No advertising runs on
            this site, no personal data is sold, and no cross-site tracking
            cookies are used to follow you around the web.
          </p>
        </Section>

        <Section title="Third-party services">
          <p>
            The site is hosted on Cloudflare (Pages and the CDN in front of
            it), which serves content and protects against abuse. Repository
            information shown on the site is fetched from GitHub's public API.
            These services see standard technical request data (such as IP
            address and user agent) as part of serving the site; their own
            policies govern what they do with it.
          </p>
        </Section>

        <Section title="Contact submissions">
          <p>
            Messages you send — through the contact form or through the MCP{" "}
            <code className="font-[var(--font-mono)] text-[12.5px]">
              send_message
            </code>{" "}
            tool — are stored so they can be read and answered. They are not
            used for marketing and are not shared with third parties.
          </p>
        </Section>

        <Section title="Questions & deletion requests">
          <p>
            If you have questions about this policy, or want a message you
            sent deleted, email{" "}
            <a href="mailto:me@duyet.net" className="rd-ulink">
              me@duyet.net
            </a>{" "}
            and I'll take care of it.
          </p>
          <p className="text-[13px] text-[var(--rd-text-3)]">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </Section>
      </div>
    </div>
  );
}
