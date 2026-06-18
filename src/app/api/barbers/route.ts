import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectToDatabase, {
  isDatabaseUnavailableError,
} from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import { ensureDefaultServicesForBarbers } from "@/lib/defaultServices";
import { hasActiveSubscription } from "@/lib/subscription-helpers";
import {
  BarberReputationEngine,
  type BarberReputationBadge,
} from "@/lib/reputation/BarberReputationEngine";
import "@/models/Shop";
import "@/models/Service";

type BarberResponse = {
  _id: string;
  name: string;
  address: string;
  state: string;
  country: string;
  charge: number | string;
  avatar: string;
  shopName?: string;
  shopAddress?: string;
  location?: string;
  rating: number | null;
  reviews: number;
  reputationScore: number;
  badges: BarberReputationBadge[];
  serviceCount: number;
  services: {
    _id: string;
    name: string;
    price: number;
    durationMinutes?: number;
  }[];
  subscriptionActive: boolean;
  bookable: boolean;
};

type BarberDocWithServices = {
  _id: { toString(): string };
  userId?: { name?: string; avatar?: string };
  address?: string;
  state?: string;
  country?: string;
  charge?: string;
  avatar?: string;
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
      _id: { toString(): string };
      name: string;
      price: number;
      durationMinutes?: number;
    }[];
  };
};


function parseBooleanParam(value: string | null) {
  return value === "true" || value === "1";
}

function parseLimit(value: string | null) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.min(Math.floor(numeric), 50);
}

function buildAvailableBarberFilter() {
  return {
    $or: [
      { adminSubscriptionOverride: true, adminForcedSubscriptionStatus: true },
      {
        $and: [
          {
            $or: [
              { adminSubscriptionOverride: false },
              { adminSubscriptionOverride: { $exists: false } },
            ],
          },
          { subscriptionActive: true },
        ],
      },
    ],
  };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const ratedOnly = parseBooleanParam(url.searchParams.get("rated"));
    const availableOnly = parseBooleanParam(url.searchParams.get("available"));
    const sortMode = url.searchParams.get("sort") ?? "reputation";
    const limit = parseLimit(url.searchParams.get("limit"));
    const barberFilter = availableOnly ? buildAvailableBarberFilter() : {};

    await connectToDatabase();

    const allBarbers = await Barber.find(barberFilter).select("_id");
    await ensureDefaultServicesForBarbers(allBarbers.map((barber) => barber._id));

    const barbers = (await Barber.find(barberFilter)
      .populate("userId")
      .populate("shop")
      .populate({
        path: "services",
        match: { isActive: true },
        options: { sort: { price: 1, name: 1 } },
      })) as BarberDocWithServices[];

    const barberIds = barbers.map((barber) => barber._id);
    const recentStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const ratingRows = await Review.aggregate<{
      _id: mongoose.Types.ObjectId;
      rating: number;
      reviews: number;
      ratingStandardDeviation: number | null;
      recentAverageRating: number | null;
      recentReviewCount: number;
    }>([
      { $match: { barberId: { $in: barberIds } } },
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
    ]);
    const bookingRows = await Booking.aggregate<{
      _id: mongoose.Types.ObjectId;
      completedJobs: number;
      cancelledJobs: number;
    }>([
      {
        $match: {
          barberId: { $in: barberIds },
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
    ]);
    const ratings = new Map(
      ratingRows.map((row) => [
        row._id.toString(),
        {
          rating: Number(row.rating.toFixed(1)),
          reviews: row.reviews,
          ratingStandardDeviation: row.ratingStandardDeviation,
          recentAverageRating: row.recentAverageRating,
          recentReviewCount: row.recentReviewCount,
        },
      ])
    );
    const bookingStats = new Map(
      bookingRows.map((row) => [
        row._id.toString(),
        { completedJobs: row.completedJobs, cancelledJobs: row.cancelledJobs },
      ])
    );

    const results: BarberResponse[] = barbers.map((barber) => {
      const rawAvatar = barber.avatar ?? barber.userId?.avatar ?? "";
      const avatar =
        !rawAvatar || rawAvatar === "avatar.png" ? "/avatar.svg" : rawAvatar;
      const services = barber.toObject({ virtuals: true }).services ?? [];
      const lowestPrice = services[0]?.price;
      const rating = ratings.get(barber._id.toString());
      const jobs = bookingStats.get(barber._id.toString());
      const reputation = BarberReputationEngine.calculate({
        averageRating: rating?.rating ?? 0,
        reviewCount: rating?.reviews ?? 0,
        ratingStandardDeviation: rating?.ratingStandardDeviation,
        recentAverageRating: rating?.recentAverageRating,
        recentReviewCount: rating?.recentReviewCount ?? 0,
        completedJobs: jobs?.completedJobs ?? 0,
        cancelledJobs: jobs?.cancelledJobs ?? 0,
      });
      const shopLocation = [barber.shop?.city, barber.shop?.state, barber.shop?.country]
        .filter(Boolean)
        .join(", ");
      const fallbackLocation = [barber.address, barber.state, barber.country]
        .filter(Boolean)
        .join(", ");

      return {
        _id: barber._id.toString(),
        name: barber.userId?.name ?? "",
        address: barber.shop?.address ?? barber.address ?? "",
        state: barber.shop?.state ?? barber.state ?? "",
        country: barber.shop?.country ?? barber.country ?? "",
        charge: lowestPrice ?? barber.charge ?? "",
        avatar,
        shopName: barber.shop?.name,
        shopAddress: barber.shop?.address,
        location: shopLocation || fallbackLocation,
        rating: rating?.rating ?? null,
        reviews: rating?.reviews ?? 0,
        reputationScore: reputation.reputationScore,
        badges: reputation.badges,
        subscriptionActive: Boolean(barber.subscriptionActive),
        bookable: hasActiveSubscription(barber),
        serviceCount: services.length,
        services: services.map((service) => ({
          _id: service._id.toString(),
          name: service.name,
          price: service.price,
          durationMinutes: service.durationMinutes,
        })),
      };
    })
      .filter((barber) => !ratedOnly || barber.reviews > 0)
      .sort((a, b) => {
      if (sortMode === "rating") {
        const ratingDelta = (b.rating ?? 0) - (a.rating ?? 0);
        if (ratingDelta !== 0) return ratingDelta;
        return b.reviews - a.reviews;
      }
      if (b.reputationScore !== a.reputationScore) {
        return b.reputationScore - a.reputationScore;
      }
      return b.reviews - a.reviews;
    })
      .slice(0, limit ?? undefined);

    return NextResponse.json({ barbers: results });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        {
          error: "Barber data is temporarily unavailable",
          barbers: [],
          databaseUnavailable: true,
        },
        { status: 503 }
      );
    }

    console.error("Error fetching barbers:", error);
    return NextResponse.json(
      { error: "Failed to fetch barbers" },
      { status: 500 }
    );
  }
}
