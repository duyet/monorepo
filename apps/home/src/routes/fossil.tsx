import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow } from "@duyet/components";

const PERIOD = "Nov 2018 — Aug 2023";
const TENURE = "4 yrs 10 mos";

const posts = [
  {
    title: "Fossil Data Platform Rewritten in Rust 🦀",
    href: "https://blog.duyet.net/2023/06/fossil-data-platform-written-rust",
  },
  {
    title: "Spark on Kubernetes tại Fossil 🤔",
    href: "https://blog.duyet.net/2022/03/spark-kubernetes-at-fossil",
  },
  {
    title: "Why ClickHouse Should Be the Go-To Choice for Your Data Platform",
    href: "https://blog.duyet.net/2023/01/clickhouse",
  },
];

const roles = [
  {
    title: "Senior Data Engineer",
    period: "Jan 2020 — Aug 2023",
    body: "Led the data team — five engineers and three analysts. Cut Data Platform costs by 55% and started rebuilding the next generation in Rust.",
  },
  {
    title: "Data Engineer",
    period: "Nov 2018 — Jan 2020",
    body: "Built core Data Platform components on Kubernetes, Airflow, and Spark, and proposed the Data Warehouse behind product insights.",
  },
];

export const Route = createFileRoute("/fossil")({
  component: FossilPage,
  head: () => ({
    meta: [
      { title: "Fossil Group, Inc. — Duyet's chapter | duyet.net" },
      {
        name: "description",
        content: `My ${TENURE} at Fossil Group, Inc. (${PERIOD}): from Data Engineer to leading the data team — cutting platform costs 55% and rebuilding it in Rust.`,
      },
    ],
    links: [{ rel: "canonical", href: "https://duyet.net/fossil" }],
  }),
});

function FossilPage() {
  return (
    <div className="page-enter bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="mx-auto max-w-[640px] px-[var(--rd-pad)] pt-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]">
        <Eyebrow>
          {PERIOD} · {TENURE}
        </Eyebrow>
        <h1 className="rd-display mt-[13px] text-[clamp(1.9rem,4vw,3rem)] leading-[1.04]">
          <span className="text-[var(--rd-accent)]">Fossil Group</span>
        </h1>
        <p className="rd-lead mt-5 text-[clamp(1.02rem,1.4vw,1.15rem)] text-[var(--rd-text-2)]">
          Nearly five years at Fossil Group, growing from Data Engineer to
          leading the data team. I built and ran the Data Platform — Kubernetes,
          Airflow, Spark, and ClickHouse — cut its running costs by more than
          half, and started rebuilding the next generation in Rust. A good
          place, a good team, and the chapter where I learned to scale data for
          real.
        </p>

        <div className="mt-9 flex flex-col gap-5 border-t border-[var(--rd-border)] pt-7">
          {roles.map((r) => (
            <div key={r.title}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h2 className="text-[1.1rem] tracking-[-0.02em]">{r.title}</h2>
                <span className="font-[var(--font-mono)] text-[12px] text-[var(--rd-text-3)]">
                  {r.period}
                </span>
              </div>
              <p className="mt-1.5 text-[14.5px] leading-[1.55] text-[var(--rd-text-2)]">
                {r.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-9 border-t border-[var(--rd-border)] pt-7">
          <Eyebrow>Related writing</Eyebrow>
          <ul className="mt-3 flex flex-col gap-2">
            {posts.map((p) => (
              <li key={p.href}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rd-ulink text-[14.5px] text-[var(--rd-text-2)]"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
