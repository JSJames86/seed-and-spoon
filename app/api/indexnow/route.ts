import { NextRequest, NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/indexnow";

const SITEMAP_URL = "https://seedandspoon.org/sitemap.xml";

function authorized(token: string | null): boolean {
  return Boolean(process.env.INDEXNOW_ADMIN_TOKEN) && token === process.env.INDEXNOW_ADMIN_TOKEN;
}

function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

/**
 * GET /api/indexnow?mode=sitemap&token=YOUR_ADMIN_TOKEN
 *
 * Server-side bulk submit: fetches the live sitemap (recursing into a
 * sitemap index if needed) and submits every URL to IndexNow. Runs on
 * Vercel, so no local terminal or egress access is required — it can be
 * triggered from any browser.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (!authorized(searchParams.get("token"))) {
    // TEMPORARY: remove hasEnv once we've confirmed prod has INDEXNOW_ADMIN_TOKEN set
    return NextResponse.json(
      { error: "Unauthorized", hasEnv: Boolean(process.env.INDEXNOW_ADMIN_TOKEN) },
      { status: 401 }
    );
  }
  if (searchParams.get("mode") !== "sitemap") {
    return NextResponse.json(
      { error: "Use ?mode=sitemap&token=... to bulk-submit the sitemap" },
      { status: 400 }
    );
  }

  const res = await fetch(SITEMAP_URL, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json(
      { ok: false, upstreamStatus: res.status, error: `Failed to fetch sitemap: HTTP ${res.status}` },
      { status: 200 }
    );
  }
  const xml = await res.text();
  const locs = extractLocs(xml);

  let urls: string[] = [];
  if (xml.includes("<sitemapindex")) {
    for (const child of locs) {
      const childRes = await fetch(child, { cache: "no-store" });
      if (childRes.ok) urls.push(...extractLocs(await childRes.text()));
    }
  } else {
    urls = locs;
  }
  urls = [...new Set(urls)];

  const result = await submitToIndexNow(urls);
  return NextResponse.json(
    { mode: "sitemap", urlsFound: urls.length, ...result, upstreamStatus: result.status },
    { status: 200 }
  );
}

/**
 * POST /api/indexnow
 * Body: { "urls": ["/blog/new-post"] }
 * Header: x-admin-token: <INDEXNOW_ADMIN_TOKEN>
 *
 * On-demand submission of specific URLs after publishing.
 */
export async function POST(req: NextRequest) {
  if (!authorized(req.headers.get("x-admin-token"))) {
    // TEMPORARY: remove hasEnv once we've confirmed prod has INDEXNOW_ADMIN_TOKEN set
    return NextResponse.json(
      { error: "Unauthorized", hasEnv: Boolean(process.env.INDEXNOW_ADMIN_TOKEN) },
      { status: 401 }
    );
  }

  let body: { urls?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
    return NextResponse.json(
      { error: "Body must include a non-empty 'urls' array" },
      { status: 400 }
    );
  }

  const result = await submitToIndexNow(body.urls);
  return NextResponse.json({ ...result, upstreamStatus: result.status }, { status: 200 });
}
