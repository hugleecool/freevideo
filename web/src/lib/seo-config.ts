/**
 * SEO verification tokens and analytics configuration.
 *
 * ## How to update
 *
 * 1. Google Search Console:
 *    - Go to https://search.google.com/search-console
 *    - Add property: https://freevideo-3gk.pages.dev
 *    - Choose "HTML tag" verification
 *    - Copy the `content="..."` value into GOOGLE_SITE_VERIFICATION below
 *
 * 2. Bing Webmaster Tools:
 *    - Go to https://www.bing.com/webmasters
 *    - Import from Google Search Console (one-click after GSC verified)
 *    - No code change needed
 *
 * 3. Cloudflare Web Analytics:
 *    - Go to Cloudflare Dashboard → Web Analytics → Add a site
 *    - Add: freevideo-3gk.pages.dev
 *    - Copy the beacon token from the snippet
 *    - Paste into CF_ANALYTICS_TOKEN below
 */

/** Google Search Console HTML tag verification token (the `content` attribute value). */
export const GOOGLE_SITE_VERIFICATION = "";

/** Bing Webmaster Tools verification meta token (optional if using GSC import). */
export const BING_SITE_VERIFICATION = "";

/** Cloudflare Web Analytics beacon token (the JSON `token` value). */
export const CF_ANALYTICS_TOKEN = "";

/** Canonical production URL used for og:url and canonical tags. */
export const SITE_URL = "https://freevideo-3gk.pages.dev";
