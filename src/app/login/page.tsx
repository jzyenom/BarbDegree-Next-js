"use client";

import AuthInput from "@/components/AuthInput";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Circle, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import { Suspense, useEffect, useMemo, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapAuthError(errorCode: string | null, isSignupMode: boolean): string {
  switch (errorCode) {
    case "CredentialsSignin":
      return isSignupMode
        ? "Unable to create the account with that email and password. If this email already uses Google, sign in with Google first."
        : "Invalid email or password. If this account was created with Google, use Google sign-in.";
    case "OAuthSignin":
    case "OAuthCallback":
    case "SigninOAuth":
    case "Callback":
      return "Google sign-in failed. Check the deployed app URL and the Google OAuth callback URL.";
    case "OAuthAccountNotLinked":
      return "This email is already linked to another sign-in method. Use the original provider for this account.";
    case "AccessDenied":
      return "The sign-in request was denied. Check the auth callback logs on the server.";
    case "Configuration":
      return "Authentication is misconfigured in this deployment. Verify the auth environment variables.";
    case "AccountSyncFailed":
    case "AUTH_DATABASE_ERROR":
      return "Authentication is temporarily unavailable because the server could not reach the database.";
    default:
      return errorCode
        ? "Authentication failed. Check the server logs and try again."
        : "";
  }
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignupMode = searchParams?.get("mode") === "signup";
  const selectedRole = useMemo(() => {
    const requestedRole = searchParams?.get("role");

    return requestedRole === "barber" || requestedRole === "client"
      ? requestedRole
      : null;
  }, [searchParams]);
  const callbackUrl = selectedRole
    ? `/auth/redirect?role=${selectedRole}`
    : "/auth/redirect";
  const queryErrorMessage = useMemo(
    () => mapAuthError(searchParams?.get("error") ?? null, isSignupMode),
    [isSignupMode, searchParams]
  );
  const [authMethod, setAuthMethod] = useState<"choice" | "manual">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(queryErrorMessage);
  const [hasGoogleProvider, setHasGoogleProvider] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProviders = async () => {
      try {
        const providers = await getProviders();

        if (!isMounted) {
          return;
        }

        setHasGoogleProvider(Boolean(providers?.google));
      } catch (providerError) {
        console.error("[login] Failed to load auth providers.", providerError);

        if (isMounted) {
          setError("Unable to load the available sign-in methods for this deployment.");
        }
      } finally {
        if (isMounted) {
          setLoadingProviders(false);
        }
      }
    };

    void loadProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setError(queryErrorMessage);
  }, [queryErrorMessage]);

  const handleGoogleLogin = async () => {
    setError("");

    if (!hasGoogleProvider) {
      setError("Google sign-in is not configured for this deployment.");
      return;
    }

    await signIn("google", { callbackUrl });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        intent: isSignupMode ? "signup" : "signin",
        callbackUrl,
        redirect: false,
      });

      if (result?.ok) {
        router.push(result.url ?? callbackUrl);
        return;
      }

      setError(mapAuthError(result?.error ?? "CredentialsSignin", isSignupMode));
    } catch (signInError) {
      console.error("[login] Credentials sign-in failed unexpectedly.", signInError);
      setError("Authentication is temporarily unavailable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={isSignupMode ? "Sign Up" : "Sign In"}
      footerText={isSignupMode ? "Already have an account?" : "Don't have an account?"}
      footerLink={isSignupMode ? "/login" : "/register"}
      footerLinkText={isSignupMode ? "Sign In" : "Sign Up"}
    >
      <h1 className="mt-4 mb-3 text-center text-[22px] font-bold text-[#1c130d]">
        {isSignupMode ? "Create Account" : "Welcome Back"}
      </h1>

      <p className="py-2 text-center text-sm text-[#9e6b47]">
        {isSignupMode
          ? "Choose how you want to create your account"
          : "Choose how you want to sign in"}
      </p>

      {authMethod === "choice" ? (
        <div className="w-full max-w-[480px] space-y-4">
          {loadingProviders ? (
            <button
              disabled
              type="button"
              className="flex h-12 w-full items-center justify-center rounded-xl border border-[#e5e5e5] bg-white text-sm font-semibold text-[#7d6c61]"
            >
              Loading sign-in methods...
            </button>
          ) : hasGoogleProvider ? (
            <button
              onClick={() => void handleGoogleLogin()}
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e5e5e5] bg-white text-sm font-semibold text-[#1c130d] shadow-sm transition-all hover:bg-[#faf6f4] active:scale-[0.98]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#db4437] text-white">
                <Circle className="h-4 w-4 rotate-45" strokeWidth={3} />
              </span>
              Continue with Google
            </button>
          ) : (
            <p className="text-center text-sm text-[#9e6b47]">
              Google sign-in is unavailable until the production OAuth variables are configured.
            </p>
          )}

          <button
            onClick={() => setAuthMethod("manual")}
            type="button"
            className="h-12 w-full rounded-xl bg-[#f96b06] text-base font-bold tracking-wide text-[#fcfaf8] shadow-md transition-all hover:bg-[#e66105] hover:shadow-lg"
          >
            Use Email & Password
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-[480px] space-y-4">
          <AuthInput
            type="email"
            placeholder="Email"
            icon={Mail}
            value={email}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(event.target.value)
            }
          />
          <AuthInput
            type="password"
            placeholder="Password"
            icon={Lock}
            value={password}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(event.target.value)
            }
          />

          {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}

          <button
            disabled={isSubmitting}
            type="submit"
            className="h-12 w-full rounded-xl bg-[#f96b06] text-base font-bold tracking-wide text-[#fcfaf8] shadow-md transition-all hover:bg-[#e66105] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? isSignupMode
                ? "Creating account..."
                : "Signing in..."
              : isSignupMode
                ? "Sign Up"
                : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => setAuthMethod("choice")}
            className="h-12 w-full rounded-xl border border-[#e0c4b0] text-sm font-semibold text-[#1c130d] transition-all hover:bg-[#faf6f4]"
          >
            {isSignupMode ? "Back to Sign Up Options" : "Back to Sign In Options"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">
          <p className="text-sm font-medium">Loading sign in...</p>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
