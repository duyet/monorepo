import { DownloadIcon } from '@radix-ui/react-icons'

export const dynamic = 'force-static'
export const metadata = {
  title: 'Duyet Le | Resume',
  description: '',
}

const file = 'https://cv.duyet.net/duyet.cv.pdf'

export default function Page() {
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
          src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${file}#zoom=100`}
          title="cv"
        />
      </object>
    </div>
  )
}
