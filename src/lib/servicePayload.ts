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

const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ");

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
