"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  EyeOff,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProviders, signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useMemo, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_CALLBACK_URL = "/auth/redirect";

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

type AuthFieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showPasswordIcon?: boolean;
};

// function StatusBar() {
//   return (
//     <div className="flex h-[84px] items-center justify-between px-9 text-[#1f1f1f]">
//       <span className="text-[22px] font-medium leading-none">4:21</span>
//       <div className="flex items-center gap-2">
//         <Wifi className="h-7 w-7 fill-[#1f1f1f]" strokeWidth={3} />
//         <SignalHigh className="h-7 w-7 fill-[#1f1f1f]" strokeWidth={3} />
//         <BatteryFull className="h-8 w-8" strokeWidth={2.5} />
//       </div>
//     </div>
//   );
// }

function AuthField({
  label,
  type = "text",
  value,
  onChange,
  showPasswordIcon = false,
}: AuthFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-base font-medium leading-none text-[#2d2d2d]">
        {label}
      </span>
      <span className="relative block">
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="h-12 w-full rounded-xl border border-[#c7c7c7] bg-white px-4 pr-12 text-base text-[#111] outline-none transition focus:border-[#1f1f1f]"
        />
        {showPasswordIcon ? (
          <EyeOff
            aria-hidden="true"
            className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c0c0c0]"
            strokeWidth={2}
          />
        ) : null}
      </span>
    </label>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const isSignupMode = searchParams?.get("mode") === "signup";
  const requestedCallbackUrl = searchParams?.get("callbackUrl");
  const selectedRole = useMemo(() => {
    const requestedRole = searchParams?.get("role");

    return requestedRole === "barber" || requestedRole === "client"
      ? requestedRole
      : null;
  }, [searchParams]);
  const callbackUrl = useMemo(() => {
    if (selectedRole) {
      return `/auth/redirect?role=${selectedRole}`;
    }

    if (requestedCallbackUrl?.startsWith("/") && !requestedCallbackUrl.startsWith("//")) {
      return requestedCallbackUrl;
    }

    return DEFAULT_CALLBACK_URL;
  }, [requestedCallbackUrl, selectedRole]);
  const queryErrorMessage = useMemo(
    () => mapAuthError(searchParams?.get("error") ?? null, isSignupMode),
    [isSignupMode, searchParams]
  );
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

        const googleEnabled = Boolean(providers?.google);
        setHasGoogleProvider(googleEnabled);
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

  useEffect(() => {
    if (status !== "authenticated") return;

    router.replace(selectedRole ? callbackUrl : DEFAULT_CALLBACK_URL);
  }, [callbackUrl, router, selectedRole, status]);

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
    const trimmedPassword = password.trim();
    const trimmedName = displayName.trim();

    if (isSignupMode && trimmedName.length < 2) {
      setError("Enter your name.");
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (trimmedPassword.length < 8 || trimmedPassword.length > 72) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }

    if (isSignupMode && !acceptedTerms) {
      setError("Agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        name: isSignupMode ? trimmedName : undefined,
        email: normalizedEmail,
        password: trimmedPassword,
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

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">
        <p className="text-sm font-medium">
          {status === "authenticated" ? "Redirecting..." : "Loading sign in..."}
        </p>
      </div>
    );
  }

  const alternateHref = isSignupMode
    ? "/login"
    : selectedRole
      ? `/login?mode=signup&role=${selectedRole}`
      : "/register";
  const submitBlocked = isSubmitting || (isSignupMode && !acceptedTerms);

  return (
    <main className="mobile-screen bg-white text-[#1f1f1f]">
      <div className="mobile-shell mobile-screen bg-white">
        {/* <StatusBar /> */}

        <div className="mobile-scroll px-6 pb-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="safe-top flex h-10 w-10 items-center justify-start text-[#222]"
          >
            <ArrowLeft className="h-8 w-8" strokeWidth={2.5} />
          </button>

          <h1 className="mt-5 text-4xl font-semibold leading-none tracking-normal text-black">
            {isSignupMode ? "Sign Up" : "Sign In"}
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            {isSignupMode ? (
              <AuthField
                label="Name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            ) : null}

            <AuthField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <AuthField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              showPasswordIcon
            />

            {isSignupMode ? (
              <label className="flex items-center gap-3 pt-1 text-sm leading-tight text-[#2d2d2d]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="h-6 w-6 shrink-0 appearance-none rounded border-2 border-[#c8c8c8] bg-white checked:border-[#1f1f1f] checked:bg-[#1f1f1f]"
                />
                <span>
                  I agree with{" "}
                  <Link href="/terms" className="font-semibold">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-semibold">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            ) : null}

            {error ? (
              <p className="pt-1 text-center text-sm font-medium text-red-600">
                {error}
              </p>
            ) : null}

            <button
              disabled={submitBlocked}
              type="submit"
              className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-[#1f1f1f] text-base font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#c6c6c6]"
            >
              {isSubmitting
                ? isSignupMode
                  ? "Signing Up..."
                  : "Signing In..."
                : isSignupMode
                  ? "Sign Up"
                  : "Sign In"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-sm text-[#2d2d2d]">
            <span className="h-px flex-1 bg-[#c9c9c9]" />
            <span>{isSignupMode ? "Or sign up with" : "Or sign in with"}</span>
            <span className="h-px flex-1 bg-[#c9c9c9]" />
          </div>

          <div className="mt-5 flex items-center justify-center gap-16">
            <button
              type="button"
              onClick={() => void handleGoogleLogin()}
              disabled={loadingProviders || !hasGoogleProvider}
              aria-label="Continue with Google"
              className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#f2f8ff] text-[34px] font-bold leading-none disabled:opacity-40"
            >
              <Image
                src="/social_icons/Google.png"
                alt=""
                width={43}
                height={43}
                className="h-8 w-8 object-contain"
              />
            </button>
            <button
              type="button"
              aria-label="Continue with Apple"
              className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#f6fbff] text-black"
            >
              <Image
                src="/social_icons/Apple Inc.png"
                alt=""
                width={43}
                height={43}
                className="h-8 w-8 object-contain"
              />
            </button>
          </div>

          <p className="mt-6 text-center text-base text-[#2d2d2d]">
            {isSignupMode
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <Link href={alternateHref} className="font-semibold">
              {isSignupMode ? "Log In" : "Sign Up"}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">
          {/* show text */}
          <p className="text-sm font-medium">Loading sign in...</p>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
