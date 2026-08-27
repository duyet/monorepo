import { NEWS_API_URL, NEWS_SITE_URL } from "./config.js";

const VI_RE =
  /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

function el(id) {
  return document.getElementById(id);
}

function looksVietnamese(text) {
  return VI_RE.test(text);
}

function pickBullets(tldr) {
  const vi = tldr?.bullets_vi ?? [];
  const en = tldr?.bullets_en ?? [];
  const viUseful =
    vi.filter((b) => b?.text).length >= 2 &&
    vi.some((b) => looksVietnamese(b.text));
  return viUseful ? vi : en;
}

function storyHref(story) {
  const cat = (story.category ?? "ai").toLowerCase();
  const prefix = String(story.id ?? "").slice(0, 8);
  if (prefix) return `${NEWS_SITE_URL}/${cat}/${prefix}`;
  return story.url;
}

function storyTitle(story) {
  const vi = story.title_vi?.trim();
  if (vi && looksVietnamese(vi)) return vi;
  return story.title;
}

function setText(id, text) {
  const node = el(id);
  if (node) node.textContent = text;
}

function renderError(message) {
  el("bullets").innerHTML = "";
  const li = document.createElement("li");
  li.className = "error";
  li.textContent = message;
  el("bullets").appendChild(li);
  setText("status", "Không tải được tin.");
}

function render(data) {
  const tldr = data.tldr;
  const bullets = pickBullets(tldr).slice(0, 8);
  const stories = Array.isArray(data.stories) ? data.stories.slice(0, 8) : [];

  setText("date", tldr?.date ?? "");
  setText("tldr-meta", tldr?.date ? tldr.date : "24 giờ qua");

  const list = el("bullets");
  list.innerHTML = "";
  if (bullets.length === 0) {
    const li = document.createElement("li");
    li.className = "error";
    li.textContent = "Chưa có AI;DR hôm nay.";
    list.appendChild(li);
  } else {
    for (const bullet of bullets) {
      const li = document.createElement("li");
      const id = bullet.item_ids?.[0];
      const story = stories.find((s) => s.id === id);
      if (story) {
        const a = document.createElement("a");
        a.href = story.url || storyHref(story);
        a.rel = "noreferrer";
        a.textContent = bullet.text;
        li.appendChild(a);
      } else {
        li.textContent = bullet.text;
      }
      list.appendChild(li);
    }
  }

  const cards = el("cards");
  cards.innerHTML = "";
  for (const story of stories) {
    const a = document.createElement("a");
    a.className = "card";
    a.href = story.url || storyHref(story);
    a.rel = "noreferrer";

    if (story.image_url) {
      const img = document.createElement("img");
      img.src = story.image_url;
      img.alt = "";
      img.addEventListener("error", () => img.remove());
      a.appendChild(img);
    }

    const body = document.createElement("div");
    body.className = "card-body";
    if (story.category) {
      const cat = document.createElement("span");
      cat.className = "cat";
      cat.textContent = story.category;
      body.appendChild(cat);
    }
    const title = document.createElement("p");
    title.className = "card-title";
    title.textContent = storyTitle(story);
    body.appendChild(title);
    a.appendChild(body);
    cards.appendChild(a);
  }

  setText("status", `${stories.length} stories`);
}

async function main() {
  try {
    const res = await fetch(NEWS_API_URL, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      renderError("Không tải được AI;DR. Thử lại sau.");
      return;
    }
    render(await res.json());
  } catch {
    renderError("Không kết nối được news.duyet.net.");
  }
}

main();
