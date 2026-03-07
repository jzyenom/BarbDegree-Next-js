/**
 * AUTO-FILE-COMMENT: src/app/api/booking/verify/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Paystack } from "paystack-sdk";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

const REFERENCE_PATTERN = /^[A-Za-z0-9._:-]{6,120}$/;

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
 * AUTO-FUNCTION-COMMENT: pickMetadataBookingId
 * Purpose: Handles pick metadata booking id.
 * Line-by-line:
 * 1. Executes `if (!value || typeof value !== "object" || Array.isArray(value)) {`.
 * 2. Executes `return null;`.
 * 3. Executes `}`.
 * 4. Executes `const metadata = value as Record<string, unknown>;`.
 * 5. Executes `return typeof metadata.bookingId === "string" ? metadata.bookingId : null;`.
 */
function pickMetadataBookingId(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const metadata = value as Record<string, unknown>;
  return typeof metadata.bookingId === "string" ? metadata.bookingId : null;
}

/**
 * AUTO-FUNCTION-COMMENT: POST
 * Purpose: Handles post.
 * Line-by-line:
 * 1. Executes `try {`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `const body = (await req.json()) as Record<string, unknown>;`.
 * 7. Executes `const bookingId =`.
 * 8. Executes `typeof body.bookingId === "string" ? body.bookingId.trim() : "";`.
 * 9. Executes `const reference =`.
 * 10. Executes `typeof body.reference === "string" ? body.reference.trim() : "";`.
 * 11. Executes `if (!mongoose.Types.ObjectId.isValid(bookingId)) {`.
 * 12. Executes `return NextResponse.json({ error: "Invalid bookingId" }, { status: 400 });`.
 * 13. Executes `}`.
 * 14. Executes `if (!isValidReference(reference)) {`.
 * 15. Executes `return NextResponse.json(`.
 * 16. Executes `{ error: "Invalid payment reference" },`.
 * 17. Executes `{ status: 400 }`.
 * 18. Executes `);`.
 * 19. Executes `}`.
 * 20. Executes `await connectToDatabase();`.
 * 21. Executes `const booking = await Booking.findById(bookingId).select(`.
 * 22. Executes `"_id clientId paymentReference paymentStatus"`.
 * 23. Executes `);`.
 * 24. Executes `if (!booking) {`.
 * 25. Executes `return NextResponse.json({ error: "Booking not found" }, { status: 404 });`.
 * 26. Executes `}`.
 * 27. Executes `const isOwner = booking.clientId?.toString?.() === user.id;`.
 * 28. Executes `if (!isOwner && !isAdminRole(user.role)) {`.
 * 29. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 30. Executes `}`.
 * 31. Executes `const bookingReference = booking.paymentReference?.trim?.() ?? "";`.
 * 32. Executes `if (!bookingReference || bookingReference !== reference) {`.
 * 33. Executes `return NextResponse.json(`.
 * 34. Executes `{ error: "Reference does not match this booking" },`.
 * 35. Executes `{ status: 400 }`.
 * 36. Executes `);`.
 * 37. Executes `}`.
 * 38. Executes `if (booking.paymentStatus === "paid") {`.
 * 39. Executes `return NextResponse.json({`.
 * 40. Executes `message: "Payment already verified",`.
 * 41. Executes `bookingId,`.
 * 42. Executes `reference,`.
 * 43. Executes `});`.
 * 44. Executes `}`.
 * 45. Executes `const secretKey = process.env.PAYSTACK_SECRET_KEY;`.
 * 46. Executes `if (!secretKey) {`.
 * 47. Executes `return NextResponse.json(`.
 * 48. Executes `{ error: "Payment provider is not configured" },`.
 * 49. Executes `{ status: 500 }`.
 * 50. Executes `);`.
 * 51. Executes `}`.
 * 52. Executes `const paystack = new Paystack(secretKey);`.
 * 53. Executes `const verifyResult = await paystack.transaction.verify(reference);`.
 * 54. Executes `const verifyData = verifyResult.data;`.
 * 55. Executes `if (!verifyData) {`.
 * 56. Executes `return NextResponse.json(`.
 * 57. Executes `{ error: "Invalid Paystack response" },`.
 * 58. Executes `{ status: 502 }`.
 * 59. Executes `);`.
 * 60. Executes `}`.
 * 61. Executes `if (`.
 * 62. Executes `typeof verifyData.reference === "string" &&`.
 * 63. Executes `verifyData.reference !== reference`.
 * 64. Executes `) {`.
 * 65. Executes `return NextResponse.json(`.
 * 66. Executes `{ error: "Payment provider returned a mismatched reference" },`.
 * 67. Executes `{ status: 502 }`.
 * 68. Executes `);`.
 * 69. Executes `}`.
 * 70. Executes `const paystackBookingId = pickMetadataBookingId(verifyData.metadata);`.
 * 71. Executes `if (paystackBookingId && paystackBookingId !== bookingId) {`.
 * 72. Executes `return NextResponse.json(`.
 * 73. Executes `{ error: "Payment metadata does not match booking" },`.
 * 74. Executes `{ status: 400 }`.
 * 75. Executes `);`.
 * 76. Executes `}`.
 * 77. Executes `const status = verifyData.status === "success" ? "success" : "failed";`.
 * 78. Executes `await Transaction.findOneAndUpdate(`.
 * 79. Executes `{ reference },`.
 * 80. Executes `{`.
 * 81. Executes `status,`.
 * 82. Executes `providerResponse: verifyData,`.
 * 83. Executes `}`.
 * 84. Executes `);`.
 * 85. Executes `if (status === "success") {`.
 * 86. Executes `const amountPaid =`.
 * 87. Executes `typeof verifyData.amount === "number" ? verifyData.amount / 100 : 0;`.
 * 88. Executes `const updatedBooking = await Booking.findByIdAndUpdate(`.
 * 89. Executes `bookingId,`.
 * 90. Executes `{`.
 * 91. Executes `paymentStatus: "paid",`.
 * 92. Executes `amountPaid,`.
 * 93. Executes `paymentReference: reference,`.
 * 94. Executes `status: "confirmed",`.
 * 95. Executes `},`.
 * 96. Executes `{ new: true }`.
 * 97. Executes `);`.
 * 98. Executes `return NextResponse.json({`.
 * 99. Executes `message: "Payment verified",`.
 * 100. Executes `booking: updatedBooking,`.
 * 101. Executes `});`.
 * 102. Executes `}`.
 * 103. Executes `await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "failed" });`.
 * 104. Executes `return NextResponse.json(`.
 * 105. Executes `{ message: "Payment not successful" },`.
 * 106. Executes `{ status: 400 }`.
 * 107. Executes `);`.
 * 108. Executes `} catch (error) {`.
 * 109. Executes `console.error("Paystack verify error", error);`.
 * 110. Executes `return NextResponse.json({ error: "Verification failed" }, { status: 500 });`.
 * 111. Executes `}`.
 */
export async function POST(req: Request) {
  try {
    const { user, unauthorized } = await requireAuth(req);
    if (unauthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const bookingId =
      typeof body.bookingId === "string" ? body.bookingId.trim() : "";
    const reference =
      typeof body.reference === "string" ? body.reference.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Invalid bookingId" }, { status: 400 });
    }
    if (!isValidReference(reference)) {
      return NextResponse.json(
        { error: "Invalid payment reference" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const booking = await Booking.findById(bookingId).select(
      "_id clientId paymentReference paymentStatus"
    );
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isOwner = booking.clientId?.toString?.() === user.id;
    if (!isOwner && !isAdminRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bookingReference = booking.paymentReference?.trim?.() ?? "";
    if (!bookingReference || bookingReference !== reference) {
      return NextResponse.json(
        { error: "Reference does not match this booking" },
        { status: 400 }
      );
    }

    if (booking.paymentStatus === "paid") {
      return NextResponse.json({
        message: "Payment already verified",
        bookingId,
        reference,
      });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Payment provider is not configured" },
        { status: 500 }
      );
    }
    const paystack = new Paystack(secretKey);

    const verifyResult = await paystack.transaction.verify(reference);
    const verifyData = verifyResult.data;
    if (!verifyData) {
      return NextResponse.json(
        { error: "Invalid Paystack response" },
        { status: 502 }
      );
    }
    if (
      typeof verifyData.reference === "string" &&
      verifyData.reference !== reference
    ) {
      return NextResponse.json(
        { error: "Payment provider returned a mismatched reference" },
        { status: 502 }
      );
    }

    const paystackBookingId = pickMetadataBookingId(verifyData.metadata);
    if (paystackBookingId && paystackBookingId !== bookingId) {
      return NextResponse.json(
        { error: "Payment metadata does not match booking" },
        { status: 400 }
      );
    }

    const status = verifyData.status === "success" ? "success" : "failed";
    await Transaction.findOneAndUpdate(
      { reference },
      {
        status,
        providerResponse: verifyData,
      }
    );

    if (status === "success") {
      const amountPaid =
        typeof verifyData.amount === "number" ? verifyData.amount / 100 : 0;

      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: "paid",
          amountPaid,
          paymentReference: reference,
          status: "confirmed",
        },
        { new: true }
      );

      return NextResponse.json({
        message: "Payment verified",
        booking: updatedBooking,
      });
    }

    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "failed" });
    return NextResponse.json(
      { message: "Payment not successful" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Paystack verify error", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
