/**
 * AUTO-FILE-COMMENT: src/app/api/bookings/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import { requireAuth } from "@/lib/authGuard";
import { ensureDefaultServicesForBarber } from "@/lib/defaultServices";
import { notifyUser } from "@/lib/notify";
import { isAdminRole } from "@/lib/roles";

type BookingFilter = Record<string, unknown>;

type IncomingServiceRef = {
  _id?: string;
  id?: string;
  serviceId?: string;
};

type ServiceSummary = {
  _id: { toString(): string };
  name: string;
  price: number;
  durationMinutes?: number;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_SERVICE_FILTER_LENGTH = 120;
const MAX_NAME_LENGTH = 80;
const MAX_ADDRESS_LENGTH = 300;
const MAX_NOTE_LENGTH = 1000;

/**
 * AUTO-FUNCTION-COMMENT: parseDayStart
 * Purpose: Handles parse day start.
 * Line-by-line:
 * 1. Executes `return new Date(\`${day}T00:00:00.000\`);`.
 */
function parseDayStart(day: string) {
  return new Date(`${day}T00:00:00.000`);
}

/**
 * AUTO-FUNCTION-COMMENT: parseDayEnd
 * Purpose: Handles parse day end.
 * Line-by-line:
 * 1. Executes `return new Date(\`${day}T23:59:59.999\`);`.
 */
function parseDayEnd(day: string) {
  return new Date(`${day}T23:59:59.999`);
}

/**
 * AUTO-FUNCTION-COMMENT: collectServiceIds
 * Purpose: Handles collect service ids.
 * Line-by-line:
 * 1. Executes `const ids: string[] = [];`.
 * 2. Executes `if (typeof body.serviceId === "string") {`.
 * 3. Executes `ids.push(body.serviceId);`.
 * 4. Executes `}`.
 * 5. Executes `if (Array.isArray(body.serviceIds)) {`.
 * 6. Executes `body.serviceIds.forEach((value) => {`.
 * 7. Executes `if (typeof value === "string") {`.
 * 8. Executes `ids.push(value);`.
 * 9. Executes `}`.
 * 10. Executes `});`.
 * 11. Executes `}`.
 * 12. Executes `if (Array.isArray(body.services)) {`.
 * 13. Executes `body.services.forEach((value) => {`.
 * 14. Executes `if (!value || typeof value !== "object" || Array.isArray(value)) {`.
 * 15. Executes `return;`.
 * 16. Executes `}`.
 * 17. Executes `const item = value as IncomingServiceRef;`.
 * 18. Executes `const id = item.serviceId ?? item._id ?? item.id;`.
 * 19. Executes `if (typeof id === "string") {`.
 * 20. Executes `ids.push(id);`.
 * 21. Executes `}`.
 * 22. Executes `});`.
 * 23. Executes `}`.
 * 24. Executes `const uniqueIds: string[] = [];`.
 * 25. Executes `ids.forEach((id) => {`.
 * 26. Executes `const normalizedId = id.trim();`.
 * 27. Executes `if (`.
 * 28. Executes `normalizedId &&`.
 * 29. Executes `mongoose.Types.ObjectId.isValid(normalizedId) &&`.
 * 30. Executes `!uniqueIds.includes(normalizedId)`.
 * 31. Executes `) {`.
 * 32. Executes `uniqueIds.push(normalizedId);`.
 * 33. Executes `}`.
 * 34. Executes `});`.
 * 35. Executes `return uniqueIds;`.
 */
function collectServiceIds(body: Record<string, unknown>) {
  const ids: string[] = [];

  if (typeof body.serviceId === "string") {
    ids.push(body.serviceId);
  }

  if (Array.isArray(body.serviceIds)) {
    body.serviceIds.forEach((value) => {
      if (typeof value === "string") {
        ids.push(value);
      }
    });
  }

  if (Array.isArray(body.services)) {
    body.services.forEach((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return;
      }

      const item = value as IncomingServiceRef;
      const id = item.serviceId ?? item._id ?? item.id;
      if (typeof id === "string") {
        ids.push(id);
      }
    });
  }

  const uniqueIds: string[] = [];
  ids.forEach((id) => {
    const normalizedId = id.trim();
    if (
      normalizedId &&
      mongoose.Types.ObjectId.isValid(normalizedId) &&
      !uniqueIds.includes(normalizedId)
    ) {
      uniqueIds.push(normalizedId);
    }
  });

  return uniqueIds;
}

/**
 * AUTO-FUNCTION-COMMENT: parseOptionalText
 * Purpose: Handles parse optional text.
 * Line-by-line:
 * 1. Executes `if (value == null) return { ok: true as const, value: undefined as string | undefined };`.
 * 2. Executes `if (typeof value !== "string") {`.
 * 3. Executes `return { ok: false as const, error: \`${field} must be a string\` };`.
 * 4. Executes `}`.
 * 5. Executes `const normalized = value.trim();`.
 * 6. Executes `if (normalized.length > maxLength) {`.
 * 7. Executes `return { ok: false as const, error: \`${field} is too long\` };`.
 * 8. Executes `}`.
 * 9. Executes `return { ok: true as const, value: normalized || undefined };`.
 */
function parseOptionalText(value: unknown, field: string, maxLength: number) {
  if (value == null) return { ok: true as const, value: undefined as string | undefined };
  if (typeof value !== "string") {
    return { ok: false as const, error: `${field} must be a string` };
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    return { ok: false as const, error: `${field} is too long` };
  }

  return { ok: true as const, value: normalized || undefined };
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
 * 6. Executes `const url = new URL(req.url);`.
 * 7. Executes `const date = url.searchParams.get("date")?.trim() || "";`.
 * 8. Executes `const service = url.searchParams.get("service")?.trim() || "";`.
 * 9. Executes `const from = url.searchParams.get("from")?.trim() || "";`.
 * 10. Executes `const to = url.searchParams.get("to")?.trim() || "";`.
 * 11. Executes `if (date && !DATE_ONLY_PATTERN.test(date)) {`.
 * 12. Executes `return NextResponse.json({ error: "Invalid date format" }, { status: 400 });`.
 * 13. Executes `}`.
 * 14. Executes `if (from && !DATE_ONLY_PATTERN.test(from)) {`.
 * 15. Executes `return NextResponse.json({ error: "Invalid from date format" }, { status: 400 });`.
 * 16. Executes `}`.
 * 17. Executes `if (to && !DATE_ONLY_PATTERN.test(to)) {`.
 * 18. Executes `return NextResponse.json({ error: "Invalid to date format" }, { status: 400 });`.
 * 19. Executes `}`.
 * 20. Executes `if (service.length > MAX_SERVICE_FILTER_LENGTH) {`.
 * 21. Executes `return NextResponse.json({ error: "Service filter is too long" }, { status: 400 });`.
 * 22. Executes `}`.
 * 23. Executes `if (from && to) {`.
 * 24. Executes `const fromDate = parseDayStart(from);`.
 * 25. Executes `const toDate = parseDayEnd(to);`.
 * 26. Executes `if (fromDate.getTime() > toDate.getTime()) {`.
 * 27. Executes `return NextResponse.json(`.
 * 28. Executes `{ error: "From date cannot be after to date" },`.
 * 29. Executes `{ status: 400 }`.
 * 30. Executes `);`.
 * 31. Executes `}`.
 * 32. Executes `}`.
 * 33. Executes `const filter: BookingFilter = {};`.
 * 34. Executes `if (user.role === "barber") {`.
 * 35. Executes `const barber = await Barber.findOne({ userId: user.id }).select("_id");`.
 * 36. Executes `if (!barber) {`.
 * 37. Executes `return NextResponse.json({ bookings: [] });`.
 * 38. Executes `}`.
 * 39. Executes `filter.barberId = barber._id;`.
 * 40. Executes `} else if (!isAdminRole(user.role)) {`.
 * 41. Executes `filter.clientId = user.id;`.
 * 42. Executes `}`.
 * 43. Executes `if (date) {`.
 * 44. Executes `filter.dateTime = {`.
 * 45. Executes `$gte: parseDayStart(date),`.
 * 46. Executes `$lte: parseDayEnd(date),`.
 * 47. Executes `};`.
 * 48. Executes `}`.
 * 49. Executes `if (service) {`.
 * 50. Executes `filter.service = service;`.
 * 51. Executes `}`.
 * 52. Executes `if (from || to) {`.
 * 53. Executes `filter.dateTime = {`.
 * 54. Executes `...(filter.dateTime || {}),`.
 * 55. Executes `...(from ? { $gte: parseDayStart(from) } : {}),`.
 * 56. Executes `...(to ? { $lte: parseDayEnd(to) } : {}),`.
 * 57. Executes `};`.
 * 58. Executes `}`.
 * 59. Executes `const requestedLimit = Number(url.searchParams.get("limit") || 100);`.
 * 60. Executes `const normalizedLimit = Number.isFinite(requestedLimit)`.
 * 61. Executes `? Math.floor(requestedLimit)`.
 * 62. Executes `: 100;`.
 * 63. Executes `const maxLimit = isAdminRole(user.role) ? 500 : 200;`.
 * 64. Executes `const limit = Math.min(Math.max(normalizedLimit, 1), maxLimit);`.
 * 65. Executes `const bookings = await Booking.find(filter)`.
 * 66. Executes `.sort({ dateTime: -1, _id: -1 })`.
 * 67. Executes `.limit(limit)`.
 * 68. Executes `.populate({ path: "clientId", select: "name email avatar role" })`.
 * 69. Executes `.populate({`.
 * 70. Executes `path: "barberId",`.
 * 71. Executes `select: "userId address state country avatar charge",`.
 * 72. Executes `populate: { path: "userId", select: "name email avatar role" },`.
 * 73. Executes `});`.
 * 74. Executes `return NextResponse.json({ bookings });`.
 */
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date")?.trim() || "";
  const service = url.searchParams.get("service")?.trim() || "";
  const from = url.searchParams.get("from")?.trim() || "";
  const to = url.searchParams.get("to")?.trim() || "";

  if (date && !DATE_ONLY_PATTERN.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }
  if (from && !DATE_ONLY_PATTERN.test(from)) {
    return NextResponse.json({ error: "Invalid from date format" }, { status: 400 });
  }
  if (to && !DATE_ONLY_PATTERN.test(to)) {
    return NextResponse.json({ error: "Invalid to date format" }, { status: 400 });
  }
  if (service.length > MAX_SERVICE_FILTER_LENGTH) {
    return NextResponse.json({ error: "Service filter is too long" }, { status: 400 });
  }
  if (from && to) {
    const fromDate = parseDayStart(from);
    const toDate = parseDayEnd(to);
    if (fromDate.getTime() > toDate.getTime()) {
      return NextResponse.json(
        { error: "From date cannot be after to date" },
        { status: 400 }
      );
    }
  }

  const filter: BookingFilter = {};

  if (user.role === "barber") {
    const barber = await Barber.findOne({ userId: user.id }).select("_id");
    if (!barber) {
      return NextResponse.json({ bookings: [] });
    }
    filter.barberId = barber._id;
  } else if (!isAdminRole(user.role)) {
    filter.clientId = user.id;
  }

  if (date) {
    filter.dateTime = {
      $gte: parseDayStart(date),
      $lte: parseDayEnd(date),
    };
  }
  if (service) {
    filter.service = service;
  }
  if (from || to) {
    filter.dateTime = {
      ...(filter.dateTime || {}),
      ...(from ? { $gte: parseDayStart(from) } : {}),
      ...(to ? { $lte: parseDayEnd(to) } : {}),
    };
  }

  const requestedLimit = Number(url.searchParams.get("limit") || 100);
  const normalizedLimit = Number.isFinite(requestedLimit)
    ? Math.floor(requestedLimit)
    : 100;
  const maxLimit = isAdminRole(user.role) ? 500 : 200;
  const limit = Math.min(Math.max(normalizedLimit, 1), maxLimit);

  const bookings = await Booking.find(filter)
    .sort({ dateTime: -1, _id: -1 })
    .limit(limit)
    .populate({ path: "clientId", select: "name email avatar role" })
    .populate({
      path: "barberId",
      select: "userId address state country avatar charge",
      populate: { path: "userId", select: "name email avatar role" },
    });

  return NextResponse.json({ bookings });
}

/**
 * AUTO-FUNCTION-COMMENT: POST
 * Purpose: Handles post.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `const body = (await req.json()) as Record<string, unknown>;`.
 * 7. Executes `const bookingNameInput =`.
 * 8. Executes `typeof body.name === "string" && body.name.trim()`.
 * 9. Executes `? body.name.trim()`.
 * 10. Executes `: user.name || "Client";`.
 * 11. Executes `if (!bookingNameInput || bookingNameInput.length > MAX_NAME_LENGTH) {`.
 * 12. Executes `return NextResponse.json({ error: "Invalid booking name" }, { status: 400 });`.
 * 13. Executes `}`.
 * 14. Executes `const bookingEmailInput =`.
 * 15. Executes `typeof body.email === "string" && body.email.trim()`.
 * 16. Executes `? body.email.trim().toLowerCase()`.
 * 17. Executes `: user.email?.trim()?.toLowerCase();`.
 * 18. Executes `if (!bookingEmailInput || !EMAIL_PATTERN.test(bookingEmailInput)) {`.
 * 19. Executes `return NextResponse.json(`.
 * 20. Executes `{ error: "A valid booking email is required" },`.
 * 21. Executes `{ status: 400 }`.
 * 22. Executes `);`.
 * 23. Executes `}`.
 * 24. Executes `const barberId =`.
 * 25. Executes `typeof body.barberId === "string" ? body.barberId.trim() : "";`.
 * 26. Executes `if (!mongoose.Types.ObjectId.isValid(barberId)) {`.
 * 27. Executes `return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });`.
 * 28. Executes `}`.
 * 29. Executes `const barber = await Barber.findById(barberId).select("_id userId isSubscribed");`.
 * 30. Executes `if (!barber) {`.
 * 31. Executes `return NextResponse.json({ error: "Barber not found" }, { status: 404 });`.
 * 32. Executes `}`.
 * 33. Executes `if (!barber.isSubscribed) {`.
 * 34. Executes `return NextResponse.json(`.
 * 35. Executes `{ error: "Barber is not subscribed" },`.
 * 36. Executes `{ status: 403 }`.
 * 37. Executes `);`.
 * 38. Executes `}`.
 * 39. Executes `const requestedServiceIds = collectServiceIds(body);`.
 * 40. Executes `if (requestedServiceIds.length === 0) {`.
 * 41. Executes `return NextResponse.json(`.
 * 42. Executes `{ error: "Select at least one service offered by this barber" },`.
 * 43. Executes `{ status: 400 }`.
 * 44. Executes `);`.
 * 45. Executes `}`.
 * 46. Executes `const services = (await Service.find({`.
 * 47. Executes `_id: { $in: requestedServiceIds },`.
 * 48. Executes `barberId: barber._id,`.
 * 49. Executes `isActive: true,`.
 * 50. Executes `})`.
 * 51. Executes `.select("_id name price durationMinutes")`.
 * 52. Executes `.lean()) as unknown as ServiceSummary[];`.
 * 53. Executes `if (services.length !== requestedServiceIds.length) {`.
 * 54. Executes `return NextResponse.json(`.
 * 55. Executes `{ error: "One or more selected services are invalid for this barber" },`.
 * 56. Executes `{ status: 400 }`.
 * 57. Executes `);`.
 * 58. Executes `}`.
 * 59. Executes `const servicesById = new Map(`.
 * 60. Executes `services.map((service) => [service._id.toString(), service])`.
 * 61. Executes `);`.
 * 62. Executes `const orderedServices = requestedServiceIds`.
 * 63. Executes `.map((id) => servicesById.get(id))`.
 * 64. Executes `.filter((service): service is ServiceSummary => Boolean(service));`.
 * 65. Executes `const dateTime =`.
 * 66. Executes `typeof body.dateTime === "string" ? new Date(body.dateTime) : null;`.
 * 67. Executes `if (!dateTime || Number.isNaN(dateTime.getTime())) {`.
 * 68. Executes `return NextResponse.json(`.
 * 69. Executes `{ error: "A valid booking date and time is required" },`.
 * 70. Executes `{ status: 400 }`.
 * 71. Executes `);`.
 * 72. Executes `}`.
 * 73. Executes `const now = Date.now();`.
 * 74. Executes `if (dateTime.getTime() < now - 60 * 1000) {`.
 * 75. Executes `return NextResponse.json(`.
 * 76. Executes `{ error: "Booking time cannot be in the past" },`.
 * 77. Executes `{ status: 400 }`.
 * 78. Executes `);`.
 * 79. Executes `}`.
 * 80. Executes `if (dateTime.getTime() > now + 365 * 24 * 60 * 60 * 1000) {`.
 * 81. Executes `return NextResponse.json(`.
 * 82. Executes `{ error: "Booking time is too far in the future" },`.
 * 83. Executes `{ status: 400 }`.
 * 84. Executes `);`.
 * 85. Executes `}`.
 * 86. Executes `const parsedAddress = parseOptionalText(body.address, "Address", MAX_ADDRESS_LENGTH);`.
 * 87. Executes `if (!parsedAddress.ok) {`.
 * 88. Executes `return NextResponse.json({ error: parsedAddress.error }, { status: 400 });`.
 * 89. Executes `}`.
 * 90. Executes `const parsedNote = parseOptionalText(body.note, "Note", MAX_NOTE_LENGTH);`.
 * 91. Executes `if (!parsedNote.ok) {`.
 * 92. Executes `return NextResponse.json({ error: parsedNote.error }, { status: 400 });`.
 * 93. Executes `}`.
 * 94. Executes `const existingBooking = await Booking.findOne({`.
 * 95. Executes `barberId: barber._id,`.
 * 96. Executes `dateTime,`.
 * 97. Executes `status: { $in: ["pending", "confirmed"] },`.
 * 98. Executes `}).select("_id");`.
 * 99. Executes `if (existingBooking) {`.
 * 100. Executes `return NextResponse.json(`.
 * 101. Executes `{ error: "Selected timeslot is no longer available" },`.
 * 102. Executes `{ status: 409 }`.
 * 103. Executes `);`.
 * 104. Executes `}`.
 * 105. Executes `const selectedServices = orderedServices.map((service) => ({`.
 * 106. Executes `serviceId: service._id,`.
 * 107. Executes `name: service.name,`.
 * 108. Executes `price: service.price,`.
 * 109. Executes `durationMinutes: service.durationMinutes,`.
 * 110. Executes `}));`.
 * 111. Executes `const computedService = selectedServices.map((service) => service.name).join(", ");`.
 * 112. Executes `const computedPrice = selectedServices.reduce(`.
 * 113. Executes `(sum, service) => sum + (service.price || 0),`.
 * 114. Executes `0`.
 * 115. Executes `);`.
 * 116. Executes `const booking = await Booking.create({`.
 * 117. Executes `barberId: barber._id,`.
 * 118. Executes `clientId: user.id,`.
 * 119. Executes `name: bookingNameInput,`.
 * 120. Executes `email: bookingEmailInput,`.
 * 121. Executes `address: parsedAddress.value,`.
 * 122. Executes `note: parsedNote.value,`.
 * 123. Executes `dateTime,`.
 * 124. Executes `service: computedService,`.
 * 125. Executes `serviceIds: selectedServices.map((service) => service.serviceId),`.
 * 126. Executes `services: selectedServices,`.
 * 127. Executes `estimatedPrice: computedPrice,`.
 * 128. Executes `});`.
 * 129. Executes `await notifyUser({`.
 * 130. Executes `userId: barber.userId.toString(),`.
 * 131. Executes `title: "New booking",`.
 * 132. Executes `message: \`${booking.service} booked for ${new Date(`.
 * 133. Executes `booking.dateTime`.
 * 134. Executes `).toLocaleString()}\`,`.
 * 135. Executes `type: "booking_created",`.
 * 136. Executes `data: { bookingId: booking._id.toString() },`.
 * 137. Executes `});`.
 * 138. Executes `return NextResponse.json({ booking }, { status: 201 });`.
 */
export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Record<string, unknown>;

  const bookingNameInput =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : user.name || "Client";
  if (!bookingNameInput || bookingNameInput.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Invalid booking name" }, { status: 400 });
  }

  const bookingEmailInput =
    typeof body.email === "string" && body.email.trim()
      ? body.email.trim().toLowerCase()
      : user.email?.trim()?.toLowerCase();
  if (!bookingEmailInput || !EMAIL_PATTERN.test(bookingEmailInput)) {
    return NextResponse.json(
      { error: "A valid booking email is required" },
      { status: 400 }
    );
  }

  const barberId =
    typeof body.barberId === "string" ? body.barberId.trim() : "";
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });
  }

  const barber = await Barber.findById(barberId).select("_id userId isSubscribed");
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }
  if (!barber.isSubscribed) {
    return NextResponse.json(
      { error: "Barber is not subscribed" },
      { status: 403 }
    );
  }

  await ensureDefaultServicesForBarber(barber._id);

  const requestedServiceIds = collectServiceIds(body);
  if (requestedServiceIds.length === 0) {
    return NextResponse.json(
      { error: "Select at least one service offered by this barber" },
      { status: 400 }
    );
  }

  const services = (await Service.find({
    _id: { $in: requestedServiceIds },
    barberId: barber._id,
    isActive: true,
  })
    .select("_id name price durationMinutes")
    .lean()) as unknown as ServiceSummary[];

  if (services.length !== requestedServiceIds.length) {
    return NextResponse.json(
      { error: "One or more selected services are invalid for this barber" },
      { status: 400 }
    );
  }

  const servicesById = new Map(
    services.map((service) => [service._id.toString(), service])
  );
  const orderedServices = requestedServiceIds
    .map((id) => servicesById.get(id))
    .filter((service): service is ServiceSummary => Boolean(service));

  const dateTime =
    typeof body.dateTime === "string" ? new Date(body.dateTime) : null;
  if (!dateTime || Number.isNaN(dateTime.getTime())) {
    return NextResponse.json(
      { error: "A valid booking date and time is required" },
      { status: 400 }
    );
  }
  const now = Date.now();
  if (dateTime.getTime() < now - 60 * 1000) {
    return NextResponse.json(
      { error: "Booking time cannot be in the past" },
      { status: 400 }
    );
  }
  if (dateTime.getTime() > now + 365 * 24 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "Booking time is too far in the future" },
      { status: 400 }
    );
  }

  const parsedAddress = parseOptionalText(body.address, "Address", MAX_ADDRESS_LENGTH);
  if (!parsedAddress.ok) {
    return NextResponse.json({ error: parsedAddress.error }, { status: 400 });
  }
  const parsedNote = parseOptionalText(body.note, "Note", MAX_NOTE_LENGTH);
  if (!parsedNote.ok) {
    return NextResponse.json({ error: parsedNote.error }, { status: 400 });
  }

  const existingBooking = await Booking.findOne({
    barberId: barber._id,
    dateTime,
    status: { $in: ["pending", "confirmed"] },
  }).select("_id");
  if (existingBooking) {
    return NextResponse.json(
      { error: "Selected timeslot is no longer available" },
      { status: 409 }
    );
  }

  const selectedServices = orderedServices.map((service) => ({
    serviceId: service._id,
    name: service.name,
    price: service.price,
    durationMinutes: service.durationMinutes,
  }));
  const computedService = selectedServices.map((service) => service.name).join(", ");
  const computedPrice = selectedServices.reduce(
    (sum, service) => sum + (service.price || 0),
    0
  );

  const booking = await Booking.create({
    barberId: barber._id,
    clientId: user.id,
    name: bookingNameInput,
    email: bookingEmailInput,
    address: parsedAddress.value,
    note: parsedNote.value,
    dateTime,
    service: computedService,
    serviceIds: selectedServices.map((service) => service.serviceId),
    services: selectedServices,
    estimatedPrice: computedPrice,
  });

  await notifyUser({
    userId: barber.userId.toString(),
    title: "New booking",
    message: `${booking.service} booked for ${new Date(
      booking.dateTime
    ).toLocaleString()}`,
    type: "booking_created",
    data: { bookingId: booking._id.toString() },
  });

  return NextResponse.json({ booking }, { status: 201 });
}
