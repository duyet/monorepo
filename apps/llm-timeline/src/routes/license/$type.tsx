import { ogHeadLinks, ogMeta } from "@duyet/config/og";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageLayout } from "@/components/page-layout";
import { TimelinePage } from "@/components/timeline-page";
import {
  isLicenseType,
  LICENSE_DESCRIPTIONS,
  LICENSE_LABELS,
  ogImageUrl,
} from "@/lib/og";

export const Route = createFileRoute("/license/$type")({
  beforeLoad: ({ params }) => {
    if (!isLicenseType(params.type)) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    if (!isLicenseType(params.type)) return {};
    const type = params.type;
    const canonicalUrl = `https://llm-timeline.duyet.net/license/${type}`;
    const title = `${LICENSE_LABELS[type]} Models | LLM Timeline`;
    const description = LICENSE_DESCRIPTIONS[type];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...ogMeta({
          url: canonicalUrl,
          title,
          description,
          image: ogImageUrl("license", type),
        }),
      ],
      links: ogHeadLinks({ url: canonicalUrl }),
    };
  },
  component: LicensePage,
});

function LicensePage() {
  const { type } = Route.useParams();
  const licenseType = type as keyof typeof LICENSE_DESCRIPTIONS;

  return (
    <PageLayout description={LICENSE_DESCRIPTIONS[licenseType]}>
      <TimelinePage view="models" license={licenseType} />
    </PageLayout>
  );
}
