import { NextRequest, NextResponse } from "next/server";
import { Paystack } from "paystack-sdk";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

const REFERENCE_PATTERN = /^[A-Za-z0-9._:-]{6,120}$/;

type UpdatedBookingRef = {
  _id: { toString(): string } | string;
} | null;

type VerifyResult = {
  ok: boolean;
  status: "success" | "failed";
  reference: string;
  bookingId: string | null;
};

type IdLike = { toString(): string } | string | null | undefined;

/**
 * AUTO-FUNCTION-COMMENT: toIdString
 * Purpose: Handles to id string.
 * Line-by-line:
 * 1. Executes `if (!value) return "";`.
 * 2. Executes `return typeof value === "string" ? value : value.toString();`.
 */
function toIdString(value: IdLike) {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

/**
 * AUTO-FUNCTION-COMMENT: isValidReference
 * Purpose: Handles is valid reference.
 * Line-by-line:
 * 1. Executes `return REFERENCE_PATTERN.test(reference);`.
 */
function isValidReference(reference: string) {
  return REFERENCE_PATTERN.test(reference);
}

/**
 * AUTO-FUNCTION-COMMENT: verifyReference
 * Purpose: Handles verify reference.
 * Line-by-line:
 * 1. Executes `const secretKey = process.env.PAYSTACK_SECRET_KEY;`.
 * 2. Executes `if (!secretKey) {`.
 * 3. Executes `throw new Error("PAYSTACK_SECRET_KEY is not configured");`.
 * 4. Executes `}`.
 * 5. Executes `await connectToDatabase();`.
 * 6. Executes `const paystack = new Paystack(secretKey);`.
 * 7. Executes `const verify = await paystack.transaction.verify(reference);`.
 * 8. Executes `const verifyData = verify.data;`.
 * 9. Executes `if (!verifyData) {`.
 * 10. Executes `throw new Error("Empty verification response");`.
 * 11. Executes `}`.
 * 12. Executes `if (`.
 * 13. Executes `typeof verifyData.reference === "string" &&`.
 * 14. Executes `verifyData.reference !== reference`.
 * 15. Executes `) {`.
 * 16. Executes `throw new Error("Mismatched payment reference");`.
 * 17. Executes `}`.
 * 18. Executes `const status: "success" | "failed" =`.
 * 19. Executes `verifyData.status === "success" ? "success" : "failed";`.
 * 20. Executes `await Transaction.findOneAndUpdate(`.
 * 21. Executes `{ reference },`.
 * 22. Executes `{`.
 * 23. Executes `status,`.
 * 24. Executes `providerResponse: verifyData,`.
 * 25. Executes `}`.
 * 26. Executes `);`.
 * 27. Executes `let updatedBooking: UpdatedBookingRef = null;`.
 * 28. Executes `if (status === "success") {`.
 * 29. Executes `updatedBooking = await Booking.findOneAndUpdate(`.
 * 30. Executes `{ paymentReference: reference },`.
 * 31. Executes `{`.
 * 32. Executes `paymentStatus: "paid",`.
 * 33. Executes `amountPaid:`.
 * 34. Executes `typeof verifyData.amount === "number" ? verifyData.amount / 100 : 0,`.
 * 35. Executes `status: "confirmed",`.
 * 36. Executes `},`.
 * 37. Executes `{ new: true }`.
 * 38. Executes `).lean<UpdatedBookingRef>();`.
 * 39. Executes `} else {`.
 * 40. Executes `updatedBooking = await Booking.findOneAndUpdate(`.
 * 41. Executes `{ paymentReference: reference },`.
 * 42. Executes `{`.
 * 43. Executes `paymentStatus: "failed",`.
 * 44. Executes `},`.
 * 45. Executes `{ new: true }`.
 * 46. Executes `).lean<UpdatedBookingRef>();`.
 * 47. Executes `}`.
 * 48. Executes `return {`.
 * 49. Executes `ok: status === "success",`.
 * 50. Executes `status,`.
 * 51. Executes `reference,`.
 * 52. Executes `bookingId:`.
 * 53. Executes `updatedBooking?._id == null`.
 * 54. Executes `? null`.
 * 55. Executes `: typeof updatedBooking._id === "string"`.
 * 56. Executes `? updatedBooking._id`.
 * 57. Executes `: updatedBooking._id.toString(),`.
 * 58. Executes `};`.
 */
async function verifyReference(reference: string): Promise<VerifyResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  await connectToDatabase();

  const paystack = new Paystack(secretKey);
  const verify = await paystack.transaction.verify(reference);
  const verifyData = verify.data;
  if (!verifyData) {
    throw new Error("Empty verification response");
  }
  if (
    typeof verifyData.reference === "string" &&
    verifyData.reference !== reference
  ) {
    throw new Error("Mismatched payment reference");
  }

  const status: "success" | "failed" =
    verifyData.status === "success" ? "success" : "failed";

  await Transaction.findOneAndUpdate(
    { reference },
    {
      status,
      providerResponse: verifyData,
    }
  );

  let updatedBooking: UpdatedBookingRef = null;
  if (status === "success") {
    updatedBooking = await Booking.findOneAndUpdate(
      { paymentReference: reference },
      {
        paymentStatus: "paid",
        amountPaid:
          typeof verifyData.amount === "number" ? verifyData.amount / 100 : 0,
        status: "confirmed",
      },
      { new: true }
    ).lean<UpdatedBookingRef>();
  } else {
    updatedBooking = await Booking.findOneAndUpdate(
      { paymentReference: reference },
      {
        paymentStatus: "failed",
      },
      { new: true }
    ).lean<UpdatedBookingRef>();
  }

  return {
    ok: status === "success",
    status,
    reference,
    bookingId:
      updatedBooking?._id == null
        ? null
        : typeof updatedBooking._id === "string"
        ? updatedBooking._id
        : updatedBooking._id.toString(),
  };
}

/**
 * AUTO-FUNCTION-COMMENT: resolveReferenceOwner
 * Purpose: Handles resolve reference owner.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const transaction = await Transaction.findOne({ reference })`.
 * 3. Executes `.select("userId bookingId")`.
 * 4. Executes `.lean<{ userId?: IdLike; bookingId?: IdLike } | null>();`.
 * 5. Executes `if (transaction?.userId) {`.
 * 6. Executes `return {`.
 * 7. Executes `ownerId: toIdString(transaction.userId),`.
 * 8. Executes `bookingId: toIdString(transaction.bookingId) || null,`.
 * 9. Executes `};`.
 * 10. Executes `}`.
 * 11. Executes `const booking = await Booking.findOne({ paymentReference: reference })`.
 * 12. Executes `.select("_id clientId")`.
 * 13. Executes `.lean<{ _id: IdLike; clientId?: IdLike } | null>();`.
 * 14. Executes `if (!booking?.clientId) {`.
 * 15. Executes `return null;`.
 * 16. Executes `}`.
 * 17. Executes `return {`.
 * 18. Executes `ownerId: toIdString(booking.clientId),`.
 * 19. Executes `bookingId: toIdString(booking._id) || null,`.
 * 20. Executes `};`.
 */
async function resolveReferenceOwner(reference: string) {
  await connectToDatabase();

  const transaction = await Transaction.findOne({ reference })
    .select("userId bookingId")
    .lean<{ userId?: IdLike; bookingId?: IdLike } | null>();

  if (transaction?.userId) {
    return {
      ownerId: toIdString(transaction.userId),
      bookingId: toIdString(transaction.bookingId) || null,
    };
  }

  const booking = await Booking.findOne({ paymentReference: reference })
    .select("_id clientId")
    .lean<{ _id: IdLike; clientId?: IdLike } | null>();

  if (!booking?.clientId) {
    return null;
  }

  return {
    ownerId: toIdString(booking.clientId),
    bookingId: toIdString(booking._id) || null,
  };
}

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 2. Executes `if (unauthorized) {`.
 * 3. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 4. Executes `}`.
 * 5. Executes `const url = new URL(req.url);`.
 * 6. Executes `const reference = (url.searchParams.get("reference") || "").trim();`.
 * 7. Executes `if (!isValidReference(reference)) {`.
 * 8. Executes `return NextResponse.json(`.
 * 9. Executes `{ error: "Missing or invalid reference" },`.
 * 10. Executes `{ status: 400 }`.
 * 11. Executes `);`.
 * 12. Executes `}`.
 * 13. Executes `try {`.
 * 14. Executes `const owner = await resolveReferenceOwner(reference);`.
 * 15. Executes `if (!owner) {`.
 * 16. Executes `return NextResponse.json(`.
 * 17. Executes `{ error: "Reference not found" },`.
 * 18. Executes `{ status: 404 }`.
 * 19. Executes `);`.
 * 20. Executes `}`.
 * 21. Executes `if (owner.ownerId !== user.id && !isAdminRole(user.role)) {`.
 * 22. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 23. Executes `}`.
 * 24. Executes `const result = await verifyReference(reference);`.
 * 25. Executes `const redirectFlag = url.searchParams.get("redirect");`.
 * 26. Executes `const shouldRedirect = redirectFlag !== "false" && redirectFlag !== "0";`.
 * 27. Executes `if (!shouldRedirect) {`.
 * 28. Executes `return NextResponse.json(result);`.
 * 29. Executes `}`.
 * 30. Executes `const redirectBase =`.
 * 31. Executes `process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || url.origin;`.
 * 32. Executes `const redirectTarget = new URL("/transactions", redirectBase);`.
 * 33. Executes `redirectTarget.searchParams.set("payment", result.status);`.
 * 34. Executes `redirectTarget.searchParams.set("reference", result.reference);`.
 * 35. Executes `if (result.bookingId) {`.
 * 36. Executes `redirectTarget.searchParams.set("bookingId", result.bookingId);`.
 * 37. Executes `}`.
 * 38. Executes `return NextResponse.redirect(redirectTarget);`.
 * 39. Executes `} catch (error) {`.
 * 40. Executes `console.error("Paystack verify error:", error);`.
 * 41. Executes `return NextResponse.json({ error: "Verification failed" }, { status: 500 });`.
 * 42. Executes `}`.
 */
export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const reference = (url.searchParams.get("reference") || "").trim();

  if (!isValidReference(reference)) {
    return NextResponse.json(
      { error: "Missing or invalid reference" },
      { status: 400 }
    );
  }

  try {
    const owner = await resolveReferenceOwner(reference);
    if (!owner) {
      return NextResponse.json(
        { error: "Reference not found" },
        { status: 404 }
      );
    }

    if (owner.ownerId !== user.id && !isAdminRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await verifyReference(reference);
    const redirectFlag = url.searchParams.get("redirect");
    const shouldRedirect = redirectFlag !== "false" && redirectFlag !== "0";

    if (!shouldRedirect) {
      return NextResponse.json(result);
    }

    const redirectBase =
      process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || url.origin;
    const redirectTarget = new URL("/transactions", redirectBase);
    redirectTarget.searchParams.set("payment", result.status);
    redirectTarget.searchParams.set("reference", result.reference);
    if (result.bookingId) {
      redirectTarget.searchParams.set("bookingId", result.bookingId);
    }

    return NextResponse.redirect(redirectTarget);
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

/**
 * AUTO-FUNCTION-COMMENT: POST
 * Purpose: Handles post.
 * Line-by-line:
 * 1. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 2. Executes `if (unauthorized) {`.
 * 3. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 4. Executes `}`.
 * 5. Executes `try {`.
 * 6. Executes `const body = (await req.json()) as Record<string, unknown>;`.
 * 7. Executes `const reference =`.
 * 8. Executes `typeof body.reference === "string" ? body.reference.trim() : "";`.
 * 9. Executes `if (!isValidReference(reference)) {`.
 * 10. Executes `return NextResponse.json(`.
 * 11. Executes `{ error: "Missing or invalid reference" },`.
 * 12. Executes `{ status: 400 }`.
 * 13. Executes `);`.
 * 14. Executes `}`.
 * 15. Executes `const owner = await resolveReferenceOwner(reference);`.
 * 16. Executes `if (!owner) {`.
 * 17. Executes `return NextResponse.json(`.
 * 18. Executes `{ error: "Reference not found" },`.
 * 19. Executes `{ status: 404 }`.
 * 20. Executes `);`.
 * 21. Executes `}`.
 * 22. Executes `if (owner.ownerId !== user.id && !isAdminRole(user.role)) {`.
 * 23. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 24. Executes `}`.
 * 25. Executes `const result = await verifyReference(reference);`.
 * 26. Executes `return NextResponse.json(result, { status: result.ok ? 200 : 400 });`.
 * 27. Executes `} catch (error) {`.
 * 28. Executes `console.error("Paystack verify error:", error);`.
 * 29. Executes `return NextResponse.json({ error: "Verification failed" }, { status: 500 });`.
 * 30. Executes `}`.
 */
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const reference =
      typeof body.reference === "string" ? body.reference.trim() : "";

    if (!isValidReference(reference)) {
      return NextResponse.json(
        { error: "Missing or invalid reference" },
        { status: 400 }
      );
    }

    const owner = await resolveReferenceOwner(reference);
    if (!owner) {
      return NextResponse.json(
        { error: "Reference not found" },
        { status: 404 }
      );
    }

    if (owner.ownerId !== user.id && !isAdminRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await verifyReference(reference);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
