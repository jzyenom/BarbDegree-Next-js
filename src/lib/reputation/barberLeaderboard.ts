import mongoose from "mongoose";
import Barber from "@/models/Barber";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import { hasActiveSubscription } from "@/lib/subscription-helpers";
import {
  BARBER_REPUTATION_CONFIG,
  BarberReputationEngine,
  type BarberReputationResult,
} from "@/lib/reputation/BarberReputationEngine";
import "@/models/Shop";
import "@/models/User";

export type BarberRankingPeriod = "all-time" | "monthly";

export type BarberLeaderboardItem = BarberReputationResult & {
  rank: number;
  barberId: string;
  name: string;
  avatar: string;
  location: string;
  shopName?: string;
  bookable: boolean;
};

type LeaderboardOptions = {
  period?: BarberRankingPeriod;
  limit?: number;
  includeUnrated?: boolean;
};

type BarberDoc = {
  _id: mongoose.Types.ObjectId;
  userId?: { name?: string; avatar?: string };
  avatar?: string;
  address?: string;
  state?: string;
  country?: string;
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
};

const RECENT_WINDOW_DAYS = 60;

function getPeriodStart(period: BarberRankingPeriod, now: Date) {
  if (period === "monthly") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return null;
}

function normalizeLimit(limit: number | undefined) {
  if (!Number.isFinite(limit)) return 20;
  return Math.min(Math.max(Math.floor(limit ?? 20), 1), 100);
}

export async function getBarberLeaderboard(options: LeaderboardOptions = {}) {
  const now = new Date();
  const period = options.period ?? "all-time";
  const limit = normalizeLimit(options.limit);
  const periodStart = getPeriodStart(period, now);
  const recentStart = new Date(now.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const barbers = (await Barber.find({})
    .populate({ path: "userId", select: "name avatar" })
    .populate("shop")
    .lean()) as BarberDoc[];
  const barberIds = barbers.map((barber) => barber._id);

  const reviewMatch: Record<string, unknown> = { barberId: { $in: barberIds } };
  if (periodStart) reviewMatch.createdAt = { $gte: periodStart };

  const bookingMatch: Record<string, unknown> = {
    barberId: { $in: barberIds },
    status: { $in: ["completed", "declined"] },
  };
  if (periodStart) bookingMatch.updatedAt = { $gte: periodStart };

  const [reviewRows, bookingRows] = await Promise.all([
    Review.aggregate<{
      _id: mongoose.Types.ObjectId;
      averageRating: number;
      reviewCount: number;
      ratingStandardDeviation: number | null;
      recentAverageRating: number | null;
      recentReviewCount: number;
    }>([
      { $match: reviewMatch },
      {
        $group: {
          _id: "$barberId",
          averageRating: { $avg: "$rate" },
          reviewCount: { $sum: 1 },
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
      { $match: bookingMatch },
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
  ]);

  const reviewsByBarber = new Map(reviewRows.map((row) => [row._id.toString(), row]));
  const bookingsByBarber = new Map(bookingRows.map((row) => [row._id.toString(), row]));

  const ranked = barbers
    .map((barber) => {
      const barberId = barber._id.toString();
      const reviewStats = reviewsByBarber.get(barberId);
      const bookingStats = bookingsByBarber.get(barberId);
      const reputation = BarberReputationEngine.calculate({
        averageRating: reviewStats?.averageRating ?? 0,
        reviewCount: reviewStats?.reviewCount ?? 0,
        ratingStandardDeviation: reviewStats?.ratingStandardDeviation,
        recentAverageRating: reviewStats?.recentAverageRating,
        recentReviewCount: reviewStats?.recentReviewCount ?? 0,
        completedJobs: bookingStats?.completedJobs ?? 0,
        cancelledJobs: bookingStats?.cancelledJobs ?? 0,
      });
      const rawAvatar = barber.avatar ?? barber.userId?.avatar ?? "";
      const avatar = !rawAvatar || rawAvatar === "avatar.png" ? "/avatar.svg" : rawAvatar;
      const shopLocation = [barber.shop?.city, barber.shop?.state, barber.shop?.country]
        .filter(Boolean)
        .join(", ");
      const fallbackLocation = [barber.address, barber.state, barber.country]
        .filter(Boolean)
        .join(", ");

      return {
        ...reputation,
        rank: 0,
        barberId,
        name: barber.userId?.name ?? "",
        avatar,
        location: shopLocation || fallbackLocation,
        shopName: barber.shop?.name,
        bookable: hasActiveSubscription(barber),
      };
    })
    .filter((item) => options.includeUnrated || item.reviewCount > 0 || item.completedJobs > 0)
    .sort((a, b) => {
      if (b.reputationScore !== a.reputationScore) {
        return b.reputationScore - a.reputationScore;
      }
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      return b.completedJobs - a.completedJobs;
    })
    .slice(0, limit)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return {
    period,
    generatedAt: now.toISOString(),
    minimumReviewsForRecognition:
      BARBER_REPUTATION_CONFIG.minimumReviewsForRecognition,
    leaderboard: ranked,
  };
}
