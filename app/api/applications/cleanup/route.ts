import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { REFERRAL_UPLOAD } from "@/data/familyIntake";

/**
 * GET /api/applications/cleanup
 *
 * Deletes referral documents (SNAP/WIC letters, referral letters) older than
 * REFERRAL_UPLOAD.retentionDays from the private `intake-referrals` bucket,
 * for both family intakes (applications) and partner referrals
 * (family_referrals). The row keeps its referral type and gets a deletion
 * timestamp, so staff can see a referral was received without keeping the file.
 *
 * Runs daily from vercel.json `crons`. Like /api/receipts/cleanup, it checks
 * `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set. It only ever
 * deletes files that are already past their retention date.
 */

export const runtime = "nodejs";

const BUCKET = "intake-referrals";
const BATCH_SIZE = 200;

type Target = { table: "applications" | "family_referrals"; pathCol: string; deletedCol: string };

const TARGETS: Target[] = [
  { table: "applications", pathCol: "referral_doc_path", deletedCol: "referral_doc_deleted_at" },
  { table: "family_referrals", pathCol: "letter_path", deletedCol: "letter_deleted_at" },
];

async function purge(client: NonNullable<ReturnType<typeof createServiceClient>>, target: Target, cutoff: string) {
  const { data, error } = await client
    .from(target.table)
    .select(`id, ${target.pathCol}`)
    .not(target.pathCol, "is", null)
    .lt("created_at", cutoff)
    .limit(BATCH_SIZE);

  if (error) {
    console.error(`[applications/cleanup] ${target.table} fetch failed:`, error.message);
    return { deleted: 0, error: true };
  }
  const rows = (data ?? []) as unknown as Record<string, string>[];
  if (rows.length === 0) return { deleted: 0, error: false };

  const paths = rows.map((r) => r[target.pathCol]);
  const { error: removeError } = await client.storage.from(BUCKET).remove(paths);
  if (removeError) {
    console.error(`[applications/cleanup] ${target.table} storage remove failed:`, removeError.message);
    return { deleted: 0, error: true };
  }

  const { error: updateError } = await client
    .from(target.table)
    .update({ [target.pathCol]: null, [target.deletedCol]: new Date().toISOString() })
    .in("id", rows.map((r) => r.id));
  if (updateError) console.error(`[applications/cleanup] ${target.table} row update failed:`, updateError.message);

  return { deleted: rows.length, error: false };
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = createServiceClient();
  if (!client) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const cutoff = new Date(Date.now() - REFERRAL_UPLOAD.retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const results = await Promise.all(TARGETS.map((t) => purge(client, t, cutoff)));

  if (results.some((r) => r.error)) return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  return NextResponse.json({ deleted: results.reduce((n, r) => n + r.deleted, 0) });
}
