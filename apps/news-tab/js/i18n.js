import "./preview-shim.js";

const COPY = {
  vi: {
    lede: "Hôm nay AI có gì mới?",
    tldrMeta: "24 giờ qua",
    stories: "Tin nổi bật",
    trending: "Xu hướng",
    categories: "Chủ đề",
    settings: "Cài đặt",
    close: "Đóng",
    theme: "Giao diện",
    accent: "Màu nhấn",
    font: "Phông chữ",
    size: "Cỡ chữ",
    language: "Ngôn ngữ nội dung",
    density: "Mật độ",
    storyCount: "Số tin",
    apiBase: "API gốc",
    sections: "Mục hiển thị",
    tldr: "AI;DR",
    cached: "Đang hiện bản đã lưu — không tải được bản mới.",
    empty: "Chưa có bản tin.",
    error: "Không tải được news.duyet.net.",
    light: "Sáng",
    dark: "Tối",
    system: "Hệ thống",
    editorial: "Biên tập",
    humanist: "Nhân văn",
    serif: "Có chân",
    mono: "Mono",
    compact: "Dày",
    comfortable: "Vừa",
    spacious: "Thoáng",
    both: "Cả hai",
    vi: "Tiếng Việt",
    en: "English",
    open: "Mở",
  },
  en: {
    lede: "What's new in AI today?",
    tldrMeta: "past 24 hours",
    stories: "Top stories",
    trending: "Trending",
    categories: "Topics",
    settings: "Settings",
    close: "Close",
    theme: "Theme",
    accent: "Accent",
    font: "Font",
    size: "Size",
    language: "Content language",
    density: "Density",
    storyCount: "Story count",
    apiBase: "API base URL",
    sections: "Sections",
    tldr: "AI;DR",
    cached: "Showing last saved digest — live fetch failed.",
    empty: "No digest yet.",
    error: "Could not load news.duyet.net.",
    light: "Light",
    dark: "Dark",
    system: "System",
    editorial: "Editorial",
    humanist: "Humanist",
    serif: "Serif",
    mono: "Mono",
    compact: "Compact",
    comfortable: "Comfortable",
    spacious: "Spacious",
    both: "Both",
    vi: "Vietnamese",
    en: "English",
    open: "Open",
  },
};

export function uiLang(settings) {
  return settings.language === "en" ? "en" : "vi";
}

export function t(settings, key) {
  const chromeApi = globalThis.chrome;
  try {
    const fromChrome = chromeApi?.i18n?.getMessage?.(key);
    if (fromChrome) return fromChrome;
  } catch {
    // ignore
  }
  const pack = COPY[uiLang(settings)];
  return pack[key] ?? COPY.vi[key] ?? key;
}
