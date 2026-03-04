import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import User from "@/models/User";
import Barber from "@/models/Barber";
import Client from "@/models/Client";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import Service from "@/models/Service";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    clientsCount,
    barbersCount,
    adminsCount,
    superadminsCount,
    barberProfilesCount,
    clientProfilesCount,
    subscribedBarbersCount,
    servicesCount,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    declinedBookings,
    paidBookings,
    unpaidBookings,
    totalTransactions,
    successfulTransactions,
    pendingTransactions,
    failedTransactions,
    revenueAgg,
    recentBookings,
    recentTransactions,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "client" }),
    User.countDocuments({ role: "barber" }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "superadmin" }),
    Barber.countDocuments({}),
    Client.countDocuments({}),
    Barber.countDocuments({ isSubscribed: true }),
    Service.countDocuments({}),
    Booking.countDocuments({}),
    Booking.countDocuments({ status: "pending" }),
    Booking.countDocuments({ status: "confirmed" }),
    Booking.countDocuments({ status: "completed" }),
    Booking.countDocuments({ status: "declined" }),
    Booking.countDocuments({ paymentStatus: "paid" }),
    Booking.countDocuments({ paymentStatus: { $ne: "paid" } }),
    Transaction.countDocuments({}),
    Transaction.countDocuments({ status: "success" }),
    Transaction.countDocuments({ status: "pending" }),
    Transaction.countDocuments({ status: "failed" }),
    Transaction.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
    Booking.find({})
      .sort({ createdAt: -1, _id: -1 })
      .limit(8)
      .populate("clientId")
      .populate({ path: "barberId", populate: { path: "userId" } })
      .lean(),
    Transaction.find({})
      .sort({ createdAt: -1, _id: -1 })
      .limit(8)
      .populate("userId")
      .populate("bookingId")
      .lean(),
  ]);

  const revenue = Number(revenueAgg?.[0]?.total ?? 0);

  return NextResponse.json({
    stats: {
      users: {
        total: totalUsers,
        clients: clientsCount,
        barbers: barbersCount,
        admins: adminsCount,
        superadmins: superadminsCount,
      },
      profiles: {
        barberProfiles: barberProfilesCount,
        clientProfiles: clientProfilesCount,
        subscribedBarbers: subscribedBarbersCount,
      },
      services: {
        total: servicesCount,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        declined: declinedBookings,
        paid: paidBookings,
        unpaid: unpaidBookings,
      },
      transactions: {
        total: totalTransactions,
        success: successfulTransactions,
        pending: pendingTransactions,
        failed: failedTransactions,
        revenue,
      },
    },
    recent: {
      bookings: recentBookings,
      transactions: recentTransactions,
    },
  });
}

