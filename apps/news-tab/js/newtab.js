import { fetchDigest } from "./api.js";
import { highlightTitle, tagsForHighlight } from "./highlight.js";
import { t, uiLang } from "./i18n.js";
import { applyAppearance, loadSettings, saveSettings } from "./settings.js";
import { mountSettingsPanel } from "./settings-panel.js";
import { topicColor } from "./topic-color.js";

const NEWS_SITE = "https://news.duyet.net";
const THUMB_MARK = new URL("../icons/thumb-mark.svg", import.meta.url).href;

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

function paintTopic(el, tag) {
  const color = topicColor(tag);
  el.classList.add("topic-colored");
  el.style.setProperty("--tc-light", color.light);
  el.style.setProperty("--tc-dark", color.dark);
}

function itemMeta(digest, itemId) {
  return digest.items?.[itemId] || null;
}

function bulletTags(digest, bullet) {
  const ids = bullet.item_ids || [];
  const tags = [];
  for (const id of ids) {
    const meta = itemMeta(digest, id);
    if (meta?.tags) tags.push(...meta.tags);
  }
  return tags;
}

function bulletTopic(digest, bullet, segments) {
  const primaryId = bullet.item_ids?.[0];
  const meta = primaryId ? itemMeta(digest, primaryId) : null;
  if (meta?.tags?.[0]) return meta.tags[0];
  if (meta?.category) return meta.category;
  const highlighted = segments.find((s) => s.highlighted && s.tag);
  return highlighted?.tag || null;
}

function appendHighlighted(parent, text, tags) {
  const segments = highlightTitle(text, tagsForHighlight(tags));
  for (const segment of segments) {
    const span = document.createElement("span");
    span.textContent = segment.text;
    if (segment.highlighted && segment.tag) {
      span.className = "hl";
      paintTopic(span, segment.tag);
    } else if (segment.highlighted) {
      span.className = "hl";
    }
    parent.append(span);
  }
  return segments;
}

function thumbNode(src) {
  const img = document.createElement("img");
  img.className = "thumb";
  img.width = 48;
  img.height = 48;
  img.alt = "";
  img.loading = "lazy";
  img.decoding = "async";
  img.src = src || THUMB_MARK;
  img.addEventListener("error", () => {
    if (img.src !== THUMB_MARK) img.src = THUMB_MARK;
  });
  return img;
}

function bulletHref(bullet) {
  const id = bullet.item_ids?.[0];
  if (id) return `${NEWS_SITE}/ai/${id}`;
  return NEWS_SITE;
}

function renderThumbRow(digest, bullet, n) {
  const row = document.createElement("li");
  const inner = document.createElement("span");
  inner.className = "bullet";

  const copy = document.createElement("span");
  copy.className = "bullet-copy";
  copy.title = bullet.text;

  const tags = bulletTags(digest, bullet);
  const segments = highlightTitle(bullet.text, tagsForHighlight(tags));
  const topic = bulletTopic(digest, bullet, segments);
  if (topic) {
    const tagEl = document.createElement("span");
    tagEl.className = "topic-tag";
    tagEl.textContent = topic;
    paintTopic(tagEl, topic);
    copy.append(tagEl);
  }

  const link = document.createElement("a");
  link.href = bulletHref(bullet);
  link.rel = "noreferrer";
  appendHighlighted(link, bullet.text, tags);
  copy.append(link);

  const extra = (bullet.item_ids || []).length - 1;
  if (extra > 0) {
    const more = document.createElement("span");
    more.className = "related";
    more.textContent = `+${extra}`;
    copy.append(more);
  }

  inner.append(copy, thumbNode(bullet.image_url));
  row.append(inner);
  row.dataset.n = String(n);
  return row;
}

function splitColumns(items) {
  const mid = Math.ceil(items.length / 2) || 1;
  return [items.slice(0, mid), items.slice(mid)];
}

let filterTag = null;
let filterCategory = null;
let tldrExpanded = false;
let pushSettings = async () => {};

function applyChrome(settings) {
  const lang = uiLang(settings);
  $("brand").textContent = t(settings, "lede");
  $("search").placeholder = t(settings, "search");
  $("chrome-tab").textContent = t(settings, "chromeTab");
  $("submit-label").textContent = t(settings, "submit");
  $("stories-heading").textContent = t(settings, "stories");
  $("trending-label").textContent = t(settings, "trending");
  $("settings-title").textContent = t(settings, "settings");
  $("open-settings").setAttribute("aria-label", t(settings, "settings"));
  $("close-settings").setAttribute("aria-label", t(settings, "close"));
  document.title = t(settings, "lede");
  for (const btn of $("lang-toggle").querySelectorAll("button")) {
    btn.setAttribute(
      "aria-pressed",
      btn.dataset.lang === lang ? "true" : "false"
    );
  }
}

function setStatus(message, show) {
  const node = $("status");
  node.hidden = !show;
  node.textContent = message || "";
}

function tldrShown(bullets, settings) {
  const cap = settings.tldrCount || 8;
  if (bullets.length <= 8) return bullets;
  if (tldrExpanded) return bullets.slice(0, Math.min(bullets.length, cap));
  return bullets.slice(0, 8);
}

function renderTldr(settings, digest) {
  const section = $("section-tldr");
  const cols = $("tldr-cols");
  const more = $("tldr-more");
  const counts = $("tldr-counts");
  cols.replaceChildren();
  counts.replaceChildren();
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

  const options = [];
  if (bullets.length > 8) {
    options.push(8);
    options.push(Math.min(bullets.length, 12));
    if (bullets.length > 12) options.push(Math.min(bullets.length, 16));
  }
  counts.hidden = options.length === 0;
  for (const n of options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = String(n);
    btn.setAttribute(
      "aria-pressed",
      (settings.tldrCount || 8) === n ||
        (n === bullets.length && (settings.tldrCount || 8) > n)
        ? "true"
        : "false"
    );
    btn.addEventListener("click", async () => {
      const nominal = n <= 8 ? 8 : n <= 12 ? 12 : 16;
      tldrExpanded = nominal > 8;
      await pushSettings({ ...settings, tldrCount: nominal });
    });
    counts.append(btn);
  }

  const shown = tldrShown(bullets, {
    ...settings,
    tldrCount: tldrExpanded ? settings.tldrCount || 8 : 8,
  });
  const columns = splitColumns(shown);
  columns.forEach((col, ci) => {
    if (!col.length) return;
    const list = document.createElement("ol");
    list.className = "tldr-list";
    list.start = ci === 0 ? 1 : columns[0].length + 1;
    col.forEach((bullet, i) => {
      list.append(
        renderThumbRow(digest, bullet, (ci === 0 ? 1 : columns[0].length + 1) + i)
      );
    });
    cols.append(list);
  });

  if (bullets.length > 8 && !tldrExpanded) {
    more.hidden = false;
    more.textContent = t(settings, "showMore");
    more.onclick = async () => {
      tldrExpanded = true;
      const next = bullets.length > 12 ? 16 : 12;
      await pushSettings({ ...settings, tldrCount: next });
    };
  } else if (tldrExpanded && bullets.length > 8) {
    more.hidden = false;
    more.textContent = t(settings, "showLess");
    more.onclick = async () => {
      tldrExpanded = false;
      await pushSettings({ ...settings, tldrCount: 8 });
    };
  } else {
    more.hidden = true;
  }

  const total = digest.totalStories || digest.stories.length;
  $("tldr-total").textContent = total
    ? `${total} ${t(settings, "storiesCount")}`
    : "";
  const stamp = digest.lastFetchedAt || digest.updatedAt;
  $("tldr-updated").textContent = stamp
    ? `${t(settings, "updated")} ${timeAgo(stamp, uiLang(settings))}`
    : "";
}

function renderChips(settings, digest) {
  const catSection = $("section-categories");
  const trendSection = $("section-trending");
  const trendRoot = $("trending");
  catSection.replaceChildren();
  trendRoot.replaceChildren();

  const showCats = settings.sections.categories && digest.categories.length > 0;
  if (!showCats) filterCategory = null;
  catSection.hidden = !showCats;
  if (showCats) {
    const lang = uiLang(settings);
    const all = document.createElement("button");
    all.type = "button";
    all.className = "chip";
    all.textContent = t(settings, "all");
    all.setAttribute("aria-pressed", filterCategory ? "false" : "true");
    all.addEventListener("click", () => {
      filterCategory = null;
      render(settings, digest);
    });
    catSection.append(all);
    for (const row of digest.categories) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.setAttribute(
        "aria-pressed",
        filterCategory === row.name ? "true" : "false"
      );
      btn.append(
        `${categoryLabel(row.name, lang)} `,
        Object.assign(document.createElement("span"), {
          className: "n",
          textContent: String(row.count),
        })
      );
      btn.addEventListener("click", () => {
        filterCategory = filterCategory === row.name ? null : row.name;
        render(settings, digest);
      });
      catSection.append(btn);
    }
  }

  const showTrending = settings.sections.trending && digest.trending.length > 0;
  if (!showTrending) filterTag = null;
  trendSection.hidden = !showTrending;
  if (showTrending) {
    for (const row of digest.trending) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "trend-chip";
      paintTopic(btn, row.tag);
      btn.setAttribute(
        "aria-pressed",
        filterTag === row.tag ? "true" : "false"
      );
      btn.append(
        row.tag,
        Object.assign(document.createElement("span"), {
          className: "n",
          textContent: String(row.count),
        })
      );
      btn.addEventListener("click", () => {
        filterTag = filterTag === row.tag ? null : row.tag;
        render(settings, digest);
      });
      trendRoot.append(btn);
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
    stories = stories.filter((s) => {
      const blob = `${s.title} ${s.title_vi || ""} ${(s.tags || []).join(" ")}`;
      return blob.toLowerCase().includes(filterTag.toLowerCase());
    });
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
    appendHighlighted(a, storyTitle(story, settings.language), story.tags || []);
    const meta = document.createElement("span");
    meta.className = "story-meta";
    const bits = [];
    if (story.category) bits.push(categoryLabel(story.category, lang));
    if (story.published_at) bits.push(timeAgo(story.published_at, lang));
    meta.textContent = bits.join(" · ");
    copy.append(a, meta);
    li.append(n, copy);
    list.append(li);
  });
}

function render(settings, digest) {
  applyChrome(settings);
  renderChips(settings, digest);
  renderTldr(settings, digest);
  renderStories(settings, digest);
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

function bindLangToggle(getSettings, onChange) {
  $("lang-toggle").addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-lang]");
    if (!btn) return;
    onChange({ ...getSettings(), language: btn.dataset.lang });
  });
}

async function main() {
  let settings = await loadSettings();
  applyAppearance(settings);
  applyChrome(settings);

  let digest =
    globalThis.__NEWS_TAB_DIGEST__ || {
      tldr: null,
      stories: [],
      categories: [],
      trending: [],
      items: {},
      totalStories: 0,
      lastFetchedAt: 0,
      updatedAt: 0,
    };

  const refresh = async (next) => {
    settings = next;
    applyAppearance(settings);
    render(settings, digest);
    if (globalThis.__NEWS_TAB_DIGEST__) return;
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
  pushSettings = async (next) => {
    settings = await saveSettings(next);
    applyAppearance(settings);
    render(settings, digest);
  };
  bindLangToggle(
    () => settings,
    async (next) => {
      settings = await saveSettings(next);
      applyAppearance(settings);
      render(settings, digest);
    }
  );

  if (digest.tldr || digest.stories.length) {
    render(settings, digest);
    return;
  }

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
