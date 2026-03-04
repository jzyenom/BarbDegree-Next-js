"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResult = {
  ok: boolean;
  status: string;
  reference: string;
  bookingId: string | null;
};

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      setError("Missing payment reference.");
      return;
    }

    let mounted = true;

    const verifyPayment = async () => {
      try {
        const res = await fetch(
          `/api/paystack/verify?reference=${encodeURIComponent(reference)}&redirect=false`,
          { cache: "no-store" }
        );
        const json = (await res.json()) as VerifyResult & { error?: string };
        if (!res.ok) {
          throw new Error(json.error || "Payment verification failed");
        }

        if (mounted) {
          setResult(json);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Payment verification failed"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void verifyPayment();
    return () => {
      mounted = false;
    };
  }, [reference]);

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#eadfce] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#1f1a16]">Payment Verification</h1>

        {loading && (
          <p className="mt-3 text-sm text-[#75624e]">
            Verifying your Paystack payment...
          </p>
        )}

        {!loading && error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && result && (
          <div className="mt-4 space-y-4">
            <div
              className={`rounded-xl border p-4 ${
                result.ok
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <p
                className={`font-semibold ${
                  result.ok ? "text-green-700" : "text-amber-700"
                }`}
              >
                {result.ok ? "Payment successful" : "Payment not successful"}
              </p>
              <p className="mt-2 text-sm text-[#5e5144] break-all">
                Reference: {result.reference}
              </p>
              <p className="mt-1 text-sm text-[#5e5144]">
                Status: {result.status}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.bookingId ? (
                <Link
                  href={`/bookings/${result.bookingId}`}
                  className="h-11 rounded-lg bg-[#f2800d] text-white font-semibold inline-flex items-center justify-center"
                >
                  View Booking
                </Link>
              ) : (
                <Link
                  href="/bookings"
                  className="h-11 rounded-lg bg-[#f2800d] text-white font-semibold inline-flex items-center justify-center"
                >
                  View Bookings
                </Link>
              )}
              <Link
                href="/transactions"
                className="h-11 rounded-lg border border-[#e3d4bf] font-semibold inline-flex items-center justify-center text-[#1f1a16]"
              >
                Transactions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

