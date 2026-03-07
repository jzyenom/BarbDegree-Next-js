/**
 * AUTO-FILE-COMMENT: src/app/api/bookings/[id]/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Barber from "@/models/Barber";
import { requireAuth } from "@/lib/authGuard";
import { notifyUser } from "@/lib/notify";
import { isAdminRole } from "@/lib/roles";

const STATUS_OPTIONS = new Set(["pending", "confirmed", "completed", "declined"]);

/**
 * AUTO-FUNCTION-COMMENT: getId
 * Purpose: Handles get id.
 * Line-by-line:
 * 1. Executes `if (!value) return "";`.
 * 2. Executes `if (typeof value === "string") return value;`.
 * 3. Executes `if (typeof value === "object" && "_id" in value && value._id) {`.
 * 4. Executes `const doc = value as { _id: { toString(): string } };`.
 * 5. Executes `return doc._id.toString();`.
 * 6. Executes `}`.
 * 7. Executes `if (typeof value === "object" && "toString" in value) {`.
 * 8. Executes `const maybeId = value as { toString(): string };`.
 * 9. Executes `return maybeId.toString();`.
 * 10. Executes `}`.
 * 11. Executes `return "";`.
 */
function getId(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value && value._id) {
    const doc = value as { _id: { toString(): string } };
    return doc._id.toString();
  }
  if (typeof value === "object" && "toString" in value) {
    const maybeId = value as { toString(): string };
    return maybeId.toString();
  }
  return "";
}

/**
 * AUTO-FUNCTION-COMMENT: parseOptionalText
 * Purpose: Handles parse optional text.
 * Line-by-line:
 * 1. Executes `if (value == null) return { ok: true as const, value: undefined as string | undefined };`.
 * 2. Executes `if (typeof value !== "string") {`.
 * 3. Executes `return { ok: false as const, error: \`${label} must be a string\` };`.
 * 4. Executes `}`.
 * 5. Executes `const normalized = value.trim();`.
 * 6. Executes `if (normalized.length > maxLength) {`.
 * 7. Executes `return { ok: false as const, error: \`${label} is too long\` };`.
 * 8. Executes `}`.
 * 9. Executes `return { ok: true as const, value: normalized || undefined };`.
 */
function parseOptionalText(value: unknown, label: string, maxLength: number) {
  if (value == null) return { ok: true as const, value: undefined as string | undefined };
  if (typeof value !== "string") {
    return { ok: false as const, error: `${label} must be a string` };
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    return { ok: false as const, error: `${label} is too long` };
  }

  return { ok: true as const, value: normalized || undefined };
}

/**
 * AUTO-FUNCTION-COMMENT: loadBookingForResponse
 * Purpose: Handles load booking for response.
 * Line-by-line:
 * 1. Executes `return Booking.findById(id)`.
 * 2. Executes `.populate({ path: "clientId", select: "name email avatar role" })`.
 * 3. Executes `.populate({`.
 * 4. Executes `path: "barberId",`.
 * 5. Executes `select: "userId address state country avatar charge",`.
 * 6. Executes `populate: { path: "userId", select: "name email avatar role" },`.
 * 7. Executes `});`.
 */
async function loadBookingForResponse(id: string) {
  return Booking.findById(id)
    .populate({ path: "clientId", select: "name email avatar role" })
    .populate({
      path: "barberId",
      select: "userId address state country avatar charge",
      populate: { path: "userId", select: "name email avatar role" },
    });
}

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `const { id } = await params;`.
 * 7. Executes `if (!mongoose.Types.ObjectId.isValid(id)) {`.
 * 8. Executes `return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });`.
 * 9. Executes `}`.
 * 10. Executes `const booking = await loadBookingForResponse(id);`.
 * 11. Executes `if (!booking) {`.
 * 12. Executes `return NextResponse.json({ error: "Booking not found" }, { status: 404 });`.
 * 13. Executes `}`.
 * 14. Executes `const isOwner = getId(booking.clientId) === user.id;`.
 * 15. Executes `let isBarberOwner = false;`.
 * 16. Executes `if (user.role === "barber") {`.
 * 17. Executes `const barber = await Barber.findOne({ userId: user.id }).select("_id");`.
 * 18. Executes `isBarberOwner = barber ? getId(booking.barberId) === barber._id.toString() : false;`.
 * 19. Executes `}`.
 * 20. Executes `if (!isOwner && !isBarberOwner && !isAdminRole(user.role)) {`.
 * 21. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 22. Executes `}`.
 * 23. Executes `return NextResponse.json({ booking });`.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await loadBookingForResponse(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isOwner = getId(booking.clientId) === user.id;
  let isBarberOwner = false;

  if (user.role === "barber") {
    const barber = await Barber.findOne({ userId: user.id }).select("_id");
    isBarberOwner = barber ? getId(booking.barberId) === barber._id.toString() : false;
  }

  if (!isOwner && !isBarberOwner && !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ booking });
}

/**
 * AUTO-FUNCTION-COMMENT: PUT
 * Purpose: Handles put.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `const { id } = await params;`.
 * 7. Executes `if (!mongoose.Types.ObjectId.isValid(id)) {`.
 * 8. Executes `return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });`.
 * 9. Executes `}`.
 * 10. Executes `const booking = await Booking.findById(id);`.
 * 11. Executes `if (!booking) {`.
 * 12. Executes `return NextResponse.json({ error: "Booking not found" }, { status: 404 });`.
 * 13. Executes `}`.
 * 14. Executes `const isOwner = getId(booking.clientId) === user.id;`.
 * 15. Executes `let isBarberOwner = false;`.
 * 16. Executes `if (user.role === "barber") {`.
 * 17. Executes `const barber = await Barber.findOne({ userId: user.id }).select("_id");`.
 * 18. Executes `isBarberOwner = barber ? getId(booking.barberId) === barber._id.toString() : false;`.
 * 19. Executes `}`.
 * 20. Executes `const isAdmin = isAdminRole(user.role);`.
 * 21. Executes `if (!isOwner && !isBarberOwner && !isAdmin) {`.
 * 22. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 23. Executes `}`.
 * 24. Executes `const body = (await req.json()) as Record<string, unknown>;`.
 * 25. Executes `const previousDate = booking.dateTime?.toISOString();`.
 * 26. Executes `let nextStatus: string | undefined;`.
 * 27. Executes `let dateChanged = false;`.
 * 28. Executes `let hasChanges = false;`.
 * 29. Executes `if ("status" in body) {`.
 * 30. Executes `if (!isBarberOwner && !isAdmin) {`.
 * 31. Executes `return NextResponse.json(`.
 * 32. Executes `{ error: "Only the barber can update booking status" },`.
 * 33. Executes `{ status: 403 }`.
 * 34. Executes `);`.
 * 35. Executes `}`.
 * 36. Executes `if (typeof body.status !== "string" || !STATUS_OPTIONS.has(body.status)) {`.
 * 37. Executes `return NextResponse.json({ error: "Invalid status" }, { status: 400 });`.
 * 38. Executes `}`.
 * 39. Executes `nextStatus = body.status;`.
 * 40. Executes `booking.status = nextStatus as "pending" | "confirmed" | "completed" | "declined";`.
 * 41. Executes `hasChanges = true;`.
 * 42. Executes `}`.
 * 43. Executes `if ("service" in body) {`.
 * 44. Executes `if (!isBarberOwner && !isAdmin) {`.
 * 45. Executes `return NextResponse.json(`.
 * 46. Executes `{ error: "Only the barber can update service details" },`.
 * 47. Executes `{ status: 403 }`.
 * 48. Executes `);`.
 * 49. Executes `}`.
 * 50. Executes `if (typeof body.service !== "string" || !body.service.trim()) {`.
 * 51. Executes `return NextResponse.json({ error: "Service must be a string" }, { status: 400 });`.
 * 52. Executes `}`.
 * 53. Executes `const service = body.service.trim();`.
 * 54. Executes `if (service.length > 200) {`.
 * 55. Executes `return NextResponse.json({ error: "Service is too long" }, { status: 400 });`.
 * 56. Executes `}`.
 * 57. Executes `booking.service = service;`.
 * 58. Executes `hasChanges = true;`.
 * 59. Executes `}`.
 * 60. Executes `if ("address" in body) {`.
 * 61. Executes `const parsedAddress = parseOptionalText(body.address, "Address", 300);`.
 * 62. Executes `if (!parsedAddress.ok) {`.
 * 63. Executes `return NextResponse.json({ error: parsedAddress.error }, { status: 400 });`.
 * 64. Executes `}`.
 * 65. Executes `booking.address = parsedAddress.value;`.
 * 66. Executes `hasChanges = true;`.
 * 67. Executes `}`.
 * 68. Executes `if ("note" in body) {`.
 * 69. Executes `const parsedNote = parseOptionalText(body.note, "Note", 1000);`.
 * 70. Executes `if (!parsedNote.ok) {`.
 * 71. Executes `return NextResponse.json({ error: parsedNote.error }, { status: 400 });`.
 * 72. Executes `}`.
 * 73. Executes `booking.note = parsedNote.value;`.
 * 74. Executes `hasChanges = true;`.
 * 75. Executes `}`.
 * 76. Executes `if ("dateTime" in body) {`.
 * 77. Executes `if (typeof body.dateTime !== "string") {`.
 * 78. Executes `return NextResponse.json(`.
 * 79. Executes `{ error: "dateTime must be a valid datetime string" },`.
 * 80. Executes `{ status: 400 }`.
 * 81. Executes `);`.
 * 82. Executes `}`.
 * 83. Executes `const parsedDate = new Date(body.dateTime);`.
 * 84. Executes `if (Number.isNaN(parsedDate.getTime())) {`.
 * 85. Executes `return NextResponse.json(`.
 * 86. Executes `{ error: "dateTime must be a valid datetime string" },`.
 * 87. Executes `{ status: 400 }`.
 * 88. Executes `);`.
 * 89. Executes `}`.
 * 90. Executes `booking.dateTime = parsedDate;`.
 * 91. Executes `dateChanged = previousDate !== booking.dateTime.toISOString();`.
 * 92. Executes `hasChanges = true;`.
 * 93. Executes `if (dateChanged) {`.
 * 94. Executes `const conflictingBooking = await Booking.findOne({`.
 * 95. Executes `_id: { $ne: booking._id },`.
 * 96. Executes `barberId: booking.barberId,`.
 * 97. Executes `dateTime: parsedDate,`.
 * 98. Executes `status: { $in: ["pending", "confirmed"] },`.
 * 99. Executes `}).select("_id");`.
 * 100. Executes `if (conflictingBooking) {`.
 * 101. Executes `return NextResponse.json(`.
 * 102. Executes `{ error: "Selected timeslot is no longer available" },`.
 * 103. Executes `{ status: 409 }`.
 * 104. Executes `);`.
 * 105. Executes `}`.
 * 106. Executes `}`.
 * 107. Executes `}`.
 * 108. Executes `if (!hasChanges) {`.
 * 109. Executes `return NextResponse.json(`.
 * 110. Executes `{ error: "No updatable fields were provided" },`.
 * 111. Executes `{ status: 400 }`.
 * 112. Executes `);`.
 * 113. Executes `}`.
 * 114. Executes `await booking.save();`.
 * 115. Executes `if (nextStatus === "declined") {`.
 * 116. Executes `await notifyUser({`.
 * 117. Executes `userId: booking.clientId.toString(),`.
 * 118. Executes `title: "Booking declined",`.
 * 119. Executes `message: \`Your booking for ${booking.service} was declined\`,`.
 * 120. Executes `type: "booking_declined",`.
 * 121. Executes `data: {`.
 * 122. Executes `bookingId: booking._id.toString(),`.
 * 123. Executes `service: booking.service,`.
 * 124. Executes `dateTime: booking.dateTime,`.
 * 125. Executes `},`.
 * 126. Executes `});`.
 * 127. Executes `} else if (nextStatus === "confirmed") {`.
 * 128. Executes `await notifyUser({`.
 * 129. Executes `userId: booking.clientId.toString(),`.
 * 130. Executes `title: "Booking accepted",`.
 * 131. Executes `message: \`Your booking for ${booking.service} was accepted\`,`.
 * 132. Executes `type: "booking_accepted",`.
 * 133. Executes `data: {`.
 * 134. Executes `bookingId: booking._id.toString(),`.
 * 135. Executes `service: booking.service,`.
 * 136. Executes `dateTime: booking.dateTime,`.
 * 137. Executes `},`.
 * 138. Executes `});`.
 * 139. Executes `} else if (dateChanged) {`.
 * 140. Executes `const barber = await Barber.findById(booking.barberId).select("userId");`.
 * 141. Executes `const targetUserIds = new Set<string>();`.
 * 142. Executes `if (isBarberOwner) {`.
 * 143. Executes `targetUserIds.add(booking.clientId.toString());`.
 * 144. Executes `} else if (isOwner) {`.
 * 145. Executes `if (barber?.userId) {`.
 * 146. Executes `targetUserIds.add(barber.userId.toString());`.
 * 147. Executes `}`.
 * 148. Executes `} else {`.
 * 149. Executes `targetUserIds.add(booking.clientId.toString());`.
 * 150. Executes `if (barber?.userId) {`.
 * 151. Executes `targetUserIds.add(barber.userId.toString());`.
 * 152. Executes `}`.
 * 153. Executes `}`.
 * 154. Executes `await Promise.all(`.
 * 155. Executes `Array.from(targetUserIds)`.
 * 156. Executes `.filter(Boolean)`.
 * 157. Executes `.map((targetUserId) =>`.
 * 158. Executes `notifyUser({`.
 * 159. Executes `userId: targetUserId,`.
 * 160. Executes `title: "Booking rescheduled",`.
 * 161. Executes `message: \`${booking.service} moved to ${new Date(`.
 * 162. Executes `booking.dateTime`.
 * 163. Executes `).toLocaleString()}\`,`.
 * 164. Executes `type: "booking_rescheduled",`.
 * 165. Executes `data: { bookingId: booking._id.toString() },`.
 * 166. Executes `})`.
 * 167. Executes `)`.
 * 168. Executes `);`.
 * 169. Executes `}`.
 * 170. Executes `const bookingResponse = await loadBookingForResponse(booking._id.toString());`.
 * 171. Executes `return NextResponse.json({ booking: bookingResponse ?? booking });`.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isOwner = getId(booking.clientId) === user.id;
  let isBarberOwner = false;

  if (user.role === "barber") {
    const barber = await Barber.findOne({ userId: user.id }).select("_id");
    isBarberOwner = barber ? getId(booking.barberId) === barber._id.toString() : false;
  }

  const isAdmin = isAdminRole(user.role);
  if (!isOwner && !isBarberOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const previousDate = booking.dateTime?.toISOString();
  let nextStatus: string | undefined;
  let dateChanged = false;
  let hasChanges = false;

  if ("status" in body) {
    if (!isBarberOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only the barber can update booking status" },
        { status: 403 }
      );
    }

    if (typeof body.status !== "string" || !STATUS_OPTIONS.has(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    nextStatus = body.status;
    booking.status = nextStatus as "pending" | "confirmed" | "completed" | "declined";
    hasChanges = true;
  }

  if ("service" in body) {
    if (!isBarberOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only the barber can update service details" },
        { status: 403 }
      );
    }

    if (typeof body.service !== "string" || !body.service.trim()) {
      return NextResponse.json({ error: "Service must be a string" }, { status: 400 });
    }
    const service = body.service.trim();
    if (service.length > 200) {
      return NextResponse.json({ error: "Service is too long" }, { status: 400 });
    }
    booking.service = service;
    hasChanges = true;
  }

  if ("address" in body) {
    const parsedAddress = parseOptionalText(body.address, "Address", 300);
    if (!parsedAddress.ok) {
      return NextResponse.json({ error: parsedAddress.error }, { status: 400 });
    }
    booking.address = parsedAddress.value;
    hasChanges = true;
  }

  if ("note" in body) {
    const parsedNote = parseOptionalText(body.note, "Note", 1000);
    if (!parsedNote.ok) {
      return NextResponse.json({ error: parsedNote.error }, { status: 400 });
    }
    booking.note = parsedNote.value;
    hasChanges = true;
  }

  if ("dateTime" in body) {
    if (typeof body.dateTime !== "string") {
      return NextResponse.json(
        { error: "dateTime must be a valid datetime string" },
        { status: 400 }
      );
    }
    const parsedDate = new Date(body.dateTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "dateTime must be a valid datetime string" },
        { status: 400 }
      );
    }

    booking.dateTime = parsedDate;
    dateChanged = previousDate !== booking.dateTime.toISOString();
    hasChanges = true;

    if (dateChanged) {
      const conflictingBooking = await Booking.findOne({
        _id: { $ne: booking._id },
        barberId: booking.barberId,
        dateTime: parsedDate,
        status: { $in: ["pending", "confirmed"] },
      }).select("_id");

      if (conflictingBooking) {
        return NextResponse.json(
          { error: "Selected timeslot is no longer available" },
          { status: 409 }
        );
      }
    }
  }

  if (!hasChanges) {
    return NextResponse.json(
      { error: "No updatable fields were provided" },
      { status: 400 }
    );
  }

  await booking.save();

  if (nextStatus === "declined") {
    await notifyUser({
      userId: booking.clientId.toString(),
      title: "Booking declined",
      message: `Your booking for ${booking.service} was declined`,
      type: "booking_declined",
      data: {
        bookingId: booking._id.toString(),
        service: booking.service,
        dateTime: booking.dateTime,
      },
    });
  } else if (nextStatus === "confirmed") {
    await notifyUser({
      userId: booking.clientId.toString(),
      title: "Booking accepted",
      message: `Your booking for ${booking.service} was accepted`,
      type: "booking_accepted",
      data: {
        bookingId: booking._id.toString(),
        service: booking.service,
        dateTime: booking.dateTime,
      },
    });
  } else if (dateChanged) {
    const barber = await Barber.findById(booking.barberId).select("userId");
    const targetUserIds = new Set<string>();

    if (isBarberOwner) {
      targetUserIds.add(booking.clientId.toString());
    } else if (isOwner) {
      if (barber?.userId) {
        targetUserIds.add(barber.userId.toString());
      }
    } else {
      targetUserIds.add(booking.clientId.toString());
      if (barber?.userId) {
        targetUserIds.add(barber.userId.toString());
      }
    }

    await Promise.all(
      Array.from(targetUserIds)
        .filter(Boolean)
        .map((targetUserId) =>
          notifyUser({
            userId: targetUserId,
            title: "Booking rescheduled",
            message: `${booking.service} moved to ${new Date(
              booking.dateTime
            ).toLocaleString()}`,
            type: "booking_rescheduled",
            data: { bookingId: booking._id.toString() },
          })
        )
    );
  }

  const bookingResponse = await loadBookingForResponse(booking._id.toString());
  return NextResponse.json({ booking: bookingResponse ?? booking });
}
