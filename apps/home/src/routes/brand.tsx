import { Eyebrow, Reveal } from "@duyet/components";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

const ORIGIN = "https://duyet.net";

const VARIANTS: Array<{
  file: string;
  label: string;
  note: string;
  previewBg: "light" | "dark";
}> = [
  {
    file: "logo.svg",
    label: "Canonical",
    note: "White mark on a dark tile.",
    previewBg: "light",
  },
  {
    file: "logo-light.svg",
    label: "Light UI",
    note: "Black mark, transparent.",
    previewBg: "light",
  },
  {
    file: "logo-dark.svg",
    label: "Dark UI",
    note: "White mark, transparent.",
    previewBg: "dark",
  },
  {
    file: "logo-on-light.svg",
    label: "On light",
    note: "Tiled mark for light surfaces.",
    previewBg: "light",
  },
  {
    file: "logo-on-dark.svg",
    label: "On dark",
    note: "Tiled mark for dark surfaces.",
    previewBg: "dark",
  },
];

const ASSETS: Array<{ file: string; kind: "svg" | "png"; desc: string }> = [
  { file: "logo.svg", kind: "svg", desc: "Canonical square — white D on dark tile" },
  { file: "logo.png", kind: "png", desc: "Canonical PNG" },
  { file: "logo-64.png", kind: "png", desc: "Canonical 64×64" },
  { file: "logo-512.png", kind: "png", desc: "Canonical 512×512" },
  { file: "logo-light.svg", kind: "svg", desc: "Black mark, transparent" },
  { file: "logo-light-64.png", kind: "png", desc: "Light mark 64×64" },
  { file: "logo-light-512.png", kind: "png", desc: "Light mark 512×512" },
  { file: "logo-dark.svg", kind: "svg", desc: "White mark, transparent" },
  { file: "logo-dark-64.png", kind: "png", desc: "Dark mark 64×64" },
  { file: "logo-dark-512.png", kind: "png", desc: "Dark mark 512×512" },
  { file: "logo-on-light.svg", kind: "svg", desc: "Tiled on light" },
  { file: "logo-on-light-64.png", kind: "png", desc: "On light 64×64" },
  { file: "logo-on-light-512.png", kind: "png", desc: "On light 512×512" },
  { file: "logo-on-dark.svg", kind: "svg", desc: "Tiled on dark" },
  { file: "logo-on-dark-64.png", kind: "png", desc: "On dark 64×64" },
  { file: "logo-on-dark-512.png", kind: "png", desc: "On dark 512×512" },
];

function assetUrl(file: string): string {
  return `${ORIGIN}/brand/${file}`;
}

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
    <div className="page-enter bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="mx-auto max-w-[720px] px-[var(--rd-pad)] pt-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]">
        <Reveal>
          <Eyebrow>Brand</Eyebrow>
          <h1 className="rd-display mt-[13px] text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.04]">
            Logo
          </h1>
          <p className="rd-lead mt-6 max-w-[56ch]">
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
            {VARIANTS.map((variant) => (
              <figure
                key={variant.file}
                className="overflow-hidden rounded-lg border border-[var(--rd-border)]"
              >
                <div
                  className="flex aspect-square items-center justify-center p-6"
                  style={{
                    background:
                      variant.previewBg === "dark" ? "#111111" : "#f4f4f1",
                  }}
                >
                  <img
                    src={`/brand/${variant.file}`}
                    alt={variant.label}
                    className="h-16 w-16"
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
            {ASSETS.map((asset) => {
              const url = assetUrl(asset.file);
              return (
                <li
                  key={asset.file}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <a
                      href={url}
                      className="rd-ulink font-[var(--font-mono)] text-[12.5px] break-all"
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
