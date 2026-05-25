import { NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const connection = await connectToDatabase();
    await connection.db?.admin().ping();

    return NextResponse.json({
      ok: true,
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ready] Readiness check failed", error);
    return NextResponse.json(
      {
        ok: false,
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
