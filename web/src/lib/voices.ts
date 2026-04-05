export type Gender = "female" | "male";

export interface Voice {
  id: string;
  name: string;
  lang: string;
  langLabel: string;
  gender: Gender;
  /** Short description shown under the voice name */
  style?: string;
}

/**
 * Curated list of Fish Audio voices, 2-3 per supported language.
 * Voice IDs verified against Fish Audio API (https://api.fish.audio/model).
 * Fish Audio S2-Pro auto-detects text language, so any voice can read any language
 * (with the voice's native accent).
 */
export const VOICES: Voice[] = [
  // English
  { id: "b545c585f631496c914815291da4e893", name: "Friendly Women", lang: "en", langLabel: "English", gender: "female", style: "Professional, bright" },
  { id: "802e3bc2b27e49c2995d23ef70e6ac89", name: "Energetic Male", lang: "en", langLabel: "English", gender: "male", style: "Youthful, American" },
  { id: "d8a1340984ee4b63ad1ffae27a6a4339", name: "ELITE", lang: "en", langLabel: "English", gender: "male", style: "Narration, deep" },

  // Chinese
  { id: "4f201abba2574feeae11e5ebf737859e", name: "王琨", lang: "zh", langLabel: "中文", gender: "female", style: "广告播音" },
  { id: "ca8fb681ce2040958c15ede5eef86177", name: "郑翔洲", lang: "zh", langLabel: "中文", gender: "male", style: "专业青年" },
  { id: "7f92f8afb8ec43bf81429cc1c9199cb1", name: "AD学姐", lang: "zh", langLabel: "中文", gender: "female", style: "御姐,舒缓" },

  // Japanese
  { id: "5161d41404314212af1254556477c17d", name: "元気な女性", lang: "ja", langLabel: "日本語", gender: "female", style: "若い,会話的" },
  { id: "8f99ad75c8184f1db0c21d3a906445a4", name: "士道", lang: "ja", langLabel: "日本語", gender: "male", style: "若い,教育的" },
  { id: "fbea303b64374bffb8843569404b095e", name: "まな", lang: "ja", langLabel: "日本語", gender: "female", style: "中年,教育的" },

  // Korean
  { id: "9aae54921dd944948ee08d35f6b5f984", name: "유라", lang: "ko", langLabel: "한국어", gender: "female", style: "젊은, 기쁨" },
  { id: "561686c0427b4656b34b960b05b33e56", name: "호시", lang: "ko", langLabel: "한국어", gender: "male", style: "젊은, 대화적" },
  { id: "5c71ab35290241ed842d036e4bb0e5da", name: "손정은", lang: "ko", langLabel: "한국어", gender: "female", style: "MBC 아나운서" },

  // Spanish
  { id: "60a33602dacc4d899cb671b024e66d8c", name: "Sabio expandido", lang: "es", langLabel: "Español", gender: "female", style: "Educativo" },
  { id: "dfa5b230c8054f429e434f4a6e9bbdec", name: "Farid Dieck", lang: "es", langLabel: "Español", gender: "male", style: "Joven, narrador" },
  { id: "35199d5438854f5d9157c500479ab684", name: "Narrador v2", lang: "es", langLabel: "Español", gender: "male", style: "Narración" },

  // French
  { id: "a288bdc744da4ad194921adad6863175", name: "Clémence", lang: "fr", langLabel: "Français", gender: "female", style: "Jeune, conversationnel" },
  { id: "5567200c7d8341738f0892bbacd3be3c", name: "Féminine", lang: "fr", langLabel: "Français", gender: "female", style: "Conversationnel" },
  { id: "4f2a0684dd0247dda68f339738c780e6", name: "Le narrateur", lang: "fr", langLabel: "Français", gender: "male", style: "Narration" },

  // German
  { id: "88b18e0d81474a0ca08e2ea6f9df5ff4", name: "Christa", lang: "de", langLabel: "Deutsch", gender: "female", style: "Werbung, jung" },
  { id: "c5b66a80d90749fc914c714e793d1a2f", name: "Catrinja", lang: "de", langLabel: "Deutsch", gender: "female", style: "Jung, konversationell" },
  { id: "90042f762dbf49baa2e7776d011eee6b", name: "Vorlesen Stimlagen", lang: "de", langLabel: "Deutsch", gender: "male", style: "Erzählen" },
];

/** Get voices filtered by language. */
export function voicesForLang(lang: string): Voice[] {
  return VOICES.filter((v) => v.lang === lang);
}

/** Get the first matching voice for a language (female preferred). */
export function defaultVoiceForLang(lang: string): Voice | undefined {
  const voices = voicesForLang(lang);
  return voices.find((v) => v.gender === "female") ?? voices[0];
}

// All 28 public avatars from SpatialReal
export const AVATARS = [
  { id: "699604d6-6857-4f25-8308-a96e9f6a1fb7", name: "Yuna" },
  { id: "8e39ba82-f209-4299-ba5f-8a3df9f66f21", name: "Noah" },
  { id: "ca9c5c22-6dba-4b59-ae3b-d26066f8c017", name: "Mia" },
  { id: "92dd6b16-3aec-45b7-99d2-67307c0bfc42", name: "Emma" },
  { id: "d29fdd29-a917-4ec1-b4a3-fb5a0051fd48", name: "Ryan" },
  { id: "93cc8c1e-da7b-4b78-9fc5-7dd4057775f3", name: "Kenji" },
  { id: "067bf019-4234-479d-9b6a-2021e462bcc2", name: "Little Tommy" },
  { id: "1843ff9f-db3a-45de-be28-9c2b9d6412a3", name: "Nathan" },
  { id: "75608523-0d0d-4a2b-840a-dcc06200a4ee", name: "Karim" },
  { id: "6aed28f9-674c-4ffb-89ee-b447b28aa3ed", name: "Joseph" },
  { id: "c067bb81-93cc-4a39-9622-9fb1c593cda6", name: "Dev" },
  { id: "4377b021-51b7-431f-87e1-60905b3138bc", name: "Lucas" },
  { id: "2e9f7531-11dd-4c14-b30e-b6de1e35eb1f", name: "Mark" },
  { id: "6b999495-a224-4bbf-aa69-0ccb4d8079f8", name: "Mateo" },
  { id: "cd5b858d-5cc9-43d0-94e7-27fac075780a", name: "James" },
  { id: "4b119100-4e6d-44bd-a0f8-bc1abc4382ee", name: "Arjun" },
  { id: "675a5f84-288d-4bc7-889d-cef95be01c8b", name: "Oliver" },
  { id: "31ee6a72-170d-4481-9907-d099042b0745", name: "Tasha" },
  { id: "247d2efe-8cae-426a-8303-e6010d047dfe", name: "Thomas" },
  { id: "b8ed9efe-5402-4f71-adc1-3f0bf69b04b2", name: "Rajesh" },
  { id: "7662336d-8eda-4dd0-ae39-5119777679ba", name: "Hans" },
  { id: "14d6c978-dd4d-451b-b05a-c3f889031ec7", name: "Valentina" },
  { id: "2fc89f70-5060-4963-a2d7-4da4cab73c54", name: "Shakespeare" },
  { id: "b6144361-af25-4ef6-8bdc-eb1b7ffae4fd", name: "Jordan" },
  { id: "ab7117a9-f954-44df-8c25-06d28e4f6ec7", name: "Josh" },
  { id: "2a5170ff-8d1f-4d10-ac50-0ab4893df328", name: "Priya" },
  { id: "17a9aed2-4b35-4eb8-8bf2-675a278bd80d", name: "Dr. Kellan" },
  { id: "93dd60f8-d9e2-47cf-973e-d75e10cfc951", name: "Rohan" },
];
