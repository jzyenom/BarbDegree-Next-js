import { NextResponse } from "next/server";

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `return NextResponse.json({ ok: true });`.
 */
export async function GET() {
  return NextResponse.json({ ok: true });
}
