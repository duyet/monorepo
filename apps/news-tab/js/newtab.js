import { fetchDigest } from "./api.js";
import { t, uiLang } from "./i18n.js";
import { applyAppearance, loadSettings } from "./settings.js";
import { mountSettingsPanel } from "./settings-panel.js";

const NEWS_SITE = "https://news.duyet.net";

const CATEGORY_VI = {
  Regulation: "Chính sách",
  Research: "Nghiên cứu",
  Releases: "Phát hành",
  Funding: "Gọi vốn",
  Legal: "Pháp lý",
  Industry: "Doanh nghiệp",
  Products: "Sản phẩm",
  Infra: "Hạ tầng",
  Agents: "Tác nhân",
  Chips: "Chip",
};

function $(id) {
  return document.getElementById(id);
}

function looksVietnamese(text) {
  return /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(
    text
  );
}

function categoryLabel(name, lang) {
  if (lang !== "vi") return name;
  return CATEGORY_VI[name] ?? name;
}

function timeAgo(epoch, lang) {
  const started = epoch > 1e12 ? Math.floor(epoch / 1000) : Math.floor(epoch);
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - started);
  if (lang === "vi") {
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  }
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function storyTitle(story, language) {
  const vi = story.title_vi?.trim();
  if (language === "en") return story.title;
  if (vi && (language === "vi" || looksVietnamese(vi))) return vi;
  return story.title;
}

function bulletsFor(tldr, language) {
  if (!tldr) return [];
  const vi = (tldr.bullets_vi || []).filter((b) => b.text);
  const en = (tldr.bullets_en || []).filter((b) => b.text);
  if (language === "en") return en.length ? en : vi;
  if (language === "both") {
    const rows = [];
    const n = Math.max(vi.length, en.length);
    for (let i = 0; i < n; i++) {
      if (vi[i]) rows.push(vi[i]);
      if (en[i] && en[i].text !== vi[i]?.text) rows.push(en[i]);
    }
    return rows;
  }
  const viUseful = vi.length >= 2 && vi.some((b) => looksVietnamese(b.text));
  return viUseful ? vi : en.length ? en : vi;
}

function thumbNode(src) {
  if (src) {
    const img = document.createElement("img");
    img.className = "thumb";
    img.width = 48;
    img.height = 48;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = src;
    img.addEventListener("error", () => {
      img.replaceWith(thumbNode(null));
    });
    return img;
  }
  const mark = document.createElement("span");
  mark.className = "thumb thumb-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = "n";
  return mark;
}

function bulletHref(bullet) {
  const id = bullet.item_ids?.[0];
  if (id) return `${NEWS_SITE}/ai/${id}`;
  return NEWS_SITE;
}

function renderThumbRow(n, text, href, imageUrl) {
  const row = document.createElement("li");
  row.className = "bullet";

  const index = document.createElement("span");
  index.className = "bullet-n";
  index.textContent = String(n);

  const copy = document.createElement("span");
  copy.className = "bullet-copy";
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noreferrer";
  link.textContent = text;
  copy.append(link);

  row.append(index, copy, thumbNode(imageUrl));
  return row;
}

function splitColumns(items) {
  const mid = Math.ceil(items.length / 2) || 1;
  return [items.slice(0, mid), items.slice(mid)];
}

let filterTag = null;
let filterCategory = null;

function applyChrome(settings) {
  $("lede").textContent = t(settings, "lede");
  $("stories-heading").textContent = t(settings, "stories");
  $("trending-label").textContent = t(settings, "trending");
  $("categories-label").textContent = t(settings, "categories");
  $("settings-title").textContent = t(settings, "settings");
  $("open-settings").setAttribute("aria-label", t(settings, "settings"));
  $("close-settings").setAttribute("aria-label", t(settings, "close"));
}

function setStatus(message, show) {
  const node = $("status");
  node.hidden = !show;
  node.textContent = message || "";
}

function renderTldr(settings, digest) {
  const section = $("section-tldr");
  const cols = $("tldr-cols");
  cols.replaceChildren();
  if (!settings.sections.tldr) {
    section.hidden = true;
    return;
  }
  const bullets = bulletsFor(digest.tldr, settings.language);
  if (!bullets.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  $("tldr-meta").textContent = digest.tldr?.date || t(settings, "tldrMeta");
  const columns = splitColumns(bullets);
  columns.forEach((col, ci) => {
    if (!col.length) return;
    const list = document.createElement("ol");
    list.className = "tldr-list";
    const start = ci === 0 ? 1 : columns[0].length + 1;
    col.forEach((bullet, i) => {
      list.append(
        renderThumbRow(
          start + i,
          bullet.text,
          bulletHref(bullet),
          bullet.image_url
        )
      );
    });
    cols.append(list);
  });
}

function renderChips(settings, digest) {
  const trendSection = $("section-trending");
  const catSection = $("section-categories");
  const trendRoot = $("trending");
  const catRoot = $("categories");
  trendRoot.replaceChildren();
  catRoot.replaceChildren();

  const showTrending = settings.sections.trending && digest.trending.length > 0;
  if (!showTrending) filterTag = null;
  trendSection.hidden = !showTrending;
  if (showTrending) {
    for (const row of digest.trending) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = `${row.tag} ${row.count}`;
      btn.setAttribute(
        "aria-pressed",
        filterTag === row.tag ? "true" : "false"
      );
      btn.addEventListener("click", () => {
        filterTag = filterTag === row.tag ? null : row.tag;
        render(settings, digest);
      });
      trendRoot.append(btn);
    }
  }

  const showCats = settings.sections.categories && digest.categories.length > 0;
  if (!showCats) filterCategory = null;
  catSection.hidden = !showCats;
  if (showCats) {
    const lang = uiLang(settings);
    for (const row of digest.categories) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = `${categoryLabel(row.name, lang)} ${row.count}`;
      btn.setAttribute(
        "aria-pressed",
        filterCategory === row.name ? "true" : "false"
      );
      btn.addEventListener("click", () => {
        filterCategory = filterCategory === row.name ? null : row.name;
        render(settings, digest);
      });
      catRoot.append(btn);
    }
  }
}

function renderStories(settings, digest) {
  const section = $("section-stories");
  const list = $("stories");
  list.replaceChildren();
  if (!settings.sections.stories) {
    section.hidden = true;
    return;
  }

  let stories = digest.stories.slice(0, settings.storyCount);
  if (filterCategory) {
    stories = stories.filter((s) => s.category === filterCategory);
  }
  if (filterTag) {
    stories = stories.filter((s) =>
      (s.title + (s.title_vi || ""))
        .toLowerCase()
        .includes(filterTag.toLowerCase())
    );
  }
  if (!stories.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  const lang = uiLang(settings);
  stories.forEach((story, i) => {
    const li = document.createElement("li");
    li.className = "story";
    const n = document.createElement("span");
    n.className = "story-n";
    n.textContent = String(i + 1);
    const copy = document.createElement("span");
    copy.className = "story-copy";
    const a = document.createElement("a");
    a.href = story.url || `${NEWS_SITE}/ai/${story.id}`;
    a.rel = "noreferrer";
    a.textContent = storyTitle(story, settings.language);
    const meta = document.createElement("span");
    meta.className = "story-meta";
    const bits = [];
    if (story.category) bits.push(categoryLabel(story.category, lang));
    if (story.published_at) bits.push(timeAgo(story.published_at, lang));
    meta.textContent = bits.join(" · ");
    copy.append(a, meta);
    li.append(n, copy, thumbNode(story.image_url));
    list.append(li);
  });
}

function render(settings, digest) {
  applyChrome(settings);
  renderTldr(settings, digest);
  renderChips(settings, digest);
  renderStories(settings, digest);
  const stamp = $("stamp");
  if (digest.updatedAt) {
    stamp.dateTime = new Date(digest.updatedAt).toISOString();
    stamp.textContent = timeAgo(digest.updatedAt, uiLang(settings));
  }
}

function bindDrawer(getSettings, onChange) {
  const drawer = $("settings-drawer");
  const backdrop = $("drawer-backdrop");
  const open = () => {
    drawer.hidden = false;
    backdrop.hidden = false;
    mountSettingsPanel($("settings-root"), getSettings(), onChange);
  };
  const close = () => {
    drawer.hidden = true;
    backdrop.hidden = true;
  };
  $("open-settings").addEventListener("click", open);
  $("close-settings").addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

async function main() {
  let settings = await loadSettings();
  applyAppearance(settings);
  applyChrome(settings);

  let digest = {
    tldr: null,
    stories: [],
    categories: [],
    trending: [],
    updatedAt: 0,
  };

  const refresh = async (next) => {
    settings = next;
    applyAppearance(settings);
    render(settings, digest);
    try {
      const result = await fetchDigest(settings.apiBase);
      digest = result.digest;
      setStatus(t(settings, "cached"), result.stale);
      render(settings, digest);
    } catch {
      setStatus(t(settings, "error"), true);
    }
  };

  bindDrawer(() => settings, refresh);

  try {
    const result = await fetchDigest(settings.apiBase);
    digest = result.digest;
    setStatus(t(settings, "cached"), result.stale);
    if (!digest.tldr && digest.stories.length === 0) {
      setStatus(t(settings, "empty"), true);
    }
    render(settings, digest);
  } catch {
    setStatus(t(settings, "error"), true);
  }
}

main();
