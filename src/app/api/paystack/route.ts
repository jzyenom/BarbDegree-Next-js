import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Paystack } from "paystack-sdk";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import User from "@/models/User";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * AUTO-FUNCTION-COMMENT: resolveAppUrl
 * Purpose: Handles resolve app url.
 * Line-by-line:
 * 1. Executes `const configuredAppUrl =`.
 * 2. Executes `process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL;`.
 * 3. Executes `if (configuredAppUrl) {`.
 * 4. Executes `return configuredAppUrl;`.
 * 5. Executes `}`.
 * 6. Executes `if (process.env.NODE_ENV !== "production") {`.
 * 7. Executes `return new URL(req.url).origin;`.
 * 8. Executes `}`.
 * 9. Executes `return "";`.
 */
function resolveAppUrl(req: NextRequest) {
  const configuredAppUrl =
    process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (configuredAppUrl) {
    return configuredAppUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    return new URL(req.url).origin;
  }

  return "";
}

/**
 * AUTO-FUNCTION-COMMENT: POST
 * Purpose: Handles post.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 4. Executes `const body = (await req.json()) as Record<string, unknown>;`.
 * 5. Executes `const bookingId =`.
 * 6. Executes `typeof body.bookingId === "string" ? body.bookingId.trim() : "";`.
 * 7. Executes `if (!mongoose.Types.ObjectId.isValid(bookingId)) {`.
 * 8. Executes `return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });`.
 * 9. Executes `}`.
 * 10. Executes `const secretKey = process.env.PAYSTACK_SECRET_KEY;`.
 * 11. Executes `if (!secretKey) {`.
 * 12. Executes `return NextResponse.json(`.
 * 13. Executes `{ error: "Payment provider is not configured" },`.
 * 14. Executes `{ status: 500 }`.
 * 15. Executes `);`.
 * 16. Executes `}`.
 * 17. Executes `const paystack = new Paystack(secretKey);`.
 * 18. Executes `const booking = await Booking.findById(bookingId);`.
 * 19. Executes `if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });`.
 * 20. Executes `if (booking.paymentStatus === "paid") {`.
 * 21. Executes `return NextResponse.json({ error: "Booking is already paid" }, { status: 400 });`.
 * 22. Executes `}`.
 * 23. Executes `const bookingClientId = booking.clientId?.toString?.() ?? "";`.
 * 24. Executes `if (bookingClientId !== user.id && !isAdminRole(user.role)) {`.
 * 25. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 26. Executes `}`.
 * 27. Executes `const appUrl = resolveAppUrl(req);`.
 * 28. Executes `if (!appUrl) {`.
 * 29. Executes `return NextResponse.json(`.
 * 30. Executes `{ error: "Public app URL is not configured" },`.
 * 31. Executes `{ status: 500 }`.
 * 32. Executes `);`.
 * 33. Executes `}`.
 * 34. Executes `const amount = Number(booking.estimatedPrice || 0);`.
 * 35. Executes `if (!Number.isFinite(amount) || amount <= 0) {`.
 * 36. Executes `return NextResponse.json(`.
 * 37. Executes `{ error: "Booking amount is invalid for payment" },`.
 * 38. Executes `{ status: 400 }`.
 * 39. Executes `);`.
 * 40. Executes `}`.
 * 41. Executes `const amountInKobo = Math.round(amount * 100);`.
 * 42. Executes `if (!Number.isInteger(amountInKobo) || amountInKobo <= 0) {`.
 * 43. Executes `return NextResponse.json(`.
 * 44. Executes `{ error: "Booking amount is invalid for payment" },`.
 * 45. Executes `{ status: 400 }`.
 * 46. Executes `);`.
 * 47. Executes `}`.
 * 48. Executes `let payerEmail = booking.email?.trim().toLowerCase();`.
 * 49. Executes `if (!payerEmail && booking.clientId) {`.
 * 50. Executes `const clientUser = await User.findById(booking.clientId).select("email");`.
 * 51. Executes `payerEmail = clientUser?.email?.trim()?.toLowerCase();`.
 * 52. Executes `}`.
 * 53. Executes `if (!payerEmail) {`.
 * 54. Executes `payerEmail = user.email?.trim()?.toLowerCase() || undefined;`.
 * 55. Executes `}`.
 * 56. Executes `if (!payerEmail || !EMAIL_PATTERN.test(payerEmail)) {`.
 * 57. Executes `return NextResponse.json({ error: "No payer email found" }, { status: 400 });`.
 * 58. Executes `}`.
 * 59. Executes `const response = await paystack.transaction.initialize({`.
 * 60. Executes `amount: String(amountInKobo),`.
 * 61. Executes `email: payerEmail,`.
 * 62. Executes `callback_url: \`${appUrl}/payment/verify\`,`.
 * 63. Executes `metadata: {`.
 * 64. Executes `bookingId: booking._id.toString(),`.
 * 65. Executes `userId: user.id,`.
 * 66. Executes `},`.
 * 67. Executes `});`.
 * 68. Executes `const responseData = response.data;`.
 * 69. Executes `if (!responseData) {`.
 * 70. Executes `return NextResponse.json(`.
 * 71. Executes `{ error: "Failed to initialize payment" },`.
 * 72. Executes `{ status: 502 }`.
 * 73. Executes `);`.
 * 74. Executes `}`.
 * 75. Executes `try {`.
 * 76. Executes `await Transaction.create({`.
 * 77. Executes `userId: bookingClientId || user.id,`.
 * 78. Executes `bookingId,`.
 * 79. Executes `amount,`.
 * 80. Executes `reference: responseData.reference,`.
 * 81. Executes `status: "pending",`.
 * 82. Executes `});`.
 * 83. Executes `} catch (error) {`.
 * 84. Executes `if (`.
 * 85. Executes `typeof error === "object" &&`.
 * 86. Executes `error &&`.
 * 87. Executes `"code" in error &&`.
 * 88. Executes `error.code === 11000`.
 * 89. Executes `) {`.
 * 90. Executes `// Treat duplicate reference as idempotent.`.
 * 91. Executes `} else {`.
 * 92. Executes `throw error;`.
 * 93. Executes `}`.
 * 94. Executes `}`.
 * 95. Executes `await Booking.findByIdAndUpdate(bookingId, {`.
 * 96. Executes `paymentReference: responseData.reference,`.
 * 97. Executes `});`.
 * 98. Executes `return NextResponse.json({`.
 * 99. Executes `authUrl: responseData.authorization_url,`.
 * 100. Executes `reference: responseData.reference,`.
 * 101. Executes `});`.
 */
export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Record<string, unknown>;
  const bookingId =
    typeof body.bookingId === "string" ? body.bookingId.trim() : "";
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Payment provider is not configured" },
      { status: 500 }
    );
  }
  const paystack = new Paystack(secretKey);

  const booking = await Booking.findById(bookingId);

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.paymentStatus === "paid") {
    return NextResponse.json({ error: "Booking is already paid" }, { status: 400 });
  }

  const bookingClientId = booking.clientId?.toString?.() ?? "";
  if (bookingClientId !== user.id && !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const appUrl = resolveAppUrl(req);
  if (!appUrl) {
    return NextResponse.json(
      { error: "Public app URL is not configured" },
      { status: 500 }
    );
  }

  const amount = Number(booking.estimatedPrice || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Booking amount is invalid for payment" },
      { status: 400 }
    );
  }
  const amountInKobo = Math.round(amount * 100);
  if (!Number.isInteger(amountInKobo) || amountInKobo <= 0) {
    return NextResponse.json(
      { error: "Booking amount is invalid for payment" },
      { status: 400 }
    );
  }

  let payerEmail = booking.email?.trim().toLowerCase();
  if (!payerEmail && booking.clientId) {
    const clientUser = await User.findById(booking.clientId).select("email");
    payerEmail = clientUser?.email?.trim()?.toLowerCase();
  }
  if (!payerEmail) {
    payerEmail = user.email?.trim()?.toLowerCase() || undefined;
  }
  if (!payerEmail || !EMAIL_PATTERN.test(payerEmail)) {
    return NextResponse.json({ error: "No payer email found" }, { status: 400 });
  }

  const response = await paystack.transaction.initialize({
    amount: String(amountInKobo),
    email: payerEmail,
    callback_url: `${appUrl}/payment/verify`,
    metadata: {
      bookingId: booking._id.toString(),
      userId: user.id,
    },
  });
  const responseData = response.data;
  if (!responseData) {
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 502 }
    );
  }

  try {
    await Transaction.create({
      userId: bookingClientId || user.id,
      bookingId,
      amount,
      reference: responseData.reference,
      status: "pending",
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === 11000
    ) {
      // Treat duplicate reference as idempotent.
    } else {
      throw error;
    }
  }

  await Booking.findByIdAndUpdate(bookingId, {
    paymentReference: responseData.reference,
  });

  return NextResponse.json({
    authUrl: responseData.authorization_url,
    reference: responseData.reference,
  });
}
