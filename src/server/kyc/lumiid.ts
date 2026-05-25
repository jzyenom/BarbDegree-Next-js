type LumiIdNinResponse = {
  success?: boolean;
  code?: string;
  message?: string;
  summary?: {
    verified?: boolean;
  };
  data?: {
    nin?: string;
  } | null;
  meta?: {
    request_id?: string;
  };
};

export type NinVerificationResult = {
  verified: boolean;
  provider: "LumiID";
  requestId?: string;
  code?: string;
  message?: string;
};

const LUMIID_NIN_BASIC_URL = "https://api.lumiid.com/api/v1/ng/nin-basic/";

function normalizeNin(value: string) {
  return value.replace(/\D/g, "");
}

export async function verifyNinWithLumiId(nin: string): Promise<NinVerificationResult> {
  if (process.env.NODE_ENV !== "production") {
    return {
      verified: false,
      provider: "LumiID",
      code: "KYC_PRODUCTION_ONLY",
      message: "NIN verification only runs in production.",
    };
  }

  const apiKey = process.env.LUMIID_SECRET_KEY?.trim();
  if (!apiKey) {
    return {
      verified: false,
      provider: "LumiID",
      code: "LUMIID_NOT_CONFIGURED",
      message: "LumiID verification is not configured.",
    };
  }

  const response = await fetch(LUMIID_NIN_BASIC_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_number: nin }),
  });

  const payload = (await response.json().catch(() => ({}))) as LumiIdNinResponse;
  const returnedNin = payload.data?.nin ? normalizeNin(payload.data.nin) : "";
  const requestedNin = normalizeNin(nin);
  const verified =
    response.ok &&
    payload.success === true &&
    payload.summary?.verified === true &&
    returnedNin === requestedNin;

  return {
    verified,
    provider: "LumiID",
    requestId: payload.meta?.request_id,
    code: payload.code,
    message: payload.message,
  };
}
