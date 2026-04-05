import { writeFileSync } from "node:fs";
import { USE_CASES } from "../src/data/use-cases";
import { COMPETITORS } from "../src/data/competitors";

const BASE_URL = "https://freevideo-3gk.pages.dev";
const today = new Date().toISOString().split("T")[0];

const urls = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  ...USE_CASES.map((uc) => ({
    loc: `/use-cases/${uc.slug}`,
    priority: "0.8",
    changefreq: "weekly",
  })),
  ...COMPETITORS.map((c) => ({
    loc: `/compare/${c.slug}`,
    priority: "0.8",
    changefreq: "weekly",
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync("dist/sitemap.xml", xml, "utf-8");
console.log(`✅ sitemap.xml written with ${urls.length} URLs`);
