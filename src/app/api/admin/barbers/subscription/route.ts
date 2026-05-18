/**
 * AUTO-FILE-COMMENT: src/app/api/admin/barbers/subscription/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { NextRequest } from "next/server";

/**
 * AUTO-FUNCTION-COMMENT: POST
 * Purpose: Handles post.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized)`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `if (!isAdminRole(user.role)) {`.
 * 6. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 7. Executes `}`.
 * 8. Executes `const body = (await req.json()) as Record<string, unknown>;`.
 * 9. Executes `const barberId = typeof body.barberId === "string" ? body.barberId.trim() : "";`.
 * 10. Executes `const isSubscribed = Boolean(body.isSubscribed);`.
 * 11. Executes `if (!mongoose.Types.ObjectId.isValid(barberId)) {`.
 * 12. Executes `return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });`.
 * 13. Executes `}`.
 * 14. Executes `const barber = await Barber.findByIdAndUpdate(`.
 * 15. Executes `barberId,`.
 * 16. Executes `{ isSubscribed },`.
 * 17. Executes `{ new: true }`.
 * 18. Executes `);`.
 * 19. Executes `if (!barber) return NextResponse.json({ error: "Barber not found" }, { status: 404 });`.
 * 20. Executes `return NextResponse.json({ barber });`.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const isSubscribed = Boolean(body.isSubscribed);
  const request = new NextRequest(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify({
      barberId: body.barberId,
      enabled: true,
      forcedStatus: isSubscribed,
    }),
  });
  const { POST } = await import("@/app/api/admin/subscriptions/toggle-status/route");
  return POST(request);
}
