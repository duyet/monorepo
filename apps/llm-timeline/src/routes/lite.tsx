import { ogMeta } from "@duyet/config/og";
import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/page-layout";
import { TimelinePage } from "@/components/timeline-page";
import { ogImageUrl, SITE_URL } from "@/lib/og";

const TITLE = "LLM Timeline (Lite Mode) | LLM Timeline";
const DESCRIPTION =
  "A streamlined, minimalist view of Large Language Model releases";

export const Route = createFileRoute("/lite")({
  head: () => {
    // This route only declared a title/description, so every OG tag came from
    // __root and the page unfurled as the homepage (`og:url` ".../").
    const canonicalUrl = `${SITE_URL}/lite`;
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        // No card is generated for /lite, so it keeps the site card. Passing
        // the image also keeps `twitter:card` at "summary_large_image" —
        // `ogMeta` without one emits "summary" and would override __root.
        ...ogMeta({
          url: canonicalUrl,
          title: TITLE,
          description: DESCRIPTION,
          image: ogImageUrl("index"),
        }),
      ],
    };
  },
  component: LitePage,
});

function LitePage() {
  return (
    <PageLayout description={DESCRIPTION}>
      <TimelinePage view="models" license="all" liteMode={true} />
    </PageLayout>
  );
}
