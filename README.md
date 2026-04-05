# FreeVideo

Forever-free AI talking avatar video generator. Type your text, pick a voice and avatar, download your video. No sign-up required.

**Live**: https://freevideo-3gk.pages.dev

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite + vite-ssg + Tailwind 4
- **Backend**: Hono on Cloudflare Workers
- **Avatar SDK**: [@spatialwalk/avatarkit](https://docs.spatialreal.ai) — real-time 3DGS avatars
- **TTS**: [Fish Audio](https://fish.audio) S2-Pro — 80+ languages
- **Recording**: `canvas.captureStream` + `MediaRecorder` (WebM VP9 + Opus)
- **Deployment**: Cloudflare Pages (frontend) + Workers (API)

## Features

- 28 photorealistic AI avatars (powered by SpatialReal)
- 6 voices across English / Chinese / Japanese / Korean (Fish Audio S2-Pro auto-detects 80+ languages)
- Real-time lip-sync with sub-second latency
- Client-side video recording — text never leaves your browser after TTS
- Multi-language UI with per-locale landing pages for SEO

## Development

```bash
pnpm install
pnpm dev          # Frontend on :5188
pnpm dev:api      # Worker API on :8787 (needs api/.dev.vars)
pnpm build        # Static site build with SSG prerendering
pnpm typecheck    # Vue + TypeScript type checking
```

### API keys (for local dev)

Create `api/.dev.vars`:

```
SPATIALREAL_API_KEY=sk-...
SPATIALREAL_APP_ID=app_...
FISH_AUDIO_API_KEY=...
```

## Project Structure

```
web/
  src/
    pages/           # Home, UseCase, Compare
    components/      # VideoGenerator, SiteFooter
    composables/     # useAvatar, useRecorder
    data/            # use-cases, competitors, voices
    i18n/            # locale translations
api/
  src/
    routes/          # session-token, tts, voices
```

## License

Private project for SpatialWalk.
