// app/api/test-db/route.js
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Seed & Spoon test route is alive 🚀",
  });
}
