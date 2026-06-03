import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow } from "@duyet/components";
import { addUtmParams } from "../../app/lib/utm";

const PERIOD = "Nov 2018 — Aug 2023";
const TENURE = "4 yrs 10 mos";

interface Post {
  title: string;
  href: string;
}

interface Role {
  title: string;
  period: string;
  body: string;
}

interface Milestone {
  label: string;
  body: string;
}

const posts: Post[] = [
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

const roles: Role[] = [
  {
    title: "Senior Data Engineer",
    period: "Jan 2020 — Aug 2023",
    body: "Data leader for a team of eight — five engineers and three analysts. Owned the platform end to end, drove the re-platforming for scale and cost, and cut Data Platform expenses by 55%.",
  },
  {
    title: "Data Engineer",
    period: "Nov 2018 — Jan 2020",
    body: "Built and ran the core data platform on AWS, and proposed the data warehouse that became the foundation for product insights.",
  },
];

// The technical story, oldest first.
const journey: Milestone[] = [
  {
    label: "Collection on AWS",
    body: "Node.js collectors streaming through Kinesis into S3, Lambda transforming data between zones, and serving queries from Athena and Redshift.",
  },
  {
    label: "Streaming & storage upgrades",
    body: "Moved ingestion from Kinesis Firehose to Kafka, and retuned data types for far better compression — real storage and cost savings.",
  },
  {
    label: "Compute on Kubernetes",
    body: "Migrated the batch workers onto EKS, processing at scale with Spark.",
  },
  {
    label: "Rewritten in Rust",
    body: "Re-built the platform end to end in Rust for another massive cost cut — faster, leaner, and cheaper to run.",
  },
  {
    label: "Redshift → ClickHouse",
    body: "Swapped the warehouse to ClickHouse on Kubernetes for fast serving, with Next.js dashboards on top.",
  },
  {
    label: "A second platform on GCP",
    body: "Stood up a parallel data platform on GCP to meet specific requirements.",
  },
  {
    label: "Leading the team",
    body: "Grew from engineer into leading the data team — hiring, mentoring, and setting the technical direction.",
  },
];

export const Route = createFileRoute("/fossil")({
  component: FossilPage,
  head: () => ({
    meta: [
      { title: "Fossil Group, Inc. — Duyet's chapter | duyet.net" },
      {
        name: "description",
        content: `My ${TENURE} at Fossil Group, Inc. (${PERIOD}): building the data platform from AWS collection to a Rust rewrite and ClickHouse, cutting costs 55%, and leading the team.`,
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
          leading the data team. I started on a Node.js data-collection platform
          on AWS — Kinesis into S3, Lambda transforms, Athena and Redshift — and
          spent the next few years making it faster, cheaper, and more reliable:
          Kafka and Spark on Kubernetes, a full rewrite in Rust, and a move to
          ClickHouse. Costs came down by more than half along the way. A good
          place, a good team, and the chapter where I learned to scale data —
          and to lead — for real.
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
          <Eyebrow>How the platform evolved</Eyebrow>
          <ol className="mt-4 flex flex-col gap-4">
            {journey.map((m, i) => (
              <li key={m.label} className="flex gap-3">
                <span className="font-[var(--font-mono)] text-[12px] text-[var(--rd-text-3)] pt-[3px] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[14.5px] font-medium tracking-[-0.01em]">
                    {m.label}
                  </h3>
                  <p className="mt-1 text-[14px] leading-[1.55] text-[var(--rd-text-2)]">
                    {m.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-9 border-t border-[var(--rd-border)] pt-7">
          <Eyebrow>Related writing</Eyebrow>
          <ul className="mt-3 flex flex-col gap-2">
            {posts.map((p) => (
              <li key={p.href}>
                <a
                  href={addUtmParams(p.href, "fossil_page", "related_writing")}
                  target="_blank"
                  rel="noopener noreferrer"
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
