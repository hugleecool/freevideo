export interface Voice {
  id: string;
  name: string;
  lang: string;
  langLabel: string;
  gender: "female" | "male";
}

// Verified working Fish Audio voice model IDs (all tested via API)
export const VOICES: Voice[] = [
  { id: "802e3bc2b27e49c2995d23ef70e6ac89", name: "Energetic Male", lang: "en", langLabel: "English", gender: "male" },
  { id: "b545c585f631496c914815291da4e893", name: "Friendly Women", lang: "en", langLabel: "English", gender: "female" },
  { id: "ca8fb681ce2040958c15ede5eef86177", name: "翔洲 (男声)", lang: "zh", langLabel: "中文", gender: "male" },
  { id: "4f201abba2574feeae11e5ebf737859e", name: "琨琨 (女声)", lang: "zh", langLabel: "中文", gender: "female" },
  { id: "5161d41404314212af1254556477c17d", name: "元気な女性", lang: "ja", langLabel: "日本語", gender: "female" },
  { id: "5c71ab35290241ed842d036e4bb0e5da", name: "손정은 (여성)", lang: "ko", langLabel: "한국어", gender: "female" },
];

// All 28 public avatars from SpatialReal
export const AVATARS = [
  { id: "8e39ba82-f209-4299-ba5f-8a3df9f66f21", name: "Noah" },
  { id: "ca9c5c22-6dba-4b59-ae3b-d26066f8c017", name: "Mia" },
  { id: "92dd6b16-3aec-45b7-99d2-67307c0bfc42", name: "Emma" },
  { id: "d29fdd29-a917-4ec1-b4a3-fb5a0051fd48", name: "Ryan" },
  { id: "699604d6-6857-4f25-8308-a96e9f6a1fb7", name: "Yuna" },
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
