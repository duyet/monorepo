import "./preview-shim.js";

export const DEFAULT_API_BASE = "https://news.duyet.net";

export const DEFAULT_SETTINGS = {
  theme: "system",
  accent: "#b45309",
  font: "system",
  fontSize: 15,
  language: "vi",
  sections: {
    tldr: true,
    stories: true,
    categories: true,
    trending: true,
  },
  density: "compact",
  storyCount: 8,
  tldrCount: 8,
  apiBase: DEFAULT_API_BASE,
};

const SYNC_KEY = "newsTabSettings";
const FONTS = ["system", "editorial", "humanist", "serif", "mono"];
const THEMES = ["light", "dark", "system"];
const DENSITIES = ["compact", "comfortable", "spacious"];
const LANGUAGES = ["vi", "en", "both"];
const TLDR_COUNTS = [8, 12, 16];

function asChrome() {
  return globalThis.chrome;
}

function clampSize(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.fontSize;
  return Math.min(20, Math.max(13, Math.round(n)));
}

function clampCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.storyCount;
  return Math.min(8, Math.max(1, Math.round(n)));
}

function clampTldrCount(value) {
  const n = Number(value);
  return TLDR_COUNTS.includes(n) ? n : DEFAULT_SETTINGS.tldrCount;
}

function pick(list, value, fallback) {
  return list.includes(value) ? value : fallback;
}

export function normalizeSettings(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const sections =
    input.sections && typeof input.sections === "object" ? input.sections : {};
  return {
    theme: pick(THEMES, input.theme, DEFAULT_SETTINGS.theme),
    accent:
      typeof input.accent === "string" && /^#[0-9a-fA-F]{6}$/.test(input.accent)
        ? input.accent
        : DEFAULT_SETTINGS.accent,
    font: pick(FONTS, input.font, DEFAULT_SETTINGS.font),
    fontSize: clampSize(input.fontSize),
    language: pick(LANGUAGES, input.language, DEFAULT_SETTINGS.language),
    sections: {
      tldr: sections.tldr !== false,
      stories: sections.stories !== false,
      categories: sections.categories !== false,
      trending: sections.trending !== false,
    },
    density: pick(DENSITIES, input.density, DEFAULT_SETTINGS.density),
    storyCount: clampCount(input.storyCount),
    tldrCount: clampTldrCount(input.tldrCount),
    apiBase: normalizeApiBase(input.apiBase),
  };
}

export function normalizeApiBase(value) {
  const fallback = DEFAULT_API_BASE;
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    const url = new URL(value.trim());
    const loopback =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol === "https:" || (url.protocol === "http:" && loopback)) {
      return `${url.protocol}//${url.host}`;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function applyAppearance(settings) {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.dataset.font = settings.font;
  root.dataset.density = settings.density;
  root.classList.toggle(
    "dark",
    settings.theme === "dark" ||
      (settings.theme === "system" &&
        globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches)
  );
  root.style.setProperty("--accent", settings.accent);
  root.style.setProperty("--size", `${settings.fontSize}px`);
  root.lang = settings.language === "en" ? "en" : "vi";
}

async function areaGet(area, key) {
  const chromeApi = asChrome();
  const bag = await chromeApi.storage[area].get(key);
  return bag?.[key];
}

async function areaSet(area, key, value) {
  const chromeApi = asChrome();
  await chromeApi.storage[area].set({ [key]: value });
}

export async function loadSettings() {
  try {
    const fromSync = await areaGet("sync", SYNC_KEY);
    if (fromSync) return normalizeSettings(fromSync);
  } catch {
    // sync quota / private mode
  }
  try {
    const fromLocal = await areaGet("local", SYNC_KEY);
    if (fromLocal) return normalizeSettings(fromLocal);
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS, sections: { ...DEFAULT_SETTINGS.sections } };
}

export async function saveSettings(next) {
  const settings = normalizeSettings(next);
  try {
    await areaSet("sync", SYNC_KEY, settings);
  } catch {
    // fall through to local
  }
  await areaSet("local", SYNC_KEY, settings);
  applyAppearance(settings);
  return settings;
}

export async function ensureHostPermission(apiBase) {
  const chromeApi = asChrome();
  const origin = `${normalizeApiBase(apiBase)}/*`;
  if (origin.startsWith("https://news.duyet.net/")) return true;
  if (!chromeApi.permissions?.request) return true;
  const already = await chromeApi.permissions.contains({ origins: [origin] });
  if (already) return true;
  return chromeApi.permissions.request({ origins: [origin] });
}
