import { Hono } from "hono";

export const voicesRoute = new Hono();

const VOICES = [
  { id: "802e3bc2b27e49c2995d23ef70e6ac89", name: "Default Female", lang: "en" },
  { id: "e58b0d7efca34b2a85e26d5c0b4b9e24", name: "Energetic Male", lang: "en" },
  { id: "7f92f8afb8ec43bf81429cc1c9199cb1", name: "中文女声", lang: "zh" },
  { id: "ad9e6e0f3a3f4b67a1c7e5c2d8f0b9a2", name: "中文男声", lang: "zh" },
  { id: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6", name: "日本語女性", lang: "ja" },
  { id: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", name: "한국어 여성", lang: "ko" },
];

voicesRoute.get("/voices", (c) => {
  const lang = c.req.query("lang");
  const filtered = lang ? VOICES.filter((v) => v.lang === lang) : VOICES;
  return c.json({ voices: filtered });
});
