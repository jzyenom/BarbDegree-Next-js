import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import Service from "@/models/Service";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

type IdLike = { toString(): string } | string;

type BarberListDoc = {
  _id: IdLike;
  [key: string]: unknown;
};

function toIdString(value: IdLike) {
  return typeof value === "string" ? value : value.toString();
}


export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const barbers = (await Barber.find({})
    .sort({ createdAt: -1, _id: -1 })
    .populate({ path: "userId", select: "name email avatar role" })
    .lean()) as unknown as BarberListDoc[];
  const barberIds = barbers.map((barber) => barber._id);

  const [serviceCounts, bookingCounts, reviewStats] = await Promise.all([
    Service.aggregate([
      { $match: { barberId: { $in: barberIds } } },
      { $group: { _id: "$barberId", servicesCount: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $match: { barberId: { $in: barberIds } } },
      {
        $group: {
          _id: "$barberId",
          bookingsCount: { $sum: 1 },
          paidBookings: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
          },
        },
      },
    ]),
    Review.aggregate([
      { $match: { barberId: { $in: barberIds } } },
      {
        $group: {
          _id: "$barberId",
          reviewsCount: { $sum: 1 },
          averageRating: { $avg: "$rate" },
        },
      },
    ]),
  ]);
  const servicesByBarber = new Map(
    serviceCounts.map((item) => [item._id.toString(), item.servicesCount])
  );
  const bookingsByBarber = new Map(
    bookingCounts.map((item) => [item._id.toString(), item])
  );
  const reviewsByBarber = new Map(
    reviewStats.map((item) => [item._id.toString(), item])
  );

  const enrichedBarbers = barbers.map((barber) => {
    const id = toIdString(barber._id);
    const bookingStat = bookingsByBarber.get(id);
    const reviewStat = reviewsByBarber.get(id);

    return {
      ...barber,
      servicesCount: servicesByBarber.get(id) ?? 0,
      bookingsCount: bookingStat?.bookingsCount ?? 0,
      paidBookings: bookingStat?.paidBookings ?? 0,
      reviewsCount: reviewStat?.reviewsCount ?? 0,
      averageRating: reviewStat?.averageRating
        ? Number(reviewStat.averageRating.toFixed(1))
        : null,
    };
  });

  return NextResponse.json({ barbers: enrichedBarbers });
}
