import type { Locale } from "./locales";

export interface Messages {
  // SEO head
  home_title: string;
  home_description: string;
  home_og_title: string;
  home_og_description: string;

  // Hero
  hero_h1: string;
  hero_subtitle: string;

  // Generator
  gen_text_label: string;
  gen_text_placeholder: string;
  gen_voice_label: string;
  gen_avatar_label: string;
  gen_button: string;
  gen_generate_another: string;
  gen_downloading: string;
  gen_download_video: string;
  gen_connecting: string;
  gen_generating_speech: string;
  gen_speaking: string;
  gen_recording: string;
  gen_encoding: string;
  gen_done: string;
  gen_no_close_hint: string;
  gen_connecting_hint: string;
  gen_try_again: string;
  gen_char_count: string; // e.g. "{count}/{max} chars"
  gen_estimated_duration: string; // e.g. "~{secs}s video"

  // SEO content (below fold)
  why_title: string;
  why_item_1: string;
  why_item_2: string;
  why_item_3: string;
  why_item_4: string;
  why_item_5: string;
  how_title: string;
  how_step_1: string;
  how_step_2: string;
  how_step_3: string;
  how_step_4: string;
  powered_by: string;

  // Language switcher
  language_label: string;
}

const en: Messages = {
  home_title: "Free AI Talking Avatar Video Generator — Forever Free, No Sign-up",
  home_description:
    "Create talking avatar videos for free. Type your text, pick an AI avatar, and download a video in seconds. 80+ languages, no sign-up, forever free. Powered by SpatialReal SDK.",
  home_og_title: "FreeVideo — Forever Free AI Talking Avatar Video Generator",
  home_og_description:
    "Type text, get a talking AI avatar video. 80+ languages, forever free, no sign-up required.",

  hero_h1: "Forever Free Talking AI Avatar",
  hero_subtitle: "Type text. Pick an avatar. Download a video. No sign-up, no watermark, no time limits.",

  gen_text_label: "Your text",
  gen_text_placeholder: "Type what you want the avatar to say…",
  gen_voice_label: "Voice",
  gen_avatar_label: "Avatar",
  gen_button: "Generate Free Video",
  gen_generate_another: "✓ Generate Another",
  gen_downloading: "Downloading…",
  gen_download_video: "⬇ Download Video",
  gen_connecting: "Connecting to avatar service…",
  gen_generating_speech: "Generating speech…",
  gen_speaking: "Avatar speaking…",
  gen_recording: "Recording video…",
  gen_encoding: "Encoding…",
  gen_done: "Video ready!",
  gen_no_close_hint: "Please don't close this page while generating.",
  gen_connecting_hint: "Establishing WebSocket connection to avatar service…",
  gen_try_again: "Try again",
  gen_char_count: "{count}/{max} chars",
  gen_estimated_duration: "~{secs}s video",

  why_title: "Why FreeVideo?",
  why_item_1: "100% free — no credit card, no sign-up required",
  why_item_2: "80+ languages with natural-sounding voices",
  why_item_3: "28 photorealistic AI avatars powered by SpatialReal SDK",
  why_item_4: "Download as video — use anywhere",
  why_item_5: "Runs in your browser — your text stays private",

  how_title: "How it works",
  how_step_1: "Type or paste the text you want the avatar to say",
  how_step_2: "Choose a voice and language (80+ languages supported)",
  how_step_3: "Select an AI avatar from our library",
  how_step_4: "Click Generate — your video is ready in seconds",

  powered_by: "Powered by",
  language_label: "Language",
};

const zh: Messages = {
  home_title: "免费 AI 数字人说话视频生成器 — 永久免费,无需注册",
  home_description:
    "免费创建数字人说话视频。输入文字,选择 AI 形象,几秒钟下载视频。支持 80+ 语言,无需注册,永久免费。由 SpatialReal SDK 驱动。",
  home_og_title: "FreeVideo — 永久免费的 AI 数字人说话视频生成器",
  home_og_description: "输入文字,生成数字人说话视频。80+ 语言,永久免费,无需注册。",

  hero_h1: "永久免费的 AI 数字人说话视频",
  hero_subtitle: "输入文字,选择形象,下载视频。无需注册,无水印,无时长限制。",

  gen_text_label: "你的文字",
  gen_text_placeholder: "输入想让数字人说的话…",
  gen_voice_label: "声音",
  gen_avatar_label: "形象",
  gen_button: "免费生成视频",
  gen_generate_another: "✓ 再生成一个",
  gen_downloading: "下载中…",
  gen_download_video: "⬇ 下载视频",
  gen_connecting: "连接数字人服务中…",
  gen_generating_speech: "生成语音中…",
  gen_speaking: "数字人说话中…",
  gen_recording: "录制视频中…",
  gen_encoding: "编码中…",
  gen_done: "视频已生成!",
  gen_no_close_hint: "生成过程中请勿关闭页面。",
  gen_connecting_hint: "正在建立与数字人服务的 WebSocket 连接…",
  gen_try_again: "重试",
  gen_char_count: "{count}/{max} 字",
  gen_estimated_duration: "约 {secs} 秒视频",

  why_title: "为什么选 FreeVideo?",
  why_item_1: "100% 免费 — 无需信用卡,无需注册",
  why_item_2: "80+ 语言,自然流畅的声音",
  why_item_3: "28 个逼真的 AI 形象,由 SpatialReal SDK 驱动",
  why_item_4: "下载视频 — 随处使用",
  why_item_5: "在浏览器中运行 — 你的文字完全私密",

  how_title: "使用步骤",
  how_step_1: "输入或粘贴想让数字人说的文字",
  how_step_2: "选择声音和语言(支持 80+ 语言)",
  how_step_3: "从形象库中选择一个 AI 形象",
  how_step_4: "点击生成 — 几秒后视频就绪",

  powered_by: "技术支持",
  language_label: "语言",
};

const ja: Messages = {
  home_title: "無料 AI アバター動画生成ツール — 永久無料、登録不要",
  home_description:
    "無料でアバターの話す動画を作成。テキストを入力し、AI アバターを選ぶだけで、数秒で動画をダウンロード。80+ 言語対応、登録不要、永久無料。SpatialReal SDK 搭載。",
  home_og_title: "FreeVideo — 永久無料の AI アバター動画生成ツール",
  home_og_description: "テキストを入力して、AI アバターの話す動画を生成。80+ 言語、永久無料、登録不要。",

  hero_h1: "永久無料の AI アバター動画",
  hero_subtitle: "テキスト入力、アバター選択、動画ダウンロード。登録不要、透かしなし、時間制限なし。",

  gen_text_label: "テキスト",
  gen_text_placeholder: "アバターに話させたいテキストを入力…",
  gen_voice_label: "声",
  gen_avatar_label: "アバター",
  gen_button: "無料で動画を生成",
  gen_generate_another: "✓ もう一度生成",
  gen_downloading: "ダウンロード中…",
  gen_download_video: "⬇ 動画をダウンロード",
  gen_connecting: "アバターサービスに接続中…",
  gen_generating_speech: "音声生成中…",
  gen_speaking: "アバターが話しています…",
  gen_recording: "動画を録画中…",
  gen_encoding: "エンコード中…",
  gen_done: "動画ができました!",
  gen_no_close_hint: "生成中はこのページを閉じないでください。",
  gen_connecting_hint: "アバターサービスへの WebSocket 接続を確立中…",
  gen_try_again: "再試行",
  gen_char_count: "{count}/{max} 文字",
  gen_estimated_duration: "約 {secs} 秒の動画",

  why_title: "FreeVideo を選ぶ理由",
  why_item_1: "100% 無料 — クレジットカード不要、登録不要",
  why_item_2: "80+ 言語、自然な音声",
  why_item_3: "28 のリアルな AI アバター、SpatialReal SDK 搭載",
  why_item_4: "動画ダウンロード — どこでも使える",
  why_item_5: "ブラウザで動作 — テキストは完全にプライベート",

  how_title: "使い方",
  how_step_1: "アバターに話させたいテキストを入力",
  how_step_2: "声と言語を選択(80+ 言語対応)",
  how_step_3: "ライブラリから AI アバターを選択",
  how_step_4: "生成をクリック — 数秒で動画が完成",

  powered_by: "提供",
  language_label: "言語",
};

const ko: Messages = {
  home_title: "무료 AI 아바타 말하는 영상 생성기 — 영구 무료, 가입 불필요",
  home_description:
    "무료로 아바타 말하는 영상을 만들어보세요. 텍스트를 입력하고 AI 아바타를 선택하면 몇 초 안에 영상이 생성됩니다. 80+ 언어 지원, 가입 불필요, 영구 무료. SpatialReal SDK 기반.",
  home_og_title: "FreeVideo — 영구 무료 AI 아바타 영상 생성기",
  home_og_description: "텍스트 입력, AI 아바타 영상 생성. 80+ 언어, 영구 무료, 가입 불필요.",

  hero_h1: "영구 무료 AI 아바타 영상",
  hero_subtitle: "텍스트 입력, 아바타 선택, 영상 다운로드. 가입 불필요, 워터마크 없음, 시간 제한 없음.",

  gen_text_label: "텍스트",
  gen_text_placeholder: "아바타가 말할 내용을 입력하세요…",
  gen_voice_label: "음성",
  gen_avatar_label: "아바타",
  gen_button: "무료 영상 생성",
  gen_generate_another: "✓ 다시 생성",
  gen_downloading: "다운로드 중…",
  gen_download_video: "⬇ 영상 다운로드",
  gen_connecting: "아바타 서비스 연결 중…",
  gen_generating_speech: "음성 생성 중…",
  gen_speaking: "아바타가 말하는 중…",
  gen_recording: "영상 녹화 중…",
  gen_encoding: "인코딩 중…",
  gen_done: "영상이 준비되었습니다!",
  gen_no_close_hint: "생성 중에는 페이지를 닫지 마세요.",
  gen_connecting_hint: "아바타 서비스에 WebSocket 연결 중…",
  gen_try_again: "다시 시도",
  gen_char_count: "{count}/{max}자",
  gen_estimated_duration: "약 {secs}초 영상",

  why_title: "왜 FreeVideo인가요?",
  why_item_1: "100% 무료 — 신용카드, 가입 불필요",
  why_item_2: "80+ 언어, 자연스러운 음성",
  why_item_3: "28개의 사실적인 AI 아바타, SpatialReal SDK 기반",
  why_item_4: "영상 다운로드 — 어디서나 사용",
  why_item_5: "브라우저에서 실행 — 텍스트는 완전히 비공개",

  how_title: "사용 방법",
  how_step_1: "아바타가 말할 텍스트를 입력",
  how_step_2: "음성과 언어 선택(80+ 언어 지원)",
  how_step_3: "라이브러리에서 AI 아바타 선택",
  how_step_4: "생성 클릭 — 몇 초 안에 영상 완성",

  powered_by: "기술 지원",
  language_label: "언어",
};

const es: Messages = {
  home_title: "Generador de Video con Avatar IA Gratis — Siempre Gratis, Sin Registro",
  home_description:
    "Crea videos de avatares hablando gratis. Escribe tu texto, elige un avatar IA y descarga un video en segundos. Más de 80 idiomas, sin registro, siempre gratis. Con tecnología SpatialReal SDK.",
  home_og_title: "FreeVideo — Generador de Video con Avatar IA Siempre Gratis",
  home_og_description: "Escribe texto, obtén un video con avatar IA. 80+ idiomas, siempre gratis, sin registro.",

  hero_h1: "Avatar IA Hablando Siempre Gratis",
  hero_subtitle: "Escribe texto. Elige avatar. Descarga video. Sin registro, sin marca de agua, sin límites.",

  gen_text_label: "Tu texto",
  gen_text_placeholder: "Escribe lo que quieres que diga el avatar…",
  gen_voice_label: "Voz",
  gen_avatar_label: "Avatar",
  gen_button: "Generar Video Gratis",
  gen_generate_another: "✓ Generar Otro",
  gen_downloading: "Descargando…",
  gen_download_video: "⬇ Descargar Video",
  gen_connecting: "Conectando al servicio…",
  gen_generating_speech: "Generando audio…",
  gen_speaking: "Avatar hablando…",
  gen_recording: "Grabando video…",
  gen_encoding: "Codificando…",
  gen_done: "¡Video listo!",
  gen_no_close_hint: "No cierres esta página mientras se genera.",
  gen_connecting_hint: "Estableciendo conexión WebSocket…",
  gen_try_again: "Reintentar",
  gen_char_count: "{count}/{max} caracteres",
  gen_estimated_duration: "~{secs}s video",

  why_title: "¿Por qué FreeVideo?",
  why_item_1: "100% gratis — sin tarjeta de crédito, sin registro",
  why_item_2: "80+ idiomas con voces naturales",
  why_item_3: "28 avatares IA fotorrealistas por SpatialReal SDK",
  why_item_4: "Descarga video — usa donde quieras",
  why_item_5: "Se ejecuta en tu navegador — tu texto es privado",

  how_title: "Cómo funciona",
  how_step_1: "Escribe o pega el texto que quieres que diga el avatar",
  how_step_2: "Elige voz e idioma (80+ idiomas)",
  how_step_3: "Selecciona un avatar IA de nuestra biblioteca",
  how_step_4: "Haz clic en Generar — tu video está listo en segundos",

  powered_by: "Impulsado por",
  language_label: "Idioma",
};

const fr: Messages = {
  home_title: "Générateur Vidéo Avatar IA Gratuit — Gratuit Pour Toujours, Sans Inscription",
  home_description:
    "Créez des vidéos d'avatars parlants gratuitement. Saisissez votre texte, choisissez un avatar IA et téléchargez une vidéo en quelques secondes. 80+ langues, sans inscription, gratuit pour toujours. Propulsé par SpatialReal SDK.",
  home_og_title: "FreeVideo — Générateur Vidéo Avatar IA Gratuit Pour Toujours",
  home_og_description: "Saisissez du texte, obtenez une vidéo avatar IA. 80+ langues, gratuit, sans inscription.",

  hero_h1: "Avatar IA Parlant Gratuit Pour Toujours",
  hero_subtitle: "Saisissez du texte. Choisissez un avatar. Téléchargez une vidéo. Sans inscription, sans filigrane.",

  gen_text_label: "Votre texte",
  gen_text_placeholder: "Saisissez ce que l'avatar doit dire…",
  gen_voice_label: "Voix",
  gen_avatar_label: "Avatar",
  gen_button: "Générer Vidéo Gratuite",
  gen_generate_another: "✓ Générer Une Autre",
  gen_downloading: "Téléchargement…",
  gen_download_video: "⬇ Télécharger Vidéo",
  gen_connecting: "Connexion au service…",
  gen_generating_speech: "Génération audio…",
  gen_speaking: "Avatar en train de parler…",
  gen_recording: "Enregistrement vidéo…",
  gen_encoding: "Encodage…",
  gen_done: "Vidéo prête !",
  gen_no_close_hint: "Ne fermez pas cette page pendant la génération.",
  gen_connecting_hint: "Établissement de la connexion WebSocket…",
  gen_try_again: "Réessayer",
  gen_char_count: "{count}/{max} caractères",
  gen_estimated_duration: "~{secs}s vidéo",

  why_title: "Pourquoi FreeVideo ?",
  why_item_1: "100% gratuit — pas de carte bancaire, pas d'inscription",
  why_item_2: "80+ langues avec voix naturelles",
  why_item_3: "28 avatars IA photoréalistes via SpatialReal SDK",
  why_item_4: "Téléchargez la vidéo — utilisez n'importe où",
  why_item_5: "Tourne dans votre navigateur — votre texte reste privé",

  how_title: "Comment ça marche",
  how_step_1: "Saisissez ou collez le texte que l'avatar doit dire",
  how_step_2: "Choisissez une voix et une langue (80+ langues)",
  how_step_3: "Sélectionnez un avatar IA dans notre bibliothèque",
  how_step_4: "Cliquez sur Générer — vidéo prête en quelques secondes",

  powered_by: "Propulsé par",
  language_label: "Langue",
};

const de: Messages = {
  home_title: "Kostenloser KI-Avatar-Video-Generator — Für Immer Kostenlos, Keine Anmeldung",
  home_description:
    "Erstelle kostenlos sprechende Avatar-Videos. Gib deinen Text ein, wähle einen KI-Avatar und lade ein Video in Sekunden herunter. 80+ Sprachen, keine Anmeldung, für immer kostenlos. Angetrieben von SpatialReal SDK.",
  home_og_title: "FreeVideo — Für Immer Kostenloser KI-Avatar-Video-Generator",
  home_og_description: "Text eingeben, KI-Avatar-Video erhalten. 80+ Sprachen, immer kostenlos, keine Anmeldung.",

  hero_h1: "Für Immer Kostenloser KI-Avatar",
  hero_subtitle: "Text eingeben. Avatar wählen. Video herunterladen. Keine Anmeldung, kein Wasserzeichen.",

  gen_text_label: "Dein Text",
  gen_text_placeholder: "Gib ein, was der Avatar sagen soll…",
  gen_voice_label: "Stimme",
  gen_avatar_label: "Avatar",
  gen_button: "Kostenloses Video Generieren",
  gen_generate_another: "✓ Weiteres Generieren",
  gen_downloading: "Herunterladen…",
  gen_download_video: "⬇ Video Herunterladen",
  gen_connecting: "Verbindung zum Avatar-Dienst…",
  gen_generating_speech: "Audio wird generiert…",
  gen_speaking: "Avatar spricht…",
  gen_recording: "Video wird aufgenommen…",
  gen_encoding: "Kodierung…",
  gen_done: "Video fertig!",
  gen_no_close_hint: "Bitte diese Seite während der Generierung nicht schließen.",
  gen_connecting_hint: "WebSocket-Verbindung wird hergestellt…",
  gen_try_again: "Erneut versuchen",
  gen_char_count: "{count}/{max} Zeichen",
  gen_estimated_duration: "~{secs}s Video",

  why_title: "Warum FreeVideo?",
  why_item_1: "100% kostenlos — keine Kreditkarte, keine Anmeldung",
  why_item_2: "80+ Sprachen mit natürlich klingenden Stimmen",
  why_item_3: "28 fotorealistische KI-Avatare, angetrieben von SpatialReal SDK",
  why_item_4: "Video herunterladen — überall verwenden",
  why_item_5: "Läuft in deinem Browser — dein Text bleibt privat",

  how_title: "So funktioniert's",
  how_step_1: "Gib den Text ein, den der Avatar sagen soll",
  how_step_2: "Wähle Stimme und Sprache (80+ Sprachen)",
  how_step_3: "Wähle einen KI-Avatar aus unserer Bibliothek",
  how_step_4: "Klick auf Generieren — Video ist in Sekunden fertig",

  powered_by: "Bereitgestellt von",
  language_label: "Sprache",
};

export const MESSAGES: Record<Locale, Messages> = { en, zh, ja, ko, es, fr, de };

export function t(locale: Locale, key: keyof Messages, vars?: Record<string, string | number>): string {
  const template = MESSAGES[locale]?.[key] ?? MESSAGES.en[key];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
