import { Hono } from "hono";

export const voicesRoute = new Hono();

const VOICES = [
  { id: "b545c585f631496c914815291da4e893", name: "Friendly Women", lang: "en", gender: "female" },
  { id: "802e3bc2b27e49c2995d23ef70e6ac89", name: "Energetic Male", lang: "en", gender: "male" },
  { id: "4f201abba2574feeae11e5ebf737859e", name: "琨琨 (女声)", lang: "zh", gender: "female" },
  { id: "ca8fb681ce2040958c15ede5eef86177", name: "翔洲 (男声)", lang: "zh", gender: "male" },
  { id: "5161d41404314212af1254556477c17d", name: "元気な女性", lang: "ja", gender: "female" },
  { id: "5c71ab35290241ed842d036e4bb0e5da", name: "손정은 (여성)", lang: "ko", gender: "female" },
];

voicesRoute.get("/voices", (c) => {
  const lang = c.req.query("lang");
  const filtered = lang ? VOICES.filter((v) => v.lang === lang) : VOICES;
  return c.json({ voices: filtered });
});
