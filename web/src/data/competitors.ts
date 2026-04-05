export interface Competitor {
  slug: string;
  name: string;
  title: string;
  h1: string;
  metaDescription: string;
  intro: string;
  comparison: { feature: string; competitor: string; freevideo: string }[];
  whyFreeVideo: string[];
  faqs: { q: string; a: string }[];
}

export const COMPETITORS: Competitor[] = [
  {
    slug: "heygen-alternative",
    name: "HeyGen",
    title: "Free HeyGen Alternative — FreeVideo",
    h1: "Free HeyGen Alternative: AI Talking Avatar Videos",
    metaDescription:
      "Looking for a free alternative to HeyGen? FreeVideo offers unlimited AI talking avatar video generation. 74+ languages, no sign-up, no watermark.",
    intro:
      "HeyGen is one of the most popular AI avatar video generators, but its free plan is limited to 1 minute of video and adds watermarks. FreeVideo is a forever-free alternative with no time limits, no watermark, and no sign-up — powered by SpatialReal's real-time AI avatar infrastructure. If you're looking to generate AI avatar videos without paying $24-$89/month, FreeVideo is the simplest option.",
    comparison: [
      { feature: "Free tier duration", competitor: "1 minute / month", freevideo: "Unlimited" },
      { feature: "Watermark on free tier", competitor: "Yes", freevideo: "No" },
      { feature: "Sign-up required", competitor: "Yes", freevideo: "No" },
      { feature: "Number of avatars", competitor: "120+", freevideo: "28" },
      { feature: "Languages supported", competitor: "175+", freevideo: "74+" },
      { feature: "Starting paid price", competitor: "$24/month", freevideo: "$0 forever" },
      { feature: "Commercial use", competitor: "Paid tier only", freevideo: "Always allowed" },
    ],
    whyFreeVideo: [
      "Zero cost forever — no trial, no credit card",
      "No sign-up means instant access — start creating in seconds",
      "Browser-based — your text stays private, nothing uploaded to a server except for TTS",
      "Open source frontend (github.com/hugleecool/freevideo) — you can inspect the code",
      "Powered by SpatialReal — an infrastructure-grade AI avatar platform",
    ],
    faqs: [
      {
        q: "Is FreeVideo as good as HeyGen?",
        a: "For basic talking avatar videos, FreeVideo delivers comparable quality using the SpatialReal SDK. HeyGen has more avatars and features like custom avatar creation, but costs $24-$89/month.",
      },
      {
        q: "Can I create custom avatars like on HeyGen?",
        a: "Not yet. FreeVideo currently uses 28 pre-built photorealistic avatars. HeyGen offers custom avatar creation for paid users. For enterprise custom avatars, contact SpatialReal directly.",
      },
      {
        q: "Does FreeVideo have watermarks like HeyGen's free tier?",
        a: "No. Videos generated with FreeVideo have no watermark, even on the free tier (which is the only tier — it's forever free).",
      },
      {
        q: "Can I use FreeVideo for commercial projects?",
        a: "Yes, always. HeyGen restricts commercial use to paid plans. FreeVideo allows commercial use on any video you generate.",
      },
    ],
  },
  {
    slug: "synthesia-alternative",
    name: "Synthesia",
    title: "Free Synthesia Alternative — FreeVideo",
    h1: "Free Synthesia Alternative: AI Avatar Videos Without Paying",
    metaDescription:
      "Free alternative to Synthesia for AI avatar video generation. No sign-up, no watermark, 74+ languages. Perfect for small teams and solo creators.",
    intro:
      "Synthesia is a leading enterprise AI video platform starting at $29/month, primarily targeting corporate training and onboarding use cases. FreeVideo is a forever-free alternative designed for solo creators, small teams, and anyone who wants AI avatar videos without a subscription. No sign-up, no watermark, unlimited generations — powered by SpatialReal's real-time avatar infrastructure.",
    comparison: [
      { feature: "Starting price", competitor: "$29/month", freevideo: "$0 forever" },
      { feature: "Free tier", competitor: "No (trial only)", freevideo: "Unlimited" },
      { feature: "Sign-up required", competitor: "Yes", freevideo: "No" },
      { feature: "Number of avatars", competitor: "230+", freevideo: "28" },
      { feature: "Languages", competitor: "140+", freevideo: "74+" },
      { feature: "Custom avatars", competitor: "Paid add-on", freevideo: "Not available" },
      { feature: "Team collaboration", competitor: "Yes (paid)", freevideo: "Not needed — download & share" },
    ],
    whyFreeVideo: [
      "No subscription — ideal for occasional use without recurring costs",
      "Zero friction — open, type, generate, download",
      "Perfect for solo creators and small teams",
      "Browser-based rendering — no account, no upload, more privacy",
      "Download MP4 files you can use anywhere",
    ],
    faqs: [
      {
        q: "Is FreeVideo for enterprise like Synthesia?",
        a: "No. Synthesia is designed for enterprises with team collaboration, SOC 2 compliance, and 230+ avatars. FreeVideo is designed for individuals and small teams who want simple, free AI avatar videos.",
      },
      {
        q: "Can I get custom avatars like on Synthesia?",
        a: "FreeVideo does not offer custom avatars. For enterprise custom avatar needs, contact SpatialReal (which powers FreeVideo) directly.",
      },
      {
        q: "Does FreeVideo support the same languages as Synthesia?",
        a: "FreeVideo supports 74+ languages via Fish Audio S2-Pro TTS. Synthesia supports 140+ languages. For most common languages (English, Chinese, Japanese, Korean, Spanish, etc.), both work.",
      },
      {
        q: "Can I cancel easily if I switch back to Synthesia?",
        a: "There's nothing to cancel with FreeVideo — no subscription, no account. Just stop using it.",
      },
    ],
  },
  {
    slug: "d-id-alternative",
    name: "D-ID",
    title: "Free D-ID Alternative — FreeVideo",
    h1: "Free D-ID Alternative: AI Talking Avatar Videos",
    metaDescription:
      "Looking for a free D-ID alternative? FreeVideo generates AI talking avatar videos for free, no sign-up, no watermark, 74+ languages.",
    intro:
      "D-ID is known for its AI video creation tools and API, with plans starting at $5.99/month but limited to 10 minutes/month. FreeVideo is a completely free alternative with unlimited generations, no sign-up required, and no credit system. If you need AI talking avatar videos without worrying about monthly credits, FreeVideo is the simpler choice.",
    comparison: [
      { feature: "Free credits", competitor: "5 min trial only", freevideo: "Unlimited" },
      { feature: "Starting paid price", competitor: "$5.99/month (10 min)", freevideo: "$0 forever" },
      { feature: "Sign-up required", competitor: "Yes", freevideo: "No" },
      { feature: "Credit system", competitor: "Yes (limits)", freevideo: "No limits" },
      { feature: "Languages", competitor: "100+", freevideo: "74+" },
      { feature: "Custom avatars from photos", competitor: "Yes", freevideo: "Not available" },
      { feature: "API access", competitor: "Yes (paid)", freevideo: "Via SpatialReal SDK" },
    ],
    whyFreeVideo: [
      "No credit system — generate as many videos as you need",
      "No monthly fees — ever",
      "No account creation — instant access",
      "Photorealistic avatars from SpatialReal",
      "Browser-based and privacy-focused",
    ],
    faqs: [
      {
        q: "Can I upload my own photo to create an avatar like D-ID?",
        a: "Not currently. D-ID's core feature is generating avatars from photos. FreeVideo uses 28 pre-built avatars. For custom avatar creation, contact SpatialReal directly.",
      },
      {
        q: "Is the video quality comparable to D-ID?",
        a: "For pre-built talking avatars, FreeVideo quality is competitive. D-ID's advantage is photo-to-avatar generation; FreeVideo's advantage is zero cost.",
      },
      {
        q: "Does FreeVideo have an API like D-ID?",
        a: "FreeVideo itself is a free web tool. The underlying SDK (SpatialReal) is available for developers — see docs.spatialreal.ai for API access.",
      },
      {
        q: "Why is FreeVideo completely free when D-ID charges?",
        a: "FreeVideo is operated by SpatialWalk as a demonstration of the SpatialReal SDK. It's funded as a marketing/demo channel rather than a standalone business.",
      },
    ],
  },
];
