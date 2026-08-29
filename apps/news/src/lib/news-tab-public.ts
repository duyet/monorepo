/** Public download of the unpacked MV3 new-tab extension. */
export const NEWS_TAB_ZIP_FILENAME = "news-tab.zip";
export const NEWS_TAB_ZIP_HREF = `/${NEWS_TAB_ZIP_FILENAME}`;
export const NEWS_TAB_GUIDE_PATH = "/extension";
/** Top-level folder inside the zip. Load unpacked this directory. */
export const NEWS_TAB_UNPACKED_DIR = "news-tab";
/** Chrome cannot open chrome:// from HTTPS; still emit this href. */
export const CHROME_EXTENSIONS_HREF = "chrome://extensions";
/** Real Chrome dialog after Load unpacked on the zip file (not a drawing). */
export const NEWS_TAB_ZIP_ERROR_IMG =
  "/media/chrome-load-unpacked-zip-error.png";
export const NEWS_TAB_ZIP_ERROR_IMG_WIDTH = 600;
export const NEWS_TAB_ZIP_ERROR_IMG_HEIGHT = 360;
