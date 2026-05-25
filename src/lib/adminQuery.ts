import { NextRequest } from "next/server";

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseLimit(req: NextRequest, fallback = 100, max = 500) {
  const url = new URL(req.url);
  const requestedLimit = Number(url.searchParams.get("limit") || fallback);
  const parsedLimit = Number.isFinite(requestedLimit)
    ? Math.floor(requestedLimit)
    : fallback;

  return Math.min(Math.max(parsedLimit, 1), max);
}

export function parseDateRange(req: NextRequest) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from")?.trim() || "";
  const to = url.searchParams.get("to")?.trim() || "";
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/;

  if (from && !dateOnly.test(from)) {
    return { error: "Invalid from date format" };
  }

  if (to && !dateOnly.test(to)) {
    return { error: "Invalid to date format" };
  }

  const range: Record<string, Date> = {};
  if (from) {
    range.$gte = new Date(`${from}T00:00:00.000`);
  }
  if (to) {
    range.$lte = new Date(`${to}T23:59:59.999`);
  }

  if (range.$gte && range.$lte && range.$gte.getTime() > range.$lte.getTime()) {
    return { error: "From date cannot be after to date" };
  }

  return { range };
}
