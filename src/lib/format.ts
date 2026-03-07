// src/lib/format.ts
/**
 * AUTO-FUNCTION-COMMENT: formatNaira
 * Purpose: Handles format naira.
 * Line-by-line:
 * 1. Executes `if (amount == null) return "₦0";`.
 * 2. Executes `return new Intl.NumberFormat("en-NG", {`.
 * 3. Executes `style: "currency",`.
 * 4. Executes `currency: "NGN",`.
 * 5. Executes `maximumFractionDigits: 0,`.
 * 6. Executes `}).format(amount);`.
 */
export function formatNaira(amount?: number | null) {
  if (amount == null) return "₦0";
  // format with thousand separators
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
