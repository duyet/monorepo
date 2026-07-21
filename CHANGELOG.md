# Changelog

## [0.1.4](https://github.com/duyet/monorepo/compare/v0.1.3...v0.1.4) (2026-07-21)


### ✨ Features

* **blog:** add CLI tab and new model-detect screenshot to AnyRouter post ([a2ef9c0](https://github.com/duyet/monorepo/commit/a2ef9c0845a1059804dd02dc2189809fa40b977c))
* **blog:** anyrouter launch post, code tabs, diff lines, copy button ([a639cb9](https://github.com/duyet/monorepo/commit/a639cb9881a59f450874efa1e3fb60479a4106fa))
* **blog:** bento image grid for post screenshots, applied to oma post ([c00ff63](https://github.com/duyet/monorepo/commit/c00ff6313015d33557bed681697433a3e05d0780))
* **blog:** comment on x link from post frontmatter ([655fbda](https://github.com/duyet/monorepo/commit/655fbda5efed10a91a7b074e94c754d18b056b15))
* **blog:** oma post dark hero thumbnail + landing dialog screenshots ([be9a056](https://github.com/duyet/monorepo/commit/be9a05676585b6605f412333cc995b825a3d5489))
* **blog:** oma post new thumbnail, anyrouter desc matches tweet ([4cbeca6](https://github.com/duyet/monorepo/commit/4cbeca6300b1f7476f7c0394106d7878bb0c757e))
* **blog:** publish Open Managed Agents build-log post ([2f06cb2](https://github.com/duyet/monorepo/commit/2f06cb294aeca069fea44225f28b98772250c143))
* **burns:** logos-only source row, per-agent hover breakdown, layout tweaks ([00d9b3d](https://github.com/duyet/monorepo/commit/00d9b3dde3164e865f1aef99732c66b62553391d))


### 🐛 Bug Fixes

* **blog:** add github issues screenshot to anyrouter post ([763e921](https://github.com/duyet/monorepo/commit/763e9213d5807516de8610a0e3f5e2cbe90fe1e3))
* **blog:** fix typos in anyrouter post ([a0bfbac](https://github.com/duyet/monorepo/commit/a0bfbacc328e6a2ee928003df82379b1bff8f298))
* **blog:** move duyetbot image into img-row with GitHub issues ([cc5207d](https://github.com/duyet/monorepo/commit/cc5207da4da163f3cfba9a048987950efdf531dd))
* **blog:** replace two screenshots in img-row with updated versions ([15b70ad](https://github.com/duyet/monorepo/commit/15b70ad6e45ed1716e0c451f6c80bc6411d813e9))
* **burns:** official brand SVGs, resize Grok, backfill per-source breakdown ([34d514b](https://github.com/duyet/monorepo/commit/34d514bcab1d7f8a9d404aa100a71b9cff894154))
* **burns:** reverse bar chart to chronological left-to-right ([183b237](https://github.com/duyet/monorepo/commit/183b237e1b36e7f8d30ea55a80914a7e16b58e6c))
* rename anyrouter-issues-new-mode-bg to new-model-bg and update image ([cb47d83](https://github.com/duyet/monorepo/commit/cb47d83ee741671afd2c770d8c07cbc4f3e7d2a9))


### ♻️ Refactoring

* **blog:** migrate prose classes to typeset system ([dea3a1d](https://github.com/duyet/monorepo/commit/dea3a1dcb9c9beea0cb619d71783e0812a05c431))
* **components:** add typeset.css markdown styling system ([ce3b7f6](https://github.com/duyet/monorepo/commit/ce3b7f6bfea17188a55b16e8d89421d846a8f464))
* **kb:** migrate prose classes to typeset system ([713ca64](https://github.com/duyet/monorepo/commit/713ca644a02f47cface398fc59a5766a2327ee83))

## [0.1.3](https://github.com/duyet/monorepo/compare/v0.1.2...v0.1.3) (2026-07-16)


### ✨ Features

* **cache:** enable Cloudflare Workers Cache on Workers; _headers for Pages ([#1226](https://github.com/duyet/monorepo/issues/1226)) ([a864b8d](https://github.com/duyet/monorepo/commit/a864b8d0ea79556cbfb5412f8d04cde5dda027d8))
* **home:** add agent discovery endpoints and WebMCP/markdown negotiation support ([e454223](https://github.com/duyet/monorepo/commit/e454223e0c077b892264045f37a357b7bd161d70))
* **home:** expand shipped-work cards into a 2x2 detail block on click ([15ecc75](https://github.com/duyet/monorepo/commit/15ecc750c369bd6dae05a754148fe4e554d13dfa))
* **home:** flatten shipped-work detail and add a zoom affordance ([22a7b1d](https://github.com/duyet/monorepo/commit/22a7b1d92bce18b48e8e3efee5feb5c1f4910023))
* **home:** redesign landing page in blog style and remove 3D tech cloud ([e469542](https://github.com/duyet/monorepo/commit/e4695421a51a22705980b5f8bc3cc6994f2b5204))
* **home:** remove Tech Stack section, compact ExploreApps grid, rename AI Agent Engineering ([626f89a](https://github.com/duyet/monorepo/commit/626f89ae577b847d9b33f236fb099716a3d9b419))
* **home:** remove vibe-flag, stat bar, and CTA buttons from hero; use 3-col explore grid ([0af07ec](https://github.com/duyet/monorepo/commit/0af07ec1495f12f41e055ad5ca705f11ff7e0ae1))
* **home:** show a full-width screenshot or video on expanded work cards ([f037555](https://github.com/duyet/monorepo/commit/f0375555948b1eaa2cbbc845332971624abf42de))
* **insights:** add token burn metrics and donut charts for token/cost breakdown ([9cafc58](https://github.com/duyet/monorepo/commit/9cafc58ee73b4a327b9d2b4752a045500ad0142f))
* **paid-api:** add x402 agent-native paid chat worker ([aea2a31](https://github.com/duyet/monorepo/commit/aea2a3115247abb31d9fe2f8dad5b898f1419cc1))
* **paid-api:** wire paid.duyet.net custom domain (testnet) ([f390120](https://github.com/duyet/monorepo/commit/f3901203b1bfc0edce927aa514644504bbb7ddac))
* refactor ExploreApps bento grid with full-width layout, enhanced SVGs, and new tall size ([b55f0f2](https://github.com/duyet/monorepo/commit/b55f0f29ae2e5d835afa6bb7978c9a6346dd501c))


### 🐛 Bug Fixes

* **blog:** disable model-distillation-skills post ([9e1c894](https://github.com/duyet/monorepo/commit/9e1c894eeceeed6b25ef7ca81b45cf86670efdbc))
* **deps:** replace dependency framer-motion with motion ([#1229](https://github.com/duyet/monorepo/issues/1229)) ([aa7876b](https://github.com/duyet/monorepo/commit/aa7876b0e45209e66a1d3754633490ff1b7acdf5))
* **home:** add white logoDark for Helm Charts logo on dark mode ([c13e5ee](https://github.com/duyet/monorepo/commit/c13e5eee9260492fbf4663344cf2d43060916dc7))
* **home:** bundle lucide icons into a single chunk ([2b4ace3](https://github.com/duyet/monorepo/commit/2b4ace3d86faad2a5feec0cf3813d587806f648e))
* **home:** drop npm logoDark so build-agent logo shows in dark mode ([3acb81c](https://github.com/duyet/monorepo/commit/3acb81c16ba539faf3eb8884a9e6156d780ed95a))
* **home:** make blog teaser columns equal height ([ec844d3](https://github.com/duyet/monorepo/commit/ec844d309266c13ab569045ce7c272c66056da4e))
* **home:** remove codeSplitting:false to fix SSR prerender (React undefined) ([ee8cb27](https://github.com/duyet/monorepo/commit/ee8cb27785756dbf636e7fd99e1edbb846c8626e))
* **home:** remove LLM Timeline from selected projects on landing page ([16a6a1b](https://github.com/duyet/monorepo/commit/16a6a1b469e7df77dcdc79ce7eb7df96f127fcf8))
* **home:** resolve dark mode visibility issues for Anthropic, MCP and Rust logos ([9b50020](https://github.com/duyet/monorepo/commit/9b500206e77d74d1591d8193c894059ceccebf0f))
* **home:** unblock contributions api and clerk worker in csp ([2e66073](https://github.com/duyet/monorepo/commit/2e6607304d40504eeb3145310772b193ed538b7d))


### ♻️ Refactoring

* **components:** make ExploreApps network grid compact ([606377c](https://github.com/duyet/monorepo/commit/606377ca894acbc47470626ada281c495a2cf2e1))
* **components:** make network grid 3-4 columns by screen size ([af8a0d8](https://github.com/duyet/monorepo/commit/af8a0d803c59f04a7813dabd3832b919f8a02935))
* **home:** drop the tagline from the NOW band ([d096af8](https://github.com/duyet/monorepo/commit/d096af83715cab67c890b717ec29958b5971baf4))
* **home:** swap blog and expertise sections on landing ([f431ed9](https://github.com/duyet/monorepo/commit/f431ed9e26fdb31931bb18b548db985a41338af5))

## [0.1.2](https://github.com/duyet/monorepo/compare/v0.1.1...v0.1.2) (2026-07-03)


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
