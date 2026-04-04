import { Hono } from "hono";
import type { Bindings } from "../index";

export const ttsRoute = new Hono<{ Bindings: Bindings }>();

ttsRoute.post("/tts", async (c) => {
  const apiKey = c.env.FISH_AUDIO_API_KEY;
  if (!apiKey) {
    return c.json({ error: "FISH_AUDIO_API_KEY not configured" }, 500);
  }

  const { text, voice, format } = await c.req.json<{
    text: string;
    voice?: string;
    format?: string;
  }>();

  if (!text || text.length > 1500) {
    return c.json({ error: "Text required, max 1500 chars" }, 400);
  }

  const res = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      reference_id: voice || "802e3bc2b27e49c2995d23ef70e6ac89",
      format: format || "pcm",
      sample_rate: 16000,
      model: "s2-pro",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return c.json({ error: `TTS failed: ${err}` }, res.status);
  }

  const contentType =
    format === "mp3" ? "audio/mpeg" : "application/octet-stream";

  return new Response(res.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": res.headers.get("Content-Length") ?? "",
    },
  });
});
