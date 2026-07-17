import { NextRequest, NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/indexnow";

/**
 * POST /api/indexnow
 * Body: { "urls": ["/blog/new-post", "https://seedandspoon.org/recipes/x"] }
 * Header: x-admin-token: <INDEXNOW_ADMIN_TOKEN>
 *
 * Protected by a shared token so outsiders can't spam submissions
 * against our key. Set INDEXNOW_ADMIN_TOKEN in Vercel env vars.
 *
 * Call this after publishing/updating a Knowledge Center post,
 * recipe, or any public page.
 */
export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!process.env.INDEXNOW_ADMIN_TOKEN || token !== process.env.INDEXNOW_ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
