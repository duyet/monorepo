import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Github } from "@duyet/components/Icons";
import { Eyebrow, SecHead, Reveal } from "@duyet/components/redesign";
import { cvData } from "@/config/cv.data";

export const Route = createFileRoute("/")({
  component: Page,
});

function Page() {
  const { personal, experience, education, skills } = cvData;

  const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
  const period = (from: Date, to?: Date) => {
    const f = `${monthFmt.format(from)} ${from.getFullYear()}`;
    const t = to
      ? `${monthFmt.format(to)} ${to.getFullYear()}`
      : "Present";
    return `${f} - ${t}`;
  };

  const yearsExp = new Date().getFullYear() - 2015;

  return (
    <div
      style={{
        background: "var(--rd-bg)",
        color: "var(--rd-text)",
        paddingTop: "clamp(44px, 6vw, 72px)",
        paddingBottom: "clamp(56px, 8vw, 96px)",
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Eyebrow>Curriculum Vitae - cv.duyet.net</Eyebrow>
          <h1
            className="rd-display"
            style={{
              fontSize: "clamp(2.2rem, 4.6vw, 3.2rem)",
              marginTop: 16,
            }}
          >
            {personal.name}
          </h1>
          <p
            className="rd-mono"
            style={{
              color: "var(--rd-text-2)",
              marginTop: 10,
              fontSize: 14,
            }}
          >
            Data & AI Engineer - Vietnam
          </p>
        </div>
        <a
          className="rd-btn rd-btn-primary"
          href="/duyet.cv.pdf"
          target="_blank"
          rel="noreferrer"
        >
          <Download size={15} /> Download PDF
        </a>
      </div>

      {/* summary */}
      <p className="rd-lead" style={{ marginTop: 26, maxWidth: "62ch" }}>
        {personal.overview}
      </p>

      {/* facts strip */}
      <div className="rd-g4" style={{ marginTop: 30, gap: 10 }}>
        <FactCard label="Experience" value={`${yearsExp}+ years`} />
        <FactCard label="Current" value="Cartrack" />
        <FactCard label="Data Migrated" value="350TB+" />
        <FactCard label="Cost Optimized" value="$25K/mo saved" />
      </div>

      {/* experience */}
      <div style={{ marginTop: "clamp(44px, 5vw, 64px)" }}>
        <SecHead eyebrow="Experience" title="Where I've worked" />
        <div style={{ display: "grid", gap: 0 }}>
          {experience.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 60}>
              <div
                style={{
                  borderTop: "1px solid var(--rd-line)",
                  padding: "22px 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.3rem",
                      letterSpacing: "-0.03em",
                      fontWeight: 600,
                    }}
                  >
                    {exp.title}{" "}
                    <span
                      className="rd-muted"
                      style={{ fontWeight: 500 }}
                    >
                      -{" "}
                      {exp.companyUrl ? (
                        <a
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rd-ulink"
                        >
                          {exp.company}
                        </a>
                      ) : (
                        exp.company
                      )}
                    </span>
                  </h3>
                  <span
                    className="rd-mono rd-dim"
                    style={{ fontSize: 12.5 }}
                  >
                    {period(exp.from, exp.to)}
                  </span>
                </div>
                <ul
                  style={{
                    marginTop: 10,
                    marginLeft: 0,
                    paddingLeft: 18,
                    listStyle: "disc",
                    display: "grid",
                    gap: 5,
                  }}
                >
                  {exp.responsibilities.map((r) => (
                    <li
                      key={r.id}
                      style={{
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: "var(--rd-text-2)",
                      }}
                    >
                      {r.item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* skills */}
      <div style={{ marginTop: "clamp(44px, 5vw, 64px)" }}>
        <SecHead eyebrow="Toolkit" title="Skills" />
        <div className="rd-g2">
          {skills.map((cat) => (
            <div key={cat.id} className="rd-card rd-card-pad">
              <Eyebrow>{cat.name}</Eyebrow>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 7,
                  marginTop: 14,
                }}
              >
                {cat.skills.map((s) => (
                  <span key={s.id} className="rd-chip" style={{ fontSize: 12.5 }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* education */}
      <div
        className="rd-card rd-card-pad"
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Eyebrow>Education</Eyebrow>
          <div style={{ fontWeight: 600, fontSize: 17, marginTop: 8 }}>
            {education[0]?.university}
          </div>
          <div className="rd-muted" style={{ fontSize: 14, marginTop: 4 }}>
            {education[0]?.major}
            {education[0]?.thesis && (
              <>
                {" "}
                -{" "}
                <a
                  href={education[0].thesisUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rd-ulink"
                >
                  {education[0].thesis}
                </a>
              </>
            )}
          </div>
        </div>
        <a
          className="rd-btn rd-btn-ghost"
          href="https://github.com/duyet"
          target="_blank"
          rel="noreferrer"
        >
          <Github style={{ width: 15, height: 15 }} /> github.com/duyet
        </a>
      </div>

      {/* print footer */}
      <footer className="cv-print-footer hidden print:block" style={{ marginTop: 24 }}>
        <p style={{ fontSize: 8, color: "var(--rd-text-4)" }}>
          Live version at{" "}
          <a
            href="https://cv.duyet.net"
            className="rd-ulink"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://cv.duyet.net
          </a>
        </p>
      </footer>
    </div>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rd-card"
      style={{
        background: "var(--rd-bg-sub)",
        padding: "14px 16px",
      }}
    >
      <div className="rd-mono" style={{ fontSize: 10.5, color: "var(--rd-text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, marginTop: 7 }}>
        {value}
      </div>
    </div>
  );
}
