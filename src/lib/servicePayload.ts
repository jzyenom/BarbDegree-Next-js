export type ServiceMutationInput = {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
};

type ParseOptions = {
  partial?: boolean;
};

/**
 * AUTO-FUNCTION-COMMENT: normalizeText
 * Purpose: Handles normalize text.
 * Line-by-line:
 * 1. Executes `value.trim().replace(/\s+/g, " ")`.
 */
const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ");

/**
 * AUTO-FUNCTION-COMMENT: parseServicePayload
 * Purpose: Handles parse service payload.
 * Line-by-line:
 * 1. Executes `const { partial = false } = options;`.
 * 2. Executes `if (!input || typeof input !== "object" || Array.isArray(input)) {`.
 * 3. Executes `return { error: "Invalid service payload" };`.
 * 4. Executes `}`.
 * 5. Executes `const body = input as Record<string, unknown>;`.
 * 6. Executes `const data: Partial<ServiceMutationInput> = {};`.
 * 7. Executes `if (!partial || "name" in body) {`.
 * 8. Executes `if (typeof body.name !== "string" || !normalizeText(body.name)) {`.
 * 9. Executes `return { error: "Service name is required" };`.
 * 10. Executes `}`.
 * 11. Executes `const name = normalizeText(body.name);`.
 * 12. Executes `if (name.length > 80) {`.
 * 13. Executes `return { error: "Service name must be 80 characters or fewer" };`.
 * 14. Executes `}`.
 * 15. Executes `data.name = name;`.
 * 16. Executes `}`.
 * 17. Executes `if (!partial || "description" in body) {`.
 * 18. Executes `if (body.description == null) {`.
 * 19. Executes `data.description = "";`.
 * 20. Executes `} else if (typeof body.description !== "string") {`.
 * 21. Executes `return { error: "Description must be a string" };`.
 * 22. Executes `} else {`.
 * 23. Executes `const description = body.description.trim();`.
 * 24. Executes `if (description.length > 500) {`.
 * 25. Executes `return { error: "Description must be 500 characters or fewer" };`.
 * 26. Executes `}`.
 * 27. Executes `data.description = description;`.
 * 28. Executes `}`.
 * 29. Executes `}`.
 * 30. Executes `if (!partial || "price" in body) {`.
 * 31. Executes `const price = Number(body.price);`.
 * 32. Executes `if (!Number.isFinite(price) || price < 0) {`.
 * 33. Executes `return { error: "Price must be a valid non-negative number" };`.
 * 34. Executes `}`.
 * 35. Executes `data.price = price;`.
 * 36. Executes `}`.
 * 37. Executes `if (!partial || "durationMinutes" in body) {`.
 * 38. Executes `const rawDuration = body.durationMinutes ?? 30;`.
 * 39. Executes `const durationMinutes = Number(rawDuration);`.
 * 40. Executes `if (`.
 * 41. Executes `!Number.isInteger(durationMinutes) ||`.
 * 42. Executes `durationMinutes < 5 ||`.
 * 43. Executes `durationMinutes > 480`.
 * 44. Executes `) {`.
 * 45. Executes `return { error: "Duration must be an integer between 5 and 480 minutes" };`.
 * 46. Executes `}`.
 * 47. Executes `data.durationMinutes = durationMinutes;`.
 * 48. Executes `}`.
 * 49. Executes `if (!partial || "isActive" in body) {`.
 * 50. Executes `if (body.isActive == null) {`.
 * 51. Executes `data.isActive = true;`.
 * 52. Executes `} else if (typeof body.isActive !== "boolean") {`.
 * 53. Executes `return { error: "isActive must be a boolean" };`.
 * 54. Executes `} else {`.
 * 55. Executes `data.isActive = body.isActive;`.
 * 56. Executes `}`.
 * 57. Executes `}`.
 * 58. Executes `if (partial && Object.keys(data).length === 0) {`.
 * 59. Executes `return { error: "No valid service fields were provided" };`.
 * 60. Executes `}`.
 * 61. Executes `return { data };`.
 */
export function parseServicePayload(
  input: unknown,
  options: ParseOptions = {}
): { data?: Partial<ServiceMutationInput>; error?: string } {
  const { partial = false } = options;

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Invalid service payload" };
  }

  const body = input as Record<string, unknown>;
  const data: Partial<ServiceMutationInput> = {};

  if (!partial || "name" in body) {
    if (typeof body.name !== "string" || !normalizeText(body.name)) {
      return { error: "Service name is required" };
    }

    const name = normalizeText(body.name);
    if (name.length > 80) {
      return { error: "Service name must be 80 characters or fewer" };
    }

    data.name = name;
  }

  if (!partial || "description" in body) {
    if (body.description == null) {
      data.description = "";
    } else if (typeof body.description !== "string") {
      return { error: "Description must be a string" };
    } else {
      const description = body.description.trim();
      if (description.length > 500) {
        return { error: "Description must be 500 characters or fewer" };
      }
      data.description = description;
    }
  }

  if (!partial || "price" in body) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return { error: "Price must be a valid non-negative number" };
    }

    data.price = price;
  }

  if (!partial || "durationMinutes" in body) {
    const rawDuration = body.durationMinutes ?? 30;
    const durationMinutes = Number(rawDuration);
    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 5 ||
      durationMinutes > 480
    ) {
      return { error: "Duration must be an integer between 5 and 480 minutes" };
    }

    data.durationMinutes = durationMinutes;
  }

  if (!partial || "isActive" in body) {
    if (body.isActive == null) {
      data.isActive = true;
    } else if (typeof body.isActive !== "boolean") {
      return { error: "isActive must be a boolean" };
    } else {
      data.isActive = body.isActive;
    }
  }

  if (partial && Object.keys(data).length === 0) {
    return { error: "No valid service fields were provided" };
  }

  return { data };
}
