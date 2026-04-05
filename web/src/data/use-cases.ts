export interface UseCase {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  intro: string;
  examples: string[];
  faqs: { q: string; a: string }[];
  cta: string;
}

export const USE_CASES: UseCase[] = [
  {
    slug: "marketing-video",
    title: "Free AI Marketing Video Generator",
    h1: "Create Free Marketing Videos with AI Avatars",
    metaDescription:
      "Generate free marketing videos with AI talking avatars. Perfect for product launches, ads, and promotional content. No sign-up, 74+ languages supported.",
    intro:
      "Turn your marketing copy into engaging videos in seconds. FreeVideo's AI talking avatar lets you create professional promotional content without cameras, actors, or editing software. Whether you're launching a new product, running an ad campaign, or promoting a sale, just type your message and let an AI avatar deliver it — forever free, no sign-up required.",
    examples: [
      "Introducing our new summer collection — 30% off this week only. Shop now at our online store.",
      "Discover how our platform helps 10,000+ businesses grow. Start your free trial today.",
      "Limited time offer: Get our premium bundle at half price. This deal ends Sunday.",
    ],
    faqs: [
      {
        q: "Can I use these videos for ads on Facebook or Google?",
        a: "Yes. Videos generated with FreeVideo can be used in paid advertising, social media campaigns, and any marketing channel with no licensing restrictions.",
      },
      {
        q: "What aspect ratios are supported for marketing videos?",
        a: "Videos are rendered in a 1:1 square format, which works well on all major platforms including Instagram, LinkedIn, and Facebook feeds.",
      },
      {
        q: "How long can my marketing video be?",
        a: "Text is limited to 500 characters per generation, which produces roughly a 30-60 second video. You can generate multiple clips and combine them.",
      },
      {
        q: "Do I need design skills to make marketing videos?",
        a: "No. Just type your marketing message, pick an avatar and voice, and download. The entire process takes under a minute.",
      },
    ],
    cta: "Start Creating Marketing Videos",
  },
  {
    slug: "training-video",
    title: "Free AI Training Video Generator",
    h1: "Create Free Employee Training Videos with AI Avatars",
    metaDescription:
      "Generate professional training videos with AI avatars for free. Ideal for onboarding, compliance, and product training. Multi-language support.",
    intro:
      "Transform training manuals into engaging videos with AI avatars. FreeVideo is the fastest way to create onboarding, compliance, and product training content without booking studio time or paying voice actors. Update training materials instantly — just edit the text and regenerate. Forever free, with 74+ languages for global teams.",
    examples: [
      "Welcome to the team! Today we'll cover our security policies and best practices for protecting customer data.",
      "This training module explains how to safely handle equipment in the warehouse. Please complete it before starting your shift.",
      "In this lesson, you'll learn the three steps to resolve customer complaints effectively.",
    ],
    faqs: [
      {
        q: "Can I create multi-language training videos?",
        a: "Yes. Generate the same training content in 74+ languages by selecting different voices. Perfect for companies with global teams.",
      },
      {
        q: "Is this suitable for compliance training?",
        a: "Absolutely. Compliance training videos require consistent, clear delivery — which AI avatars provide reliably. You can update regulations and regenerate in seconds.",
      },
      {
        q: "Can I embed these in my LMS?",
        a: "Yes. Download the MP4 video file and upload it to any LMS that supports video content, including Moodle, Canvas, or corporate training platforms.",
      },
      {
        q: "Do the avatars look professional enough for corporate use?",
        a: "Yes. FreeVideo uses photorealistic AI avatars from SpatialReal, designed to look natural and professional in business contexts.",
      },
    ],
    cta: "Start Creating Training Videos",
  },
  {
    slug: "product-demo",
    title: "Free AI Product Demo Video Generator",
    h1: "Create Free Product Demo Videos with AI Avatars",
    metaDescription:
      "Generate free product demo videos with AI talking avatars. Perfect for SaaS launches, feature announcements, and sales enablement.",
    intro:
      "Show off your product without filming a single frame. FreeVideo lets you create AI-narrated product demo videos in minutes — perfect for SaaS feature announcements, sales enablement, and pitch decks. Pair your screen recordings or mockups with a professional AI avatar explanation. Forever free, no watermark, commercial use allowed.",
    examples: [
      "Our new dashboard gives you real-time insights into every metric that matters. Let me show you the top three features.",
      "This is how you onboard a new team member in under 60 seconds using our platform.",
      "Today I'll walk you through the latest update: automatic report scheduling, one-click exports, and custom templates.",
    ],
    faqs: [
      {
        q: "Can I combine AI avatar clips with screen recordings?",
        a: "Yes. Download the AI avatar video as MP4 and combine it with screen recordings in any video editor like CapCut, Premiere, or iMovie.",
      },
      {
        q: "Is this better than Loom for async product demos?",
        a: "For scripted, polished demos — yes. AI avatars are consistent every time, don't require re-takes, and can be updated by editing text.",
      },
      {
        q: "Can I use this for pitch decks?",
        a: "Yes. Many founders embed AI avatar videos in pitch decks to show product vision without filming themselves.",
      },
      {
        q: "Can I generate demos in multiple languages for international customers?",
        a: "Yes. Generate the same demo script in English, Chinese, Japanese, Korean, Spanish, and 70+ other languages.",
      },
    ],
    cta: "Start Creating Demo Videos",
  },
  {
    slug: "education-video",
    title: "Free AI Education Video Generator",
    h1: "Create Free Educational Videos with AI Avatars",
    metaDescription:
      "Generate free educational videos with AI talking avatars. Perfect for teachers, online courses, and tutorial content. 74+ languages.",
    intro:
      "Bring lessons to life with AI avatars. FreeVideo helps teachers, tutors, and course creators turn written lessons into engaging video content. Whether you're creating explainers for YouTube, building an online course, or producing classroom materials, just type your lesson and get a video. Forever free — no teacher's budget required.",
    examples: [
      "Today we'll learn about the water cycle. Water evaporates from oceans, forms clouds, and falls as rain.",
      "Let's solve this algebra problem step by step. First, we'll isolate the variable on one side.",
      "In this history lesson, we'll explore three major causes of the industrial revolution.",
    ],
    faqs: [
      {
        q: "Can teachers use this for their classrooms?",
        a: "Yes. FreeVideo is forever free with no educational license required. Generate unlimited videos for classroom use.",
      },
      {
        q: "Can I use these videos on YouTube?",
        a: "Yes. AI avatar videos can be published on YouTube, including monetized channels. Commercial use is allowed.",
      },
      {
        q: "Can students create videos too?",
        a: "Yes. There's no age restriction or sign-up required. Students can use FreeVideo for presentations and projects.",
      },
      {
        q: "Does it support different languages for ESL students?",
        a: "Yes. 74+ languages supported, making it ideal for language learning and multilingual classrooms.",
      },
    ],
    cta: "Start Creating Educational Videos",
  },
  {
    slug: "social-media-video",
    title: "Free AI Social Media Video Generator",
    h1: "Create Free Social Media Videos with AI Avatars",
    metaDescription:
      "Generate free AI avatar videos for TikTok, Instagram Reels, YouTube Shorts. No sign-up, forever free, 74+ languages.",
    intro:
      "Feed the algorithm without showing your face. FreeVideo generates AI avatar videos perfect for TikTok, Instagram Reels, and YouTube Shorts — ideal for creators who want consistent content without the time cost of filming themselves. Type a script, pick an avatar, and post. Forever free means you can batch-create a week of content in an hour.",
    examples: [
      "Here are 3 productivity tips that changed my life. Number one: block your calendar.",
      "POV: You just discovered the best free tool on the internet. Link in bio.",
      "3 things I wish I knew before starting my business. Save this for later.",
    ],
    faqs: [
      {
        q: "Can I make faceless YouTube videos with this?",
        a: "Yes. AI avatars are widely used for faceless YouTube channels in niches like finance, education, and productivity.",
      },
      {
        q: "Is this allowed on TikTok and Instagram?",
        a: "Yes. Both platforms allow AI-generated content. Some platforms may require disclosure of AI use — check their current policies.",
      },
      {
        q: "Can I create content in bulk?",
        a: "Yes. Generate as many videos as you want — FreeVideo has no daily limits.",
      },
      {
        q: "What's the ideal video length for social media?",
        a: "For TikTok and Reels, aim for 15-30 second clips. The 500 character text limit produces videos well within this range.",
      },
    ],
    cta: "Start Creating Social Videos",
  },
  {
    slug: "ecommerce-video",
    title: "Free AI Product Video Generator for E-commerce",
    h1: "Create Free Product Videos for Your E-commerce Store",
    metaDescription:
      "Generate free product videos with AI avatars for Shopify, Amazon, Etsy, and more. Boost conversion with talking product descriptions.",
    intro:
      "Turn product descriptions into videos that sell. Stores with video on product pages see higher conversion rates — but filming every SKU is expensive. FreeVideo lets you generate AI-narrated product videos in bulk, describing features, benefits, and use cases. Perfect for Shopify, Amazon, Etsy, and independent stores. Forever free, no per-video cost.",
    examples: [
      "This handmade ceramic mug holds 12 ounces and is perfect for your morning coffee. Microwave and dishwasher safe.",
      "Our noise-cancelling headphones offer 30 hours of battery life and studio-quality sound. Available in three colors.",
      "This organic cotton t-shirt is pre-shrunk and runs true to size. Available in sizes S through XXL.",
    ],
    faqs: [
      {
        q: "Can I use these videos on Amazon product listings?",
        a: "Yes. Amazon allows product videos on listings, and AI-generated videos are permitted as long as they accurately describe the product.",
      },
      {
        q: "Will this increase my conversion rate?",
        a: "Studies show product videos can lift conversion by 20-80%. Results depend on video quality, messaging, and product category.",
      },
      {
        q: "Can I make product videos in multiple languages for international stores?",
        a: "Yes. Generate product descriptions in 74+ languages to serve global customers on Shopify, Amazon Global, or eBay international.",
      },
      {
        q: "How do I embed these videos on my store?",
        a: "Download the MP4 and upload to your store's product page. Most platforms (Shopify, WooCommerce, etc.) support direct video embeds.",
      },
    ],
    cta: "Start Creating Product Videos",
  },
];
