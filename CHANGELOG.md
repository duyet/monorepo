# Changelog

## [0.1.2](https://github.com/duyet/monorepo/compare/v0.1.1...v0.1.2) (2026-07-02)


### ✨ Features

* **agent-ui:** rebuild chat on shadcn ai-elements ([54dffc1](https://github.com/duyet/monorepo/commit/54dffc1d37253f42a0890d5a8a9734d962371eb3))
* **agents:** upgrade agent-api and agent-ui to AI SDK v7 ([48528ee](https://github.com/duyet/monorepo/commit/48528eea697e7156981bbc22f5bed855a7c06653))
* **blog:** add Agent Sandbox on Kubernetes post ([#1209](https://github.com/duyet/monorepo/issues/1209)) ([dc77d48](https://github.com/duyet/monorepo/commit/dc77d48771a79b343649b209d937a49d1b75f076))
* **blog:** add Fossil tags, new goal-and-loop post, fix heading-list spacing ([c260990](https://github.com/duyet/monorepo/commit/c2609904dfaad008640614262f98576b2cf76e73))
* **blog:** add github-stats fetch and cache script ([8a96db3](https://github.com/duyet/monorepo/commit/8a96db3ad3038da081324aa62d03bb6b7ab6414f))
* **blog:** auto-open TOC overlay and navigation improvements ([5c7a95b](https://github.com/duyet/monorepo/commit/5c7a95b38e32fcdb0520b09d0b47a40493e91cc1))
* **blog:** bento series page with icons/colors, notes list view ([46e378f](https://github.com/duyet/monorepo/commit/46e378f9774d48f59dc350eb99ff889d3588d351))
* **blog:** color series titles, bigger note titles, show note excerpt ([d41b8af](https://github.com/duyet/monorepo/commit/d41b8af7269497cf67462027bb09b2226f848dde))
* **blog:** goal-and-loop diagrams, full-bleed images, code-block fixes ([081b367](https://github.com/duyet/monorepo/commit/081b367125898fa9a289283c2c81ba708633050b))
* **blog:** highlight /slash-commands in ```prompt blocks ([06569a8](https://github.com/duyet/monorepo/commit/06569a82e0235a230f189d9aedc3002b5bc55ca1))
* **blog:** match goal-and-loop card to agent-sandbox hero style ([8f70dc6](https://github.com/duyet/monorepo/commit/8f70dc6ba9c45103d9aec5f62c10e3e326318f18))
* **blog:** redesign goal-and-loop thumbnail as shareable card ([88c8f68](https://github.com/duyet/monorepo/commit/88c8f68fae0dcd30e742ebb69eab3a1debbc02a9))
* **blog:** restructure blog nav — Blog | Series | Note | More ([67da303](https://github.com/duyet/monorepo/commit/67da30378f1ae531f49709e0f73fe150a2443f14))
* **blog:** restyle goal-and-loop card — serif title, rounded bars ([4a55aa1](https://github.com/duyet/monorepo/commit/4a55aa15c1f4098f37bc87c29479316ece246a86))
* **blog:** simplify goal-and-loop card — merged bars, cleaner title ([5dce8ca](https://github.com/duyet/monorepo/commit/5dce8ca0f9258bef2edebce5445e09e76638414b))
* **blog:** use solid backgrounds for goal-and-loop card ([6358d6f](https://github.com/duyet/monorepo/commit/6358d6fa2f1281c9bbee5d3580886cb76a2dbc81))
* **components:** shared ExploreApps cross-app discovery section ([1277269](https://github.com/duyet/monorepo/commit/12772696c24e7ecd6f61904aa47e3119e3f074d1))
* **homelab:** single-page compact dashboard, no hidden tabs ([203a0b4](https://github.com/duyet/monorepo/commit/203a0b4cb93bcd32e3820422af1ae09ad334bb75))
* **ui:** redesign home, insights, cv landing viz with accessible responsive SVG ([#1222](https://github.com/duyet/monorepo/issues/1222)) ([6980563](https://github.com/duyet/monorepo/commit/6980563722462a53f0de9a1d901a09e3ac936637))


### 🐛 Bug Fixes

* **agent-ui:** show hero title and copy in chat empty state ([c0c35f9](https://github.com/duyet/monorepo/commit/c0c35f9febf37574e70af97d3e48e00361b676d8))
* **blog:** add Inter font, restore p margin-bottom, wire --reader-sans ([075dcfa](https://github.com/duyet/monorepo/commit/075dcfa2f9f6120ed25d48b0275a25009ce86d41))
* **blog:** align note body to same max-w-3xl column as header and footer ([911e112](https://github.com/duyet/monorepo/commit/911e1128828310d41d22cb3183d66b4ad73143a1))
* **blog:** flatten note prose grid so body text aligns with title and image ([753ffec](https://github.com/duyet/monorepo/commit/753ffec1e70aed71232f9782b7448549cd1870fc))
* **blog:** import cn from @duyet/libs/utils not @duyet/components ([5892ae3](https://github.com/duyet/monorepo/commit/5892ae34418d5627ee3d2e31692d63bd20d7d304))
* **blog:** reduce heading margin-top (h2 2.4→1.6em, h3 1.9→1.3em) ([c6b60aa](https://github.com/duyet/monorepo/commit/c6b60aac3be18ad4b2dfa47c4e4c1ba64958625a))
* **blog:** reduce prose font-size from 1.0625rem to 1rem ([aecab76](https://github.com/duyet/monorepo/commit/aecab7617e1d98e03c497025b7454433363b1a3b))
* **blog:** render note images and resolve /note/mai slug collision ([602d482](https://github.com/duyet/monorepo/commit/602d482e3d838538b4860fab5134b4705810146d))
* **blog:** resolve merge conflict markers in agent-sandbox post ([db772b2](https://github.com/duyet/monorepo/commit/db772b283822c982557d636d0c9ef780bb89de08))
* **blog:** stack featured post image above text on small screens ([c50970e](https://github.com/duyet/monorepo/commit/c50970e0a47c8cec0719755e8eaf4fc48c347750))
* **blog:** toc floating btn on hidden, code block white bg, tighter heading margins ([f13114f](https://github.com/duyet/monorepo/commit/f13114facde8a514fc971be908cb8164112f556b))
* **blog:** white code blocks, atom-one-light highlight, better inline code ([ed0bf00](https://github.com/duyet/monorepo/commit/ed0bf00146738a45911747de3cea49c5fd7c9e6e))
* **blog:** zero margin on prose p and ul/ol ([d9cf031](https://github.com/duyet/monorepo/commit/d9cf03132f988ef5d61661dbe051b1a517cf252e))
* **deps:** update all non-major dependencies ([#1204](https://github.com/duyet/monorepo/issues/1204)) ([306af2f](https://github.com/duyet/monorepo/commit/306af2f8ac26543c5a229918d9ee103be69a3275))
* **deps:** update all non-major dependencies ([#1212](https://github.com/duyet/monorepo/issues/1212)) ([c3765a9](https://github.com/duyet/monorepo/commit/c3765a90abe3662e6d3c6c85a273a164cbf4ca45))
* **home:** remove thumbnail from featured post in BlogTeaser ([cc73d60](https://github.com/duyet/monorepo/commit/cc73d60a0aa217d4da3fb0ef962979d943f67d49))
* **home:** restore missing cloud-viz logos, drop wakatime mention ([fc3eb9a](https://github.com/duyet/monorepo/commit/fc3eb9aeaa8b40d6d88bf67762cee8354c683040))


### ♻️ Refactoring

* **blog:** hoist mdx highlight languages to a module constant ([bf0aa70](https://github.com/duyet/monorepo/commit/bf0aa707514299662605dda7028b91f3c00f26d7))
* **components:** compact explore-apps grid; fix(kb): full-height home ([f25362d](https://github.com/duyet/monorepo/commit/f25362d2fc86ddd88be89616f973b2500c4d7a7f))

## [0.1.1](https://github.com/duyet/monorepo/compare/v0.1.0...v0.1.1) (2026-06-18)


### ✨ Features

* **blog:** publish "Coworker as Planner" post ([#1193](https://github.com/duyet/monorepo/issues/1193)) ([2bc090c](https://github.com/duyet/monorepo/commit/2bc090c5035bff49ea6a418c041eb4e1d9e801ce))
* **blog:** redesign category and tags index as bento grid ([56fa7a9](https://github.com/duyet/monorepo/commit/56fa7a91f71638b636965ebc29035dc0259df764))
