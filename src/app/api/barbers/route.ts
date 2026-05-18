/**
 * AUTO-FILE-COMMENT: src/app/api/barbers/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/database/dbConnect";
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

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `try {`.
 * 2. Executes `await connectToDatabase();`.
 * 3. Executes `const barbers = (await Barber.find({})`.
 * 4. Executes `.populate("userId")`.
 * 5. Executes `.populate({`.
 * 6. Executes `path: "services",`.
 * 7. Executes `match: { isActive: true },`.
 * 8. Executes `options: { sort: { price: 1, name: 1 } },`.
 * 9. Executes `})) as BarberDocWithServices[];`.
 * 10. Executes `const results: BarberResponse[] = barbers.map((barber) => {`.
 * 11. Executes `const rawAvatar = barber.avatar ?? barber.userId?.avatar ?? "";`.
 * 12. Executes `const avatar =`.
 * 13. Executes `!rawAvatar || rawAvatar === "avatar.png" ? "/avatar.svg" : rawAvatar;`.
 * 14. Executes `const services = barber.toObject({ virtuals: true }).services ?? [];`.
 * 15. Executes `const lowestPrice = services[0]?.price;`.
 * 16. Executes `return {`.
 * 17. Executes `_id: barber._id.toString(),`.
 * 18. Executes `name: barber.userId?.name ?? "",`.
 * 19. Executes `address: barber.address ?? "",`.
 * 20. Executes `state: barber.state ?? "",`.
 * 21. Executes `country: barber.country ?? "",`.
 * 22. Executes `charge: lowestPrice ?? barber.charge ?? "",`.
 * 23. Executes `avatar,`.
 * 24. Executes `serviceCount: services.length,`.
 * 25. Executes `services: services.map((service) => ({`.
 * 26. Executes `_id: service._id.toString(),`.
 * 27. Executes `name: service.name,`.
 * 28. Executes `price: service.price,`.
 * 29. Executes `durationMinutes: service.durationMinutes,`.
 * 30. Executes `})),`.
 * 31. Executes `};`.
 * 32. Executes `});`.
 * 33. Executes `return NextResponse.json({ barbers: results });`.
 * 34. Executes `} catch (error) {`.
 * 35. Executes `console.error("Error fetching barbers:", error);`.
 * 36. Executes `return NextResponse.json(`.
 * 37. Executes `{ error: "Failed to fetch barbers" },`.
 * 38. Executes `{ status: 500 }`.
 * 39. Executes `);`.
 * 40. Executes `}`.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const allBarbers = await Barber.find({}).select("_id");
    await ensureDefaultServicesForBarbers(allBarbers.map((barber) => barber._id));

    const barbers = (await Barber.find({})
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
    }).sort((a, b) => {
      if (b.reputationScore !== a.reputationScore) {
        return b.reputationScore - a.reputationScore;
      }
      return b.reviews - a.reviews;
    });

    return NextResponse.json({ barbers: results });
  } catch (error) {
    console.error("Error fetching barbers:", error);
    return NextResponse.json(
      { error: "Failed to fetch barbers" },
      { status: 500 }
    );
  }
}
