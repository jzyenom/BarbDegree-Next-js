// src/lib/format.ts
export function formatNaira(amount?: number | null) {
  if (amount == null) return "₦0";
  // format with thousand separators
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
