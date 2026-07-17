/**
 * IndexNow helper for seedandspoon.org
 *
 * Pushes new/updated URLs to Bing (and DuckDuckGo, Yandex, and other
 * IndexNow-participating engines) so they're indexed within minutes
 * instead of waiting for a crawl.
 *
 * The key file must be publicly served at:
 *   https://seedandspoon.org/bc103c0f568a49f9f284a16c61b64219.txt
 * (lives in /public — already included alongside this file)
 */

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const HOST = "seedandspoon.org";
const KEY = "bc103c0f568a49f9f284a16c61b64219";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

export interface IndexNowResult {
  ok: boolean;
  status: number;
  submitted: number;
}

/**
 * Submit one or more URLs to IndexNow.
 * Accepts full URLs or paths ("/blog/my-post" is normalized to
 * "https://seedandspoon.org/blog/my-post").
 * Max 10,000 URLs per call (protocol limit).
 */
export async function submitToIndexNow(
  urls: string | string[]
): Promise<IndexNowResult> {
  const list = (Array.isArray(urls) ? urls : [urls])
    .filter(Boolean)
    .map((u) =>
      u.startsWith("http") ? u : `https://${HOST}${u.startsWith("/") ? "" : "/"}${u}`
    );

  if (list.length === 0) {
    return { ok: true, status: 204, submitted: 0 };
  }

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: list,
    }),
  });

  // 200 = OK, 202 = accepted (key validation pending) — both are success
  return {
    ok: res.status === 200 || res.status === 202,
    status: res.status,
    submitted: list.length,
  };
}
