import {
  DUYET_LOGO_ASSETS,
  DUYET_LOGO_VARIANTS,
  DuyetLogo,
  duyetLogoUrl,
  Eyebrow,
  Reveal,
} from "@duyet/components";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/brand")({
  component: BrandPage,
  head: () => ({
    meta: [
      { title: "Brand – duyet.net" },
      {
        name: "description",
        content:
          "duyet.net logo assets: SVG and PNG, light and dark marks, copyable URLs.",
      },
    ],
    links: [{ rel: "canonical", href: "https://duyet.net/brand" }],
  }),
});

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="shrink-0 rounded-md border border-[var(--rd-border)] px-2.5 py-1 font-[var(--font-mono)] text-[11.5px] text-[var(--rd-text-2)] hover:bg-[var(--rd-bg-2)]"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function BrandPage() {
  return (
    <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="mx-auto max-w-[720px] px-[var(--rd-pad)] pt-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]">
        <Reveal>
          <Eyebrow>Brand</Eyebrow>
          <h1 className="font-[family-name:var(--font-display)] font-normal tracking-[-0.025em] leading-[1.05] mt-[13px] text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.04]">
            Logo
          </h1>
          <p className="text-[1.05rem] leading-[1.65] text-[var(--rd-text-2)] mt-6 max-w-[56ch]">
            Chunky pixel D used on duyet.net. Prefer SVG. Use the dark mark on
            dark backgrounds and the light mark on light backgrounds. PNG is
            for places that cannot take SVG.
          </p>
        </Reveal>

        <section className="mt-10">
          <h2 className="text-[1.05rem] font-medium tracking-[-0.01em]">
            Variants
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DUYET_LOGO_VARIANTS.map((variant) => (
              <figure
                key={variant.tone}
                className="overflow-hidden rounded-lg border border-[var(--rd-border)]"
              >
                <div
                  className="flex aspect-square items-center justify-center p-6"
                  style={{
                    background:
                      variant.previewBg === "dark" ? "#111111" : "#f4f4f1",
                  }}
                >
                  <DuyetLogo
                    tone={variant.tone}
                    format="svg"
                    className="h-16 w-16"
                    imgClassName="h-16 w-16"
                    alt={variant.label}
                    width={64}
                    height={64}
                  />
                </div>
                <figcaption className="border-t border-[var(--rd-border)] px-3 py-2.5">
                  <div className="text-[13.5px] font-medium">{variant.label}</div>
                  <div className="mt-0.5 text-[12.5px] text-[var(--rd-text-3)]">
                    {variant.note}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[1.05rem] font-medium tracking-[-0.01em]">
            Assets
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-[var(--rd-border)] border-y border-[var(--rd-border)]">
            {DUYET_LOGO_ASSETS.map((asset) => {
              const url = duyetLogoUrl({
                tone: asset.tone,
                format: asset.format,
                pngSize: asset.pngSize,
              });
              return (
                <li
                  key={url}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <a
                      href={url}
                      className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)] font-[var(--font-mono)] text-[12.5px] break-all"
                    >
                      {url}
                    </a>
                    <div className="mt-0.5 text-[12.5px] text-[var(--rd-text-3)]">
                      {asset.desc}
                    </div>
                  </div>
                  <CopyButton url={url} />
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
