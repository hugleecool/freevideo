export interface Voice {
  id: string;
  name: string;
  lang: string;
  langLabel: string;
}

export const VOICES: Voice[] = [
  { id: "802e3bc2b27e49c2995d23ef70e6ac89", name: "Female (Default)", lang: "en", langLabel: "English" },
  { id: "e58b0d7efca34b2a85e26d5c0b4b9e24", name: "Male (Energetic)", lang: "en", langLabel: "English" },
  { id: "7f92f8afb8ec43bf81429cc1c9199cb1", name: "女声", lang: "zh", langLabel: "中文" },
  { id: "ad9e6e0f3a3f4b67a1c7e5c2d8f0b9a2", name: "男声", lang: "zh", langLabel: "中文" },
  { id: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6", name: "女性", lang: "ja", langLabel: "日本語" },
  { id: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", name: "여성", lang: "ko", langLabel: "한국어" },
];

export const AVATARS = [
  { id: "ca9c5c22-6dba-4b59-ae3b-d26066f8c017", name: "Mia" },
  { id: "8e39ba82-f209-4299-ba5f-8a3df9f66f21", name: "Noah" },
  { id: "92dd6b16-3aec-45b7-99d2-67307c0bfc42", name: "Emma" },
  { id: "699604d6-6857-4f25-8308-a96e9f6a1fb7", name: "Yuna" },
  { id: "d29fdd29-a917-4ec1-b4a3-fb5a0051fd48", name: "Ryan" },
  { id: "93cc8c1e-da7b-4b78-9fc5-7dd4057775f3", name: "Kenji" },
];
