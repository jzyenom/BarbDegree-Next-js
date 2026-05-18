import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import { ensureDefaultServicesForBarber } from "@/lib/defaultServices";
import { hasActiveSubscription } from "@/lib/subscription-helpers";
import { BarberReputationEngine } from "@/lib/reputation/BarberReputationEngine";
import "@/models/Service";
import "@/models/Shop";
import "@/models/User";

type BarberDoc = {
  _id: mongoose.Types.ObjectId;
  userId?: { name?: string; email?: string; avatar?: string };
  address?: string;
  state?: string;
  country?: string;
  charge?: string;
  avatar?: string;
  bio?: string;
  exp?: string;
  subscriptionActive?: boolean;
  adminSubscriptionOverride?: boolean;
  adminForcedSubscriptionStatus?: boolean;
  shop?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  toObject(options?: { virtuals?: boolean }): {
    services?: {
      _id: mongoose.Types.ObjectId;
      name: string;
      description?: string;
      price: number;
      durationMinutes?: number;
    }[];
  };
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });
  }

  const existingBarber = await Barber.findById(id).select("_id");
  if (!existingBarber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  await ensureDefaultServicesForBarber(existingBarber._id);

  const barber = (await Barber.findById(id)
    .populate({ path: "userId", select: "name email avatar" })
    .populate("shop")
    .populate({
      path: "services",
      match: { isActive: true },
      options: { sort: { price: 1, name: 1 } },
    })) as BarberDoc | null;

  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const barberObjectId = new mongoose.Types.ObjectId(id);
  const recentStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const [reviewStats, bookingStats, reviews] = await Promise.all([
    Review.aggregate<{
      _id: mongoose.Types.ObjectId;
      rating: number;
      reviews: number;
      ratingStandardDeviation: number | null;
      recentAverageRating: number | null;
      recentReviewCount: number;
    }>([
      { $match: { barberId: barberObjectId } },
      {
        $group: {
          _id: "$barberId",
          rating: { $avg: "$rate" },
          reviews: { $sum: 1 },
          ratingStandardDeviation: { $stdDevPop: "$rate" },
          recentAverageRating: {
            $avg: {
              $cond: [{ $gte: ["$createdAt", recentStart] }, "$rate", null],
            },
          },
          recentReviewCount: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", recentStart] }, 1, 0],
            },
          },
        },
      },
    ]),
    Booking.aggregate<{
      _id: mongoose.Types.ObjectId;
      completedJobs: number;
      cancelledJobs: number;
    }>([
      {
        $match: {
          barberId: barberObjectId,
          status: { $in: ["completed", "declined"] },
        },
      },
      {
        $group: {
          _id: "$barberId",
          completedJobs: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledJobs: {
            $sum: { $cond: [{ $eq: ["$status", "declined"] }, 1, 0] },
          },
        },
      },
    ]),
    Review.find({ barberId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({ path: "userId", select: "name avatar" })
      .lean(),
  ]);

  const stats = reviewStats[0];
  const jobs = bookingStats[0];
  const reputation = BarberReputationEngine.calculate({
    averageRating: stats?.rating ?? 0,
    reviewCount: stats?.reviews ?? 0,
    ratingStandardDeviation: stats?.ratingStandardDeviation,
    recentAverageRating: stats?.recentAverageRating,
    recentReviewCount: stats?.recentReviewCount ?? 0,
    completedJobs: jobs?.completedJobs ?? 0,
    cancelledJobs: jobs?.cancelledJobs ?? 0,
  });
  const rawAvatar = barber.avatar ?? barber.userId?.avatar ?? "";
  const avatar = !rawAvatar || rawAvatar === "avatar.png" ? "/avatar.svg" : rawAvatar;
  const services = barber.toObject({ virtuals: true }).services ?? [];
  const shopLocation = [barber.shop?.city, barber.shop?.state, barber.shop?.country]
    .filter(Boolean)
    .join(", ");
  const fallbackLocation = [barber.address, barber.state, barber.country]
    .filter(Boolean)
    .join(", ");

  return NextResponse.json({
    barber: {
      _id: barber._id.toString(),
      name: barber.userId?.name ?? "Barber",
      email: barber.userId?.email,
      avatar,
      bio: barber.bio ?? "",
      exp: barber.exp ?? "",
      address: barber.shop?.address ?? barber.address ?? "",
      state: barber.shop?.state ?? barber.state ?? "",
      country: barber.shop?.country ?? barber.country ?? "",
      location: shopLocation || fallbackLocation,
      shopName: barber.shop?.name,
      rating: stats?.rating ? Number(stats.rating.toFixed(1)) : null,
      reviews: stats?.reviews ?? 0,
      reputationScore: reputation.reputationScore,
      badges: reputation.badges,
      completedJobs: reputation.completedJobs,
      bookable: hasActiveSubscription(barber),
      services: services.map((service) => ({
        _id: service._id.toString(),
        name: service.name,
        description: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes,
      })),
      recentReviews: reviews,
    },
  });
}
