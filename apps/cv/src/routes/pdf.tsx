import { DownloadIcon } from "@radix-ui/react-icons";
import { createFileRoute } from "@tanstack/react-router";
import { ogHeadLinks, ogMeta } from "@duyet/config/og";

const PDF_URL = "https://cv.duyet.net/pdf";
const PDF_TITLE = "CV - PDF View | duyet.net";
const PDF_DESCRIPTION =
  "View and download Duyet Le's CV as a PDF. Software engineer specializing in full-stack development, Rust, and modern web technologies.";

export const Route = createFileRoute("/pdf")({
  head: () => ({
    meta: [
      { title: PDF_TITLE },
      { name: "description", content: PDF_DESCRIPTION },
      ...ogMeta({
        url: PDF_URL,
        title: PDF_TITLE,
        description: PDF_DESCRIPTION,
        image: "https://cv.duyet.net/og.png",
        imageAlt: "Duyet Le — Senior Data Engineer résumé",
      }),
    ],
    // `canonical` has to live in `links`, not `meta`: a `rel=canonical` entry
    // inside `meta[]` carries no `name`/`property` and is emitted as a bare
    // <meta rel="canonical">, which crawlers ignore. It was silently dropped
    // here before.
    links: ogHeadLinks({ url: PDF_URL }),
  }),
  component: Page,
});

const file = "https://cv.duyet.net/duyet.cv.pdf";

function Page() {
  return (
    <div>
      <div className="mb-10 flex flex-col items-center justify-center">
        <a
          className="flex flex-row items-center gap-2 px-4 py-2 font-bold underline-offset-2 hover:underline"
          download
          href={file}
        >
          <DownloadIcon className="h-4 w-4" />
          PDF Download
        </a>
      </div>

      <object
        className="min-h-[1000px] w-full border-0"
        data="/duyet.cv.pdf"
        type="application/pdf"
      >
        <iframe
          src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(file)}#zoom=100`}
          title="cv"
          className="min-h-[1000px] w-full border-0"
        />
      </object>
    </div>
  );
}
