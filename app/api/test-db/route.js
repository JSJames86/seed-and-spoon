import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();

    return new Response(
      JSON.stringify({
        status: "ok",
        dbName: db.databaseName,
        collections: collections.map((c) => c.name),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("DB connection error:", error);

    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}