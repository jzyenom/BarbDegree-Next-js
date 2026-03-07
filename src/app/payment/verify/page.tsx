/**
 * AUTO-FILE-COMMENT: src/app/payment/verify/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResult = {
  ok: boolean;
  status: string;
  reference: string;
  bookingId: string | null;
};

/**
 * AUTO-FUNCTION-COMMENT: PaymentVerifyPageContent
 * Purpose: Handles payment verify page content.
 * Line-by-line:
 * 1. Executes `const searchParams = useSearchParams();`.
 * 2. Executes `const reference =`.
 * 3. Executes `searchParams?.get("reference") || searchParams?.get("trxref") || "";`.
 * 4. Executes `const [loading, setLoading] = useState(true);`.
 * 5. Executes `const [result, setResult] = useState<VerifyResult | null>(null);`.
 * 6. Executes `const [error, setError] = useState<string | null>(null);`.
 * 7. Executes `useEffect(() => {`.
 * 8. Executes `if (!reference) {`.
 * 9. Executes `setLoading(false);`.
 * 10. Executes `setError("Missing payment reference.");`.
 * 11. Executes `return;`.
 * 12. Executes `}`.
 * 13. Executes `let mounted = true;`.
 * 14. Executes `const verifyPayment = async () => {`.
 * 15. Executes `try {`.
 * 16. Executes `const res = await fetch(`.
 * 17. Executes `\`/api/paystack/verify?reference=${encodeURIComponent(reference)}&redirect=false\`,`.
 * 18. Executes `{ cache: "no-store" }`.
 * 19. Executes `);`.
 * 20. Executes `const json = (await res.json()) as VerifyResult & { error?: string };`.
 * 21. Executes `if (!res.ok) {`.
 * 22. Executes `if (res.status === 401) {`.
 * 23. Executes `throw new Error("Session expired. Please sign in again to verify payment.");`.
 * 24. Executes `}`.
 * 25. Executes `throw new Error(json.error || "Payment verification failed");`.
 * 26. Executes `}`.
 * 27. Executes `if (mounted) {`.
 * 28. Executes `setResult(json);`.
 * 29. Executes `}`.
 * 30. Executes `} catch (err) {`.
 * 31. Executes `if (mounted) {`.
 * 32. Executes `setError(`.
 * 33. Executes `err instanceof Error ? err.message : "Payment verification failed"`.
 * 34. Executes `);`.
 * 35. Executes `}`.
 * 36. Executes `} finally {`.
 * 37. Executes `if (mounted) setLoading(false);`.
 * 38. Executes `}`.
 * 39. Executes `};`.
 * 40. Executes `void verifyPayment();`.
 * 41. Executes `return () => {`.
 * 42. Executes `mounted = false;`.
 * 43. Executes `};`.
 * 44. Executes `}, [reference]);`.
 * 45. Executes `return (`.
 * 46. Executes `<div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">`.
 * 47. Executes `<div className="w-full max-w-lg rounded-2xl border border-[#eadfce] bg-white p-6 shadow-sm">`.
 * 48. Executes `<h1 className="text-xl font-bold text-[#1f1a16]">Payment Verification</h1>`.
 * 49. Executes `{loading && (`.
 * 50. Executes `<p className="mt-3 text-sm text-[#75624e]">`.
 * 51. Executes `Verifying your Paystack payment...`.
 * 52. Executes `</p>`.
 * 53. Executes `)}`.
 * 54. Executes `{!loading && error && (`.
 * 55. Executes `<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">`.
 * 56. Executes `<p className="text-sm text-red-700">{error}</p>`.
 * 57. Executes `</div>`.
 * 58. Executes `)}`.
 * 59. Executes `{!loading && result && (`.
 * 60. Executes `<div className="mt-4 space-y-4">`.
 * 61. Executes `<div`.
 * 62. Executes `className={\`rounded-xl border p-4 ${`.
 * 63. Executes `result.ok`.
 * 64. Executes `? "border-green-200 bg-green-50"`.
 * 65. Executes `: "border-amber-200 bg-amber-50"`.
 * 66. Executes `}\`}`.
 * 67. Executes `>`.
 * 68. Executes `<p`.
 * 69. Executes `className={\`font-semibold ${`.
 * 70. Executes `result.ok ? "text-green-700" : "text-amber-700"`.
 * 71. Executes `}\`}`.
 * 72. Executes `>`.
 * 73. Executes `{result.ok ? "Payment successful" : "Payment not successful"}`.
 * 74. Executes `</p>`.
 * 75. Executes `<p className="mt-2 text-sm text-[#5e5144] break-all">`.
 * 76. Executes `Reference: {result.reference}`.
 * 77. Executes `</p>`.
 * 78. Executes `<p className="mt-1 text-sm text-[#5e5144]">`.
 * 79. Executes `Status: {result.status}`.
 * 80. Executes `</p>`.
 * 81. Executes `</div>`.
 * 82. Executes `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">`.
 * 83. Executes `{result.bookingId ? (`.
 * 84. Executes `<Link`.
 * 85. Executes `href={\`/bookings/${result.bookingId}\`}`.
 * 86. Executes `className="h-11 rounded-lg bg-[#f2800d] text-white font-semibold inline-flex items-center justify-center"`.
 * 87. Executes `>`.
 * 88. Executes `View Booking`.
 * 89. Executes `</Link>`.
 * 90. Executes `) : (`.
 * 91. Executes `<Link`.
 * 92. Executes `href="/bookings"`.
 * 93. Executes `className="h-11 rounded-lg bg-[#f2800d] text-white font-semibold inline-flex items-center justify-center"`.
 * 94. Executes `>`.
 * 95. Executes `View Bookings`.
 * 96. Executes `</Link>`.
 * 97. Executes `)}`.
 * 98. Executes `<Link`.
 * 99. Executes `href="/transactions"`.
 * 100. Executes `className="h-11 rounded-lg border border-[#e3d4bf] font-semibold inline-flex items-center justify-center text-[#1f1a16]"`.
 * 101. Executes `>`.
 * 102. Executes `Transactions`.
 * 103. Executes `</Link>`.
 * 104. Executes `</div>`.
 * 105. Executes `</div>`.
 * 106. Executes `)}`.
 * 107. Executes `</div>`.
 * 108. Executes `</div>`.
 * 109. Executes `);`.
 */
function PaymentVerifyPageContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams?.get("reference") || searchParams?.get("trxref") || "";

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

    /**
     * AUTO-FUNCTION-COMMENT: verifyPayment
     * Purpose: Handles verify payment.
     * Line-by-line:
     * 1. Executes `try {`.
     * 2. Executes `const res = await fetch(`.
     * 3. Executes `\`/api/paystack/verify?reference=${encodeURIComponent(reference)}&redirect=false\`,`.
     * 4. Executes `{ cache: "no-store" }`.
     * 5. Executes `);`.
     * 6. Executes `const json = (await res.json()) as VerifyResult & { error?: string };`.
     * 7. Executes `if (!res.ok) {`.
     * 8. Executes `if (res.status === 401) {`.
     * 9. Executes `throw new Error("Session expired. Please sign in again to verify payment.");`.
     * 10. Executes `}`.
     * 11. Executes `throw new Error(json.error || "Payment verification failed");`.
     * 12. Executes `}`.
     * 13. Executes `if (mounted) {`.
     * 14. Executes `setResult(json);`.
     * 15. Executes `}`.
     * 16. Executes `} catch (err) {`.
     * 17. Executes `if (mounted) {`.
     * 18. Executes `setError(`.
     * 19. Executes `err instanceof Error ? err.message : "Payment verification failed"`.
     * 20. Executes `);`.
     * 21. Executes `}`.
     * 22. Executes `} finally {`.
     * 23. Executes `if (mounted) setLoading(false);`.
     * 24. Executes `}`.
     */
    const verifyPayment = async () => {
      try {
        const res = await fetch(
          `/api/paystack/verify?reference=${encodeURIComponent(reference)}&redirect=false`,
          { cache: "no-store" }
        );
        const json = (await res.json()) as VerifyResult & { error?: string };
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Session expired. Please sign in again to verify payment.");
          }
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

/**
 * AUTO-FUNCTION-COMMENT: PaymentVerifyPage
 * Purpose: Handles payment verify page.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<Suspense`.
 * 3. Executes `fallback={`.
 * 4. Executes `<div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">`.
 * 5. Executes `<p className="text-sm text-[#75624e]">Preparing payment verification...</p>`.
 * 6. Executes `</div>`.
 * 7. Executes `}`.
 * 8. Executes `>`.
 * 9. Executes `<PaymentVerifyPageContent />`.
 * 10. Executes `</Suspense>`.
 * 11. Executes `);`.
 */
export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
          <p className="text-sm text-[#75624e]">Preparing payment verification...</p>
        </div>
      }
    >
      <PaymentVerifyPageContent />
    </Suspense>
  );
}
