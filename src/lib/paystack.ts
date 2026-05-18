import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export class PaystackApiError extends Error {
  statusCode: number;
  providerMessage: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "PaystackApiError";
    this.statusCode = statusCode;
    this.providerMessage = message;
  }
}

export type PaystackInitializeInput = {
  email: string;
  plan: string;
  reference: string;
  amount: number;
  callback_url?: string;
  metadata?: Record<string, unknown>;
};

export type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data?: T;
};

export type PaystackInitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackVerifyData = {
  id?: number;
  status: string;
  reference: string;
  amount?: number;
  paid_at?: string;
  channel?: string;
  currency?: string;
  customer?: {
    email?: string;
    customer_code?: string;
  };
  plan?: string | { plan_code?: string };
  subscription?: {
    subscription_code?: string;
  } | string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

function getPaystackSecretKey() {
  return process.env.PAYSTACK_SECRET_KEY?.trim() || "";
}

function getWebhookSecret() {
  return (
    process.env.PAYSTACK_WEBHOOK_SECRET?.trim() ||
    process.env.PAYSTACK_SECRET_KEY?.trim() ||
    ""
  );
}

async function paystackFetch<T>(path: string, init?: RequestInit) {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as PaystackResponse<T>;

  if (!response.ok || !payload.status) {
    throw new PaystackApiError(
      payload.message || "Paystack request failed",
      response.status || 502
    );
  }

  return payload;
}

export async function initializeSubscription(input: PaystackInitializeInput) {
  return paystackFetch<PaystackInitializeData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      plan: input.plan,
      reference: input.reference,
      callback_url: input.callback_url,
      metadata: input.metadata,
    }),
  });
}

export async function verifyTransaction(reference: string) {
  return paystackFetch<PaystackVerifyData>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}

export function validateWebhookSignature(rawBody: string, signature: string | null) {
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret || !signature) {
    return false;
  }

  const digest = crypto
    .createHmac("sha512", webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}
