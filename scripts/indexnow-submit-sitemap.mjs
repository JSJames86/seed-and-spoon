/**
 * One-time (or occasional) bulk IndexNow submission.
 * Fetches the live sitemap and submits every URL to IndexNow.
 *
 * Run locally with:  node scripts/indexnow-submit-sitemap.mjs
 * (npm only — no bun)
 */

const HOST = "seedandspoon.org";
const KEY = "bc103c0f568a49f9f284a16c61b64219";
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

async function main() {
  console.log(`Fetching ${SITEMAP_URL} ...`);
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) {
    console.error(`Failed to fetch sitemap: HTTP ${res.status}`);
    process.exit(1);
  }
  const xml = await res.text();

  // Extract <loc> entries (handles sitemap index files too by recursing once)
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);

  let urls = [];
  if (xml.includes("<sitemapindex")) {
    for (const child of locs) {
      const childRes = await fetch(child);
      const childXml = await childRes.text();
      urls.push(
        ...[...childXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1])
      );
    }
  } else {
    urls = locs;
  }

  urls = [...new Set(urls)];
  console.log(`Found ${urls.length} URLs. Submitting to IndexNow ...`);

  const submitRes = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });

  console.log(`IndexNow response: HTTP ${submitRes.status}`);
  if (submitRes.status === 200 || submitRes.status === 202) {
    console.log("Success. Check Bing Webmaster Tools → IndexNow Insights in a bit.");
  } else {
    console.error("Submission failed:", await submitRes.text());
    process.exit(1);
  }
}

main();
