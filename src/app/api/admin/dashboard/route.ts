/**
 * AUTO-FILE-COMMENT: src/app/api/admin/dashboard/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
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

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `if (!isAdminRole(user.role)) {`.
 * 7. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 8. Executes `}`.
 * 9. Executes `const [`.
 * 10. Executes `totalUsers,`.
 * 11. Executes `clientsCount,`.
 * 12. Executes `barbersCount,`.
 * 13. Executes `adminsCount,`.
 * 14. Executes `superadminsCount,`.
 * 15. Executes `barberProfilesCount,`.
 * 16. Executes `clientProfilesCount,`.
 * 17. Executes `subscribedBarbersCount,`.
 * 18. Executes `servicesCount,`.
 * 19. Executes `totalBookings,`.
 * 20. Executes `pendingBookings,`.
 * 21. Executes `confirmedBookings,`.
 * 22. Executes `completedBookings,`.
 * 23. Executes `declinedBookings,`.
 * 24. Executes `paidBookings,`.
 * 25. Executes `unpaidBookings,`.
 * 26. Executes `totalTransactions,`.
 * 27. Executes `successfulTransactions,`.
 * 28. Executes `pendingTransactions,`.
 * 29. Executes `failedTransactions,`.
 * 30. Executes `revenueAgg,`.
 * 31. Executes `recentBookings,`.
 * 32. Executes `recentTransactions,`.
 * 33. Executes `] = await Promise.all([`.
 * 34. Executes `User.countDocuments({}),`.
 * 35. Executes `User.countDocuments({ role: "client" }),`.
 * 36. Executes `User.countDocuments({ role: "barber" }),`.
 * 37. Executes `User.countDocuments({ role: "admin" }),`.
 * 38. Executes `User.countDocuments({ role: "superadmin" }),`.
 * 39. Executes `Barber.countDocuments({}),`.
 * 40. Executes `Client.countDocuments({}),`.
 * 41. Executes `Barber.countDocuments({ isSubscribed: true }),`.
 * 42. Executes `Service.countDocuments({}),`.
 * 43. Executes `Booking.countDocuments({}),`.
 * 44. Executes `Booking.countDocuments({ status: "pending" }),`.
 * 45. Executes `Booking.countDocuments({ status: "confirmed" }),`.
 * 46. Executes `Booking.countDocuments({ status: "completed" }),`.
 * 47. Executes `Booking.countDocuments({ status: "declined" }),`.
 * 48. Executes `Booking.countDocuments({ paymentStatus: "paid" }),`.
 * 49. Executes `Booking.countDocuments({ paymentStatus: { $ne: "paid" } }),`.
 * 50. Executes `Transaction.countDocuments({}),`.
 * 51. Executes `Transaction.countDocuments({ status: "success" }),`.
 * 52. Executes `Transaction.countDocuments({ status: "pending" }),`.
 * 53. Executes `Transaction.countDocuments({ status: "failed" }),`.
 * 54. Executes `Transaction.aggregate([`.
 * 55. Executes `{ $match: { status: "success" } },`.
 * 56. Executes `{`.
 * 57. Executes `$group: {`.
 * 58. Executes `_id: null,`.
 * 59. Executes `total: { $sum: "$amount" },`.
 * 60. Executes `},`.
 * 61. Executes `},`.
 * 62. Executes `]),`.
 * 63. Executes `Booking.find({})`.
 * 64. Executes `.sort({ createdAt: -1, _id: -1 })`.
 * 65. Executes `.limit(8)`.
 * 66. Executes `.populate("clientId")`.
 * 67. Executes `.populate({ path: "barberId", populate: { path: "userId" } })`.
 * 68. Executes `.lean(),`.
 * 69. Executes `Transaction.find({})`.
 * 70. Executes `.sort({ createdAt: -1, _id: -1 })`.
 * 71. Executes `.limit(8)`.
 * 72. Executes `.populate("userId")`.
 * 73. Executes `.populate("bookingId")`.
 * 74. Executes `.lean(),`.
 * 75. Executes `]);`.
 * 76. Executes `const revenue = Number(revenueAgg?.[0]?.total ?? 0);`.
 * 77. Executes `return NextResponse.json({`.
 * 78. Executes `stats: {`.
 * 79. Executes `users: {`.
 * 80. Executes `total: totalUsers,`.
 * 81. Executes `clients: clientsCount,`.
 * 82. Executes `barbers: barbersCount,`.
 * 83. Executes `admins: adminsCount,`.
 * 84. Executes `superadmins: superadminsCount,`.
 * 85. Executes `},`.
 * 86. Executes `profiles: {`.
 * 87. Executes `barberProfiles: barberProfilesCount,`.
 * 88. Executes `clientProfiles: clientProfilesCount,`.
 * 89. Executes `subscribedBarbers: subscribedBarbersCount,`.
 * 90. Executes `},`.
 * 91. Executes `services: {`.
 * 92. Executes `total: servicesCount,`.
 * 93. Executes `},`.
 * 94. Executes `bookings: {`.
 * 95. Executes `total: totalBookings,`.
 * 96. Executes `pending: pendingBookings,`.
 * 97. Executes `confirmed: confirmedBookings,`.
 * 98. Executes `completed: completedBookings,`.
 * 99. Executes `declined: declinedBookings,`.
 * 100. Executes `paid: paidBookings,`.
 * 101. Executes `unpaid: unpaidBookings,`.
 * 102. Executes `},`.
 * 103. Executes `transactions: {`.
 * 104. Executes `total: totalTransactions,`.
 * 105. Executes `success: successfulTransactions,`.
 * 106. Executes `pending: pendingTransactions,`.
 * 107. Executes `failed: failedTransactions,`.
 * 108. Executes `revenue,`.
 * 109. Executes `},`.
 * 110. Executes `},`.
 * 111. Executes `recent: {`.
 * 112. Executes `bookings: recentBookings,`.
 * 113. Executes `transactions: recentTransactions,`.
 * 114. Executes `},`.
 * 115. Executes `});`.
 */
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

