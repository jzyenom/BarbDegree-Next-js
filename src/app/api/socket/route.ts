/**
 * AUTO-FILE-COMMENT: src/app/api/socket/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
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
