import {
  NEWS_TAB_UNPACKED_DIR,
  NEWS_TAB_ZIP_FILENAME,
} from "./news-tab-public";

export {
  CHROME_EXTENSIONS_HREF,
  NEWS_TAB_ZIP_ERROR_IMG,
} from "./news-tab-public";

/** Phrases the /extension guide must keep (tests read these, not JSX). */
export const GUIDE_COPY = {
  unzipFirst: {
    en: "Unzip first. Do not Load unpacked the .zip file.",
    vi: "Giải nén trước. Đừng Load unpacked file .zip.",
  },
  unzipDetail: {
    en: `Chrome cannot load a zip. Extract ${NEWS_TAB_ZIP_FILENAME}, then Load unpacked the ${NEWS_TAB_UNPACKED_DIR} folder — the one that contains manifest.json. Never pick ${NEWS_TAB_ZIP_FILENAME} itself.`,
    vi: `Chrome không load được file zip. Giải nén ${NEWS_TAB_ZIP_FILENAME}, rồi Load unpacked thư mục ${NEWS_TAB_UNPACKED_DIR} — thư mục có file manifest.json. Đừng chọn đúng file ${NEWS_TAB_ZIP_FILENAME}.`,
  },
  zipErrorCaption: {
    en: "This is what Chrome shows if Load unpacked points at the zip.",
    vi: "Chrome hiện lỗi này nếu Load unpacked trỏ vào file zip.",
  },
  zipErrorAlt: {
    en: "Chrome dialog: Failed to load extension. File ~/Downloads/news-tab.zip. Error: Manifest file is missing or unreadable. Could not load manifest.",
    vi: "Hộp thoại Chrome: Failed to load extension. File ~/Downloads/news-tab.zip. Error: Manifest file is missing or unreadable. Could not load manifest.",
  },
  openExtensions: {
    en: "Open",
    vi: "Mở",
  },
  pasteExtensions: {
    en: "HTTPS pages may not navigate there; Chrome may ask you to paste that address into the bar.",
    vi: "Trang HTTPS có thể không mở được; Chrome có thể yêu cầu dán địa chỉ đó vào thanh địa chỉ.",
  },
  developerMode: {
    en: "Turn on Developer mode (top right).",
    vi: "Bật Developer mode (góc trên bên phải).",
  },
  loadFolder: {
    en: `Click Load unpacked and pick the unzipped ${NEWS_TAB_UNPACKED_DIR} folder (manifest.json inside). Not the .zip.`,
    vi: `Bấm Load unpacked và chọn thư mục ${NEWS_TAB_UNPACKED_DIR} vừa giải nén (có manifest.json). Không phải file .zip.`,
  },
  newTab: {
    en: "Open a new tab. It should show today's AI;DR and stories from this site.",
    vi: "Mở tab mới. Trang sẽ hiện AI;DR hôm nay và tin từ site này.",
  },
} as const;
