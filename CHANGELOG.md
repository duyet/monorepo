# Changelog

## [0.1.7](https://github.com/duyet/monorepo/compare/v0.1.6...v0.1.7) (2026-08-21)


### 🐛 Bug Fixes

* **blog:** move Get updates into footer grid with series/related ([#1348](https://github.com/duyet/monorepo/issues/1348)) ([a8b5120](https://github.com/duyet/monorepo/commit/a8b5120c670b821b3262a6c873800cb5deb26e85))

## [0.1.6](https://github.com/duyet/monorepo/compare/v0.1.5...v0.1.6) (2026-08-20)


### 🐛 Bug Fixes

* address open news, viz, alerting, and insights issues ([#1332](https://github.com/duyet/monorepo/issues/1332)) ([1f9554c](https://github.com/duyet/monorepo/commit/1f9554c4e4df0cb75bd6801dd2f80b5129dd46a2))
* **news:** rewrite splat HTML to HTTP 404 in the Worker ([#1314](https://github.com/duyet/monorepo/issues/1314)) ([9cba8c1](https://github.com/duyet/monorepo/commit/9cba8c11532750ddfe7da2d651eef18b8abca891))

## [0.1.5](https://github.com/duyet/monorepo/compare/v0.1.4...v0.1.5) (2026-08-20)


### ✨ Features

* **blog:** embed live X posts from quote and URL blocks ([#1321](https://github.com/duyet/monorepo/issues/1321)) ([811acb4](https://github.com/duyet/monorepo/commit/811acb44898a5bd05c4b6fb492bff84927b33006))
* **blog:** publish Grok Bot ([#1320](https://github.com/duyet/monorepo/issues/1320)) ([4e22fd0](https://github.com/duyet/monorepo/commit/4e22fd06e7d8696aa85cfe723f9b9bfcce5a65ac))
* **blog:** refresh Grok Bot post ([#1323](https://github.com/duyet/monorepo/issues/1323)) ([225ebec](https://github.com/duyet/monorepo/commit/225ebec5bbc57e5975dc42ca7e1e0be055bad406))
* **blog:** rewrite Grok Bot closer with duyetbot print shots ([#1330](https://github.com/duyet/monorepo/issues/1330)) ([1591f20](https://github.com/duyet/monorepo/commit/1591f200bb45f3fb9a88eede6c11a61e7be8e7d9))
* **burns:** full-width layout, agent filter, and breakdown dialog ([#1283](https://github.com/duyet/monorepo/issues/1283)) ([a253e57](https://github.com/duyet/monorepo/commit/a253e57bdf3c7270abc5da2cb3b67ce1c60c3be2))
* **homelab:** lock dark mode and tune night-ops palette ([#1338](https://github.com/duyet/monorepo/issues/1338)) ([ab85d5d](https://github.com/duyet/monorepo/commit/ab85d5d915da5e57962cbec9ad53e30507427ac9))
* **homelab:** rebuild dashboard as a single-level bento ([#1334](https://github.com/duyet/monorepo/issues/1334)) ([eb7917b](https://github.com/duyet/monorepo/commit/eb7917b20da9bae3581afd8fe2d9e3c9b05f50f7))
* **kb:** add site-wide search for notes and articles ([#1297](https://github.com/duyet/monorepo/issues/1297)) ([44107e0](https://github.com/duyet/monorepo/commit/44107e02272016d08da51283aec1e2349c7b4f87))
* **kb:** obsidian-style graph redesign with live physics and local graphs ([#1286](https://github.com/duyet/monorepo/issues/1286)) ([23f5b98](https://github.com/duyet/monorepo/commit/23f5b98f2a100a6f02cc51aa73b230e27e79a6e9))
* **news:** add news.duyet.net AI news aggregator ([#1280](https://github.com/duyet/monorepo/issues/1280)) ([64128d9](https://github.com/duyet/monorepo/commit/64128d941bc42122a4d292a1c0df33a74f495177))
* **news:** admin panel, llm hardening, multi-story tldr, ui fixes ([#1284](https://github.com/duyet/monorepo/issues/1284)) ([24aaac6](https://github.com/duyet/monorepo/commit/24aaac6f5b6dd4409025ea219b9be55000d9943e))
* **news:** telegram channel notifier with daily TL;DR digest and trending posts ([#1285](https://github.com/duyet/monorepo/issues/1285)) ([5b9945b](https://github.com/duyet/monorepo/commit/5b9945b8b292a829b178a35c4f64709450381c66))


### 🐛 Bug Fixes

* **blog:** center X embeds and trim Grok Bot first-run notes ([#1325](https://github.com/duyet/monorepo/issues/1325)) ([6e0f86a](https://github.com/duyet/monorepo/commit/6e0f86a5eba75340449b8435f7c44b818a59c676))
* **blog:** hydrate from src/client.tsx so posts stay visible ([#1343](https://github.com/duyet/monorepo/issues/1343)) ([a91b0a6](https://github.com/duyet/monorepo/commit/a91b0a668b7a5f167ab2aa72a76ea27537dfa045))
* **blog:** keep prerendered pages visible after hydrate ([#1341](https://github.com/duyet/monorepo/issues/1341)) ([22afb8c](https://github.com/duyet/monorepo/commit/22afb8cfa22081bacd495fcfd481130573235915))
* **blog:** prerender posts and keep tests off WASM ([#1342](https://github.com/duyet/monorepo/issues/1342)) ([6db040a](https://github.com/duyet/monorepo/commit/6db040ad04b23334216a5feb7025585e1b30490b))
* **blog:** put Grok Bot duyetbot and print shots on one row ([ce76d57](https://github.com/duyet/monorepo/commit/ce76d57a8fcb1e176273a1fa5f09b2fd20cfa80b))
* **burns:** keep daily-chart tooltip readable on trailing bars ([#1292](https://github.com/duyet/monorepo/issues/1292)) ([cae680e](https://github.com/duyet/monorepo/commit/cae680e9433bc131328cd31d9a76b92481da8385))
* **ci:** discover Pages apps so kb deploys ([#1294](https://github.com/duyet/monorepo/issues/1294)) ([4e66b62](https://github.com/duyet/monorepo/commit/4e66b629be0a7e0179cf63518e268de7c21c2110))
* **ci:** give burns preview a MotherDuck token ([#1336](https://github.com/duyet/monorepo/issues/1336)) ([8ca2aad](https://github.com/duyet/monorepo/commit/8ca2aadc858fa9cdc6d6b4ba10c0662e889ea1d0))
* **home:** keep landing hero visible in first static HTML ([#1319](https://github.com/duyet/monorepo/issues/1319)) ([164f6a7](https://github.com/duyet/monorepo/commit/164f6a7aca008df6ba3c933ff4722f46c0eb1571))
* **home:** paint prerendered HTML before hydrating ([#1340](https://github.com/duyet/monorepo/issues/1340)) ([aff5187](https://github.com/duyet/monorepo/commit/aff51874d728931c85e3aa88c584fd9509343d9d))
* **home:** restore header cluster and hydrate agents chat ([#1335](https://github.com/duyet/monorepo/issues/1335)) ([df38e2c](https://github.com/duyet/monorepo/commit/df38e2c05e32bfd126866d46ee76952546709292))
* **home:** scope Pages Function to / so static routes and query strings work ([#1281](https://github.com/duyet/monorepo/issues/1281)) ([6691980](https://github.com/duyet/monorepo/commit/6691980cb968c73208ffee3bad0edbc129f036ad))
* **home:** stop CF retry from double-hydrating after load ([#1339](https://github.com/duyet/monorepo/issues/1339)) ([aabdea9](https://github.com/duyet/monorepo/commit/aabdea9e81837155d2338c3932150f9e5bf979ed))
* **news:** 404 first title, phone search, combined chrome ([#1309](https://github.com/duyet/monorepo/issues/1309)) ([1b842a6](https://github.com/duyet/monorepo/commit/1b842a6b65f1f90e943096d720c67754db8caf2b))
* **news:** expose the story title as the article page H1 ([#1317](https://github.com/duyet/monorepo/issues/1317)) ([ada7147](https://github.com/duyet/monorepo/commit/ada7147a721dfe024ffc71f1ae58d2bbb0b6e995))
* **news:** fail over hanging translate models so VI titles come back ([#1322](https://github.com/duyet/monorepo/issues/1322)) ([0320af9](https://github.com/duyet/monorepo/commit/0320af9526b77c9183a1fea7d1178467e36eed33))
* **news:** give leftover translate budget to fallbacks and lead with live Gemini ([#1324](https://github.com/duyet/monorepo/issues/1324)) ([8793083](https://github.com/duyet/monorepo/commit/879308329889d22c24130a790d837252bc2d5e76))
* **news:** hang-cap leftover so translate fallbacks actually run ([#1327](https://github.com/duyet/monorepo/issues/1327)) ([6f1bab1](https://github.com/duyet/monorepo/commit/6f1bab15a3589d806493331ecedb78ff8521c641))
* **news:** keep splat 404 status out of the client graph ([#1310](https://github.com/duyet/monorepo/issues/1310)) ([1a6017f](https://github.com/duyet/monorepo/commit/1a6017f02cdbc590682679bc551d0f90ddecbbce))
* **news:** persist a TL;DR so Telegram can send the daily digest ([#1304](https://github.com/duyet/monorepo/issues/1304)) ([7522795](https://github.com/duyet/monorepo/commit/7522795f3ba7381dc27cf8de1a98afac878e6afe))
* **news:** rank last-24h TL;DR instead of a 1-item leftover ([#1315](https://github.com/duyet/monorepo/issues/1315)) ([657e21f](https://github.com/duyet/monorepo/commit/657e21f586065a63cde315b8c202c7ff22016e7e))
* **news:** rebuild English-only TL;DR bullets_vi from title_vi ([#1329](https://github.com/duyet/monorepo/issues/1329)) ([a5cbbc9](https://github.com/duyet/monorepo/commit/a5cbbc9e6590042d814a93f7238bef591eea7763))
* **news:** refresh tldr, highlight today, page older days ([bcd51b4](https://github.com/duyet/monorepo/commit/bcd51b4022428a75b432531e23a8f605dd4d7b50))
* **news:** render Clerk auth buttons only from the app-wide provider module ([#1289](https://github.com/duyet/monorepo/issues/1289)) ([cf93dc6](https://github.com/duyet/monorepo/commit/cf93dc6990674abde038c24f9438b01b398ae096))
* **news:** schedule ingest hourly so Telegram can send ([#1302](https://github.com/duyet/monorepo/issues/1302)) ([d8cad69](https://github.com/duyet/monorepo/commit/d8cad69d17d800ae62a4dca112a3fb846163473e))
* **news:** set HTTP 404 from createServerFn ([d5eb090](https://github.com/duyet/monorepo/commit/d5eb09043d8f3ed276133d5a8dc5f0e6465e4048))
* **news:** sitemap, SSR feed, share tags, 404, title fallback, dedupe ([#1301](https://github.com/duyet/monorepo/issues/1301)) ([b5e6159](https://github.com/duyet/monorepo/commit/b5e6159a414d4d1fa5c87b694b3cf6d80fc677b4))
* **news:** throw notFound so the splat document is HTTP 404 ([#1312](https://github.com/duyet/monorepo/issues/1312)) ([d16a146](https://github.com/duyet/monorepo/commit/d16a1465a1d9f07fc4a61ac9390e58bf3cf0fc43))
* **news:** translate in batches of 3 so VI titles finish before timeout ([#1326](https://github.com/duyet/monorepo/issues/1326)) ([dd20d93](https://github.com/duyet/monorepo/commit/dd20d932baecb54d4ac62304d473871b5eafd0ba))
* **news:** trigger hourly ingest via Actions, not paid Workflow schedules ([#1303](https://github.com/duyet/monorepo/issues/1303)) ([5cffd55](https://github.com/duyet/monorepo/commit/5cffd5561f939e0ffa70fafeae76e72b76768049))
* **ssg:** pin one React copy so all Pages apps prerender ([#1298](https://github.com/duyet/monorepo/issues/1298)) ([a530f6f](https://github.com/duyet/monorepo/commit/a530f6f1737fffb684b370eb434b693478debd07))

## [0.1.4](https://github.com/duyet/monorepo/compare/v0.1.3...v0.1.4) (2026-08-14)


### ✨ Features

* **blog:** add CLI tab and new model-detect screenshot to AnyRouter post ([a2ef9c0](https://github.com/duyet/monorepo/commit/a2ef9c0845a1059804dd02dc2189809fa40b977c))
* **blog:** anyrouter launch post, code tabs, diff lines, copy button ([a639cb9](https://github.com/duyet/monorepo/commit/a639cb9881a59f450874efa1e3fb60479a4106fa))
* **blog:** bento image grid for post screenshots, applied to oma post ([c00ff63](https://github.com/duyet/monorepo/commit/c00ff6313015d33557bed681697433a3e05d0780))
* **blog:** comment on x link from post frontmatter ([655fbda](https://github.com/duyet/monorepo/commit/655fbda5efed10a91a7b074e94c754d18b056b15))
* **blog:** oma post dark hero thumbnail + landing dialog screenshots ([be9a056](https://github.com/duyet/monorepo/commit/be9a05676585b6605f412333cc995b825a3d5489))
* **blog:** oma post new thumbnail, anyrouter desc matches tweet ([4cbeca6](https://github.com/duyet/monorepo/commit/4cbeca6300b1f7476f7c0394106d7878bb0c757e))
* **blog:** publish Open Managed Agents build-log post ([2f06cb2](https://github.com/duyet/monorepo/commit/2f06cb294aeca069fea44225f28b98772250c143))
* **burns:** logos-only source row, per-agent hover breakdown, layout tweaks ([00d9b3d](https://github.com/duyet/monorepo/commit/00d9b3dde3164e865f1aef99732c66b62553391d))
* **burns:** per-agent hover tooltips for bars and logos ([64d4827](https://github.com/duyet/monorepo/commit/64d482740fc2006c005288e932aa11857fa55f8c))
* **home:** link blog posts from project cards ([f3be69d](https://github.com/duyet/monorepo/commit/f3be69d3a2743324dbd7ec8a4be9fce5433f765a))
* **kb:** obsidian-style sigma knowledge graph ([1970274](https://github.com/duyet/monorepo/commit/1970274ce9b9cf620d548cd8aad7eb8736514a39))
* **llm-timeline:** shadcn tabs and switch, semantic timeline table ([6aafade](https://github.com/duyet/monorepo/commit/6aafadedaa2f74e1c511368f1be3905f51dd60b2))
* **ui:** split site header and add official shadcn chat primitives ([634369a](https://github.com/duyet/monorepo/commit/634369a28dc3dd3b3959f6c505b0bf3d5117cea8))


### 🐛 Bug Fixes

* **agents:** resolve assistant graph import and refresh lockfile pins ([015e300](https://github.com/duyet/monorepo/commit/015e30058778fcffb39dfd101c1f0c76a43eccb9))
* **api:** gate llm generate, assistant chat, and ClickHouse URL passwords ([07563ca](https://github.com/duyet/monorepo/commit/07563caabdb6cf257fa0829dd54f488b77c7fc62))
* **blog:** add github issues screenshot to anyrouter post ([763e921](https://github.com/duyet/monorepo/commit/763e9213d5807516de8610a0e3f5e2cbe90fe1e3))
* **blog:** fail build when post HTML is missing ([1825183](https://github.com/duyet/monorepo/commit/1825183eef6565bc6013f5a7f404545436d2f082))
* **blog:** fix typos in anyrouter post ([a0bfbac](https://github.com/duyet/monorepo/commit/a0bfbacc328e6a2ee928003df82379b1bff8f298))
* **blog:** move duyetbot image into img-row with GitHub issues ([cc5207d](https://github.com/duyet/monorepo/commit/cc5207da4da163f3cfba9a048987950efdf531dd))
* **blog:** replace two screenshots in img-row with updated versions ([15b70ad](https://github.com/duyet/monorepo/commit/15b70ad6e45ed1716e0c451f6c80bc6411d813e9))
* **burns:** backfill antigravity and hermes costs from public rates ([322a8be](https://github.com/duyet/monorepo/commit/322a8bef362fe8525b18bd5fe6b57478ce5c8162))
* **burns:** grok estimated costs and logo tooltip above icons ([de030dd](https://github.com/duyet/monorepo/commit/de030dd26e227d88f7cb08e57f4d79b20ce78587))
* **burns:** official brand SVGs, resize Grok, backfill per-source breakdown ([34d514b](https://github.com/duyet/monorepo/commit/34d514bcab1d7f8a9d404aa100a71b9cff894154))
* **burns:** reverse bar chart to chronological left-to-right ([183b237](https://github.com/duyet/monorepo/commit/183b237e1b36e7f8d30ea55a80914a7e16b58e6c))
* **burns:** stop labeling gemini as Antigravity and refresh UX ([61cd768](https://github.com/duyet/monorepo/commit/61cd7683ec67edafe68f203404e390e3b5403b91))
* **burns:** tooltip layout, spacing, and restored Claude tokens ([fa678c1](https://github.com/duyet/monorepo/commit/fa678c123348c40396a0777030b743612d9db70a))
* **ci:** align insights motion version to fix frozen-lockfile install ([83553bb](https://github.com/duyet/monorepo/commit/83553bbfc781493368619b24715bc295012a0c97))
* **deps:** update all non-major dependencies ([#1265](https://github.com/duyet/monorepo/issues/1265)) ([df5cab8](https://github.com/duyet/monorepo/commit/df5cab84e7c18ba73b50bff8153be756840a085d))
* **docs:** close audit issues for docs, seo, and small ux ([92460a1](https://github.com/duyet/monorepo/commit/92460a10278e2b6deec5f2e24fb15a0f28f58344))
* **kb:** escape poisoned asset cache and fix graph SSR ([2a56a9e](https://github.com/duyet/monorepo/commit/2a56a9e9c1072e9073c47e512a571d5160348586))
* **kb:** retry hydration when cloudflare races module load ([0428140](https://github.com/duyet/monorepo/commit/04281401ccadaf0141d483be544dc028f8f42a33))
* **kb:** stop stale html cache breaking module scripts ([3c823f1](https://github.com/duyet/monorepo/commit/3c823f15826ecd253d75073f790596f5e5f06c7f))
* rename anyrouter-issues-new-mode-bg to new-model-bg and update image ([cb47d83](https://github.com/duyet/monorepo/commit/cb47d83ee741671afd2c770d8c07cbc4f3e7d2a9))
* **ui:** show a retryable chat error instead of the raw message ([d9ddba1](https://github.com/duyet/monorepo/commit/d9ddba15ed54182729488853b60659884fde1836))


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
