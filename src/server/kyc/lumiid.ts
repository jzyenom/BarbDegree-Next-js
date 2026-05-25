export type NinVerificationResult = {
  verified: boolean;
  provider: "LumiID";
  requestId?: string;
  code?: string;
  message?: string;
};

export async function verifyNinWithLumiId(_nin: string): Promise<NinVerificationResult> {
  if (process.env.NODE_ENV !== "production") {
    return {
      verified: false,
      provider: "LumiID",
      code: "KYC_PRODUCTION_ONLY",
      message: "NIN verification only runs in production.",
    };
  }

  return {
    verified: false,
    provider: "LumiID",
    code: "LUMIID_NOT_CONFIGURED",
    message: "LumiID verification is not configured.",
  };

}
