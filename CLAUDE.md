# FreeVideo

Forever-free AI talking avatar video generator. SpatialReal SDK demo + SEO growth engine.

**Live**: https://freevideo-3gk.pages.dev
**API**: https://freevideo-api.hugleecool.workers.dev

## Tech Stack

- **Monorepo**: pnpm workspace
- **Frontend** (`web/`): Vue 3 + TypeScript + Vite + vite-ssg + Tailwind CSS 4
- **Backend** (`api/`): Hono + Cloudflare Workers
- **TTS**: Fish Audio S2-Pro (80+ languages, 21 curated voices across 7 locales)
- **Avatar SDK**: @spatialwalk/avatarkit (SDK Mode) — 28 public avatars
- **Video Recording**: `canvas.captureStream` + `MediaRecorder` (MP4/H.264 preferred, WebM fallback)
- **Audio Sync**: SDK AudioContext tap → MediaStream (perfect A/V sync by construction)
- **SEO**: vite-ssg static pre-rendering + @unhead/vue + JSON-LD structured data
- **Deploy**: Cloudflare Pages (frontend) + Workers (API)

## Commands

```bash
pnpm install           # Install workspace deps
pnpm dev               # Frontend dev server on :5188
pnpm --filter api dev  # Worker API on :8787 (needs api/.dev.vars)
pnpm build             # vite-ssg build + sitemap.xml (output: web/dist/)
pnpm typecheck         # vue-tsc --noEmit across all packages
```

## Project Structure

```
web/
  src/
    pages/
      Home.vue                # Landing + tool (per-locale HTML pre-rendered)
      UseCase.vue             # /use-cases/:slug (6 scenarios)
      Compare.vue             # /compare/:slug (3 competitors)
      BlogPost.vue            # /blog/:slug (pillar articles)
    components/
      VideoGenerator.vue      # Main tool: text + voice + avatar → MP4/WebM
      SiteFooter.vue          # Shared footer with contact + links
    composables/
      useAvatar.ts            # SpatialReal SDK wrapper (lifecycle, connect, send)
      useRecorder.ts          # Canvas+tap-audio → MediaRecorder pipeline
    lib/
      api.ts                  # /api/* client (session-token, tts)
      audio-tap.ts            # Taps SDK's AudioContext for recording
      voices.ts               # 21 Fish Audio voices (7 langs × 2-3 each)
      seo-config.ts           # GSC/Bing verification tokens + CF Analytics beacon
    data/
      use-cases.ts            # 6 use-case page content (marketing/training/etc)
      competitors.ts          # 3 competitor comparison content
      blog-posts.ts           # Blog pillar articles (3800-word guide + future posts)
    i18n/
      locales.ts              # 7 supported locales, default voice per locale
      messages.ts             # UI translations
      useLocale.ts            # Composable: detect locale from URL/Accept-Language
  public/
    robots.txt                # Allows AI crawlers (GPTBot, ClaudeBot, etc.)
    llms.txt                  # AI search engine metadata
    googlea67164b981bad9a5.html # Google Search Console verification
    BingSiteAuth.xml          # Bing Webmaster verification
  scripts/
    generate-sitemap.ts       # Build-time sitemap generation (71 URLs)

api/
  src/
    index.ts                  # Hono app + CORS
    routes/
      session.ts              # POST /api/session-token (SpatialReal JWT)
      tts.ts                  # POST /api/tts (Fish Audio proxy, PCM stream)
      voices.ts               # GET /api/voices (metadata)
```

## Key Design Decisions

- **vite-ssg pre-rendering**: Every route outputs a static HTML with SEO content. SPA hydrates after. Critical for AI search engines that don't execute JS.
- **Audio tap, not re-encoding**: SDK plays audio through its own AudioContext. We tap that AudioContext directly via `installAudioTap()` → `MediaStreamDestination`, so MediaRecorder sees the exact audio the user hears. A/V sync is guaranteed because both video (canvas) and audio (tap) share SDK's clock.
- **Target size = CSS size**: SDK canvas buffer is Retina (e.g. 1408×1408) but rendered content is CSS size (e.g. 512×512). Exporting buffer size produces oversized blurry video; exporting CSS size matches SDK's intended quality.
- **Per-locale routing**: `/` → English, `/zh/` → Chinese, etc. Each locale has pre-rendered HTML with native meta tags + JSON-LD. Default voice per locale matches native language.
- **Downscale pipeline for export**: `sdkCanvas.captureStream()` → `<video>` → 2D canvas (resized to CSS display size, max 720) → `captureStream()` → `MediaRecorder`. Avoids Retina-scale bloat; bitrate 1-4 Mbps (base 2 Mbps @ 512×512, sqrt-scaled). Default avatar: Yuna (female, appears first in AVATARS list).

## Code Conventions

- TypeScript strict mode
- Path alias: `@/` → `web/src/`
- Dev proxy: `/api` → `localhost:8787`
- Vue SFCs: `<script setup lang="ts">` only
- NO `.js` files in `web/src/` — `vue-tsc -b` is forbidden (it generates stale .js that shadows .ts and breaks Vite resolution). Use `vue-tsc --noEmit` for type checking.

## SEO Strategy (live)

**71 URLs in sitemap** = 10 logical pages × 7 locales + 1 blog post:
- 1 home (Forever Free AI Talking Avatar Video Generator)
- 6 use cases (`/use-cases/*`): marketing, training, product-demo, education, social-media, ecommerce
- 3 competitor comparisons (`/compare/*`): HeyGen, Synthesia, D-ID
- 1 blog pillar article (`/blog/ai-avatar-video-guide`, 3800 words, 10 sections, Article+FAQPage+BreadcrumbList schema)

All pages have: unique H1/meta/description, FAQPage+HowTo+BreadcrumbList schema, canonical URLs, embedded VideoGenerator so visitors can use the tool on any page.

**Submitted to:**
- Google Search Console (verified via HTML file, sitemap submitted 2026-04-05)
- Bing Webmaster Tools (verified via BingSiteAuth.xml)

Target keywords: "free ai avatar video generator", "heygen alternative", "free talking avatar no watermark".

Strategy doc: Feishu wiki "FreeVideo SEO与海外工具站策略" (wiki/DHLRwZFQWi4b7qkNweMcepJUnYe)

## Pending TODOs (by ROI)

**P0 — Cost protection (ship ASAP):**
- Turnstile CAPTCHA on `/api/tts` endpoint (Fish Audio is pay-per-char, abuse risk real)
- Workers rate limiting: 2/min + 20/day per IP

**P0 — Viral growth (every download = free ad):**
- Video watermark "Made with FreeVideo" overlay in `useRecorder`'s draw loop
- Share buttons after generation (X/LinkedIn/WeChat copy-link)

**P1 — Conversion optimization:**
- Voice preview: ▶️ button per voice playing a 5s sample (21 pre-recorded clips on CDN)
- Avatar thumbnails (replace name buttons with 60×60 face images from SpatialReal CDN)
- Analytics event tracking: text-input rate, generate-click rate, success rate, download rate, voice/avatar distribution

**P1 — Reliability:**
- Error recovery UX: insufficient-credits fallback, SDK disconnect retry
- Cache reuse: same text+voice+avatar → serve cached video within 1h (Cloudflare KV hash → URL)

**P2 — Content + distribution:**
- Expand FAQ to 15 Q&As (long-tail SEO keywords)
- Blog sub-articles (5 more clustered around existing pillar)
- og:image social share graphics (per-page with dynamic text)
- Product Hunt launch prep (gallery images + 30s demo video)
- Tool directory submissions (AlternativeTo, FutureTools, ToolPilot)
- Custom domain binding (candidates: freetalker.ai, freeavatar.video, chattava.com)

**P2 — Monetization runway:**
- "Pro tier coming soon" email capture (HD export, no watermark, custom avatars, API)
- Embed widget for third-party sites (`<iframe>`)

## Configured Secrets (Cloudflare Worker)

- `SPATIALREAL_API_KEY` — SpatialReal API key for session token
- `SPATIALREAL_APP_ID` — `app_mjv344hd_qro0tf`
- `FISH_AUDIO_API_KEY` — Fish Audio billable API key

Local dev: put these in `api/.dev.vars` (gitignored).

## Contact

lihang@spatialwalk.net
