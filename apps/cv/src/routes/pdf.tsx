import { DownloadIcon } from "@radix-ui/react-icons";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pdf")({
  head: () => ({
    meta: [
      { title: "CV - PDF View | duyet.net" },
      {
        name: "description",
        content:
          "View and download Duyet Le's CV as a PDF. Software engineer specializing in full-stack development, Rust, and modern web technologies.",
      },
      { property: "og:title", content: "CV - PDF View | duyet.net" },
      {
        property: "og:description",
        content:
          "View and download Duyet Le's CV as a PDF. Software engineer specializing in full-stack development, Rust, and modern web technologies.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://cv.duyet.net/pdf" },
      {
        rel: "canonical",
        href: "https://cv.duyet.net/pdf",
      },
    ],
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
