import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import {
  getBarberLeaderboard,
  type BarberRankingPeriod,
} from "@/lib/reputation/barberLeaderboard";

const PERIODS = new Set<BarberRankingPeriod>(["all-time", "monthly"]);

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const periodParam = url.searchParams.get("period") ?? "all-time";
  const period = PERIODS.has(periodParam as BarberRankingPeriod)
    ? (periodParam as BarberRankingPeriod)
    : "all-time";
  const limit = Number(url.searchParams.get("limit") ?? 20);

  const leaderboard = await getBarberLeaderboard({ period, limit });

  return NextResponse.json(leaderboard);
}
