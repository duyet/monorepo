import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageLayout } from "@/components/page-layout";
import { TimelinePage } from "@/components/timeline-page";

const LICENSES = ["open", "closed", "partial"] as const;
type LicenseType = (typeof LICENSES)[number];

const LICENSE_LABELS: Record<LicenseType, string> = {
  open: "Open License",
  closed: "Closed License",
  partial: "Partial License",
};

const LICENSE_DESCRIPTIONS: Record<LicenseType, string> = {
  open: "Models with openly available weights and code",
  closed: "Proprietary models with API-only access",
  partial: "Models with some restricted access or partial weights",
};

export const Route = createFileRoute("/license/$type")({
  beforeLoad: ({ params }) => {
    if (!LICENSES.includes(params.type as LicenseType)) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const type = params.type as LicenseType;
    if (!LICENSES.includes(type)) return {};
    const canonicalUrl = `https://llm-timeline.duyet.net/license/${type}`;
    return {
      meta: [
        { title: `${LICENSE_LABELS[type]} Models | LLM Timeline` },
        { name: "description", content: LICENSE_DESCRIPTIONS[type] },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:title", content: `${LICENSE_LABELS[type]} Models | LLM Timeline` },
        { property: "og:description", content: LICENSE_DESCRIPTIONS[type] },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
    };
  },
  component: LicensePage,
});

function LicensePage() {
  const { type } = Route.useParams();
  const licenseType = type as LicenseType;

  return (
    <PageLayout
      title={`${LICENSE_LABELS[licenseType]} Models`}
      description={LICENSE_DESCRIPTIONS[licenseType]}
    >
      <TimelinePage view="models" license={licenseType} />
    </PageLayout>
  );
}
