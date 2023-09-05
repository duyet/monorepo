import type * as CSS from 'csstype';

const style: CSS.Properties = {
  overflow: 'hidden',
  height: '100%',
  width: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  border: 0,
};

export default function Page() {
  return (
    <object
      data="/duyet.cv.pdf"
      height="100%"
      style={style}
      type="application/pdf"
      width="100%"
    >
      <iframe
        src="https://mozilla.github.io/pdf.js/web/viewer.html?file=https://cv.duyet.net/duyet.cv.pdf#zoom=100"
        style={style}
        title="cv"
      />
    </object>
  );
}
