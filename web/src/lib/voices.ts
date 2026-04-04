export interface Voice {
  id: string;
  name: string;
  lang: string;
  langLabel: string;
  gender: "female" | "male";
}

// Verified working Fish Audio voice model IDs (all tested via API)
export const VOICES: Voice[] = [
  { id: "b545c585f631496c914815291da4e893", name: "Friendly Women", lang: "en", langLabel: "English", gender: "female" },
  { id: "802e3bc2b27e49c2995d23ef70e6ac89", name: "Energetic Male", lang: "en", langLabel: "English", gender: "male" },
  { id: "4f201abba2574feeae11e5ebf737859e", name: "琨琨 (女声)", lang: "zh", langLabel: "中文", gender: "female" },
  { id: "ca8fb681ce2040958c15ede5eef86177", name: "翔洲 (男声)", lang: "zh", langLabel: "中文", gender: "male" },
  { id: "5161d41404314212af1254556477c17d", name: "元気な女性", lang: "ja", langLabel: "日本語", gender: "female" },
  { id: "5c71ab35290241ed842d036e4bb0e5da", name: "손정은 (여성)", lang: "ko", langLabel: "한국어", gender: "female" },
];

export const AVATARS = [
  { id: "ca9c5c22-6dba-4b59-ae3b-d26066f8c017", name: "Mia" },
  { id: "8e39ba82-f209-4299-ba5f-8a3df9f66f21", name: "Noah" },
  { id: "92dd6b16-3aec-45b7-99d2-67307c0bfc42", name: "Emma" },
  { id: "699604d6-6857-4f25-8308-a96e9f6a1fb7", name: "Yuna" },
  { id: "d29fdd29-a917-4ec1-b4a3-fb5a0051fd48", name: "Ryan" },
  { id: "93cc8c1e-da7b-4b78-9fc5-7dd4057775f3", name: "Kenji" },
];
