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
    data/
      use-cases.ts            # 6 use-case page content (marketing/training/etc)
      competitors.ts          # 3 competitor comparison content
    i18n/
      locales.ts              # 7 supported locales, default voice per locale
      messages.ts             # UI translations
      useLocale.ts            # Composable: detect locale from URL/Accept-Language
  public/
    robots.txt                # Allows AI crawlers (GPTBot, ClaudeBot, etc.)
    llms.txt                  # AI search engine metadata
  scripts/
    generate-sitemap.ts       # Build-time sitemap generation

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

## Code Conventions

- TypeScript strict mode
- Path alias: `@/` → `web/src/`
- Dev proxy: `/api` → `localhost:8787`
- Vue SFCs: `<script setup lang="ts">` only
- NO `.js` files in `web/src/` — `vue-tsc -b` is forbidden (it generates stale .js that shadows .ts and breaks Vite resolution). Use `vue-tsc --noEmit` for type checking.

## SEO Strategy (in-flight)

10 indexable pages deployed:
- 1 home (Forever Free AI Talking Avatar Video Generator)
- 6 use cases (`/use-cases/*`): marketing, training, product-demo, education, social-media, ecommerce
- 3 competitor comparisons (`/compare/*`): HeyGen, Synthesia, D-ID

All pages have: unique H1/meta/description, FAQPage+HowTo+BreadcrumbList schema, canonical URLs, embedded VideoGenerator so visitors can use the tool on any page.

Target keywords: "free ai avatar video generator", "heygen alternative", "free talking avatar no watermark".

Strategy doc: Feishu wiki "FreeVideo SEO与海外工具站策略" (wiki/DHLRwZFQWi4b7qkNweMcepJUnYe)

## Configured Secrets (Cloudflare Worker)

- `SPATIALREAL_API_KEY` — SpatialReal API key for session token
- `SPATIALREAL_APP_ID` — `app_mjv344hd_qro0tf`
- `FISH_AUDIO_API_KEY` — Fish Audio billable API key

Local dev: put these in `api/.dev.vars` (gitignored).

## Contact

lihang@spatialwalk.net
