const file = 'https://cv.duyet.net/duyet.cv.pdf';

export const metadata = {
  title: 'Duyet Resume',
  description: '',
};

export default function Page() {
  return (
    <div>
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

      <div className="mt-10 flex flex-col items-center justify-center">
        <a className="px-4 py-2" download href={file}>
          Download PDF
        </a>
      </div>
    </div>
  );
}
