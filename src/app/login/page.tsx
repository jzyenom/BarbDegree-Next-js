"use client";

import { signIn } from "next-auth/react";
import AuthLayout from "@/components/layouts/AuthLayout";
import AuthInput from "@/components/AuthInput";
import { Mail, Lock, Circle } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignupMode = searchParams?.get("mode") === "signup";
  const requestedRole = searchParams?.get("role");
  const selectedRole =
    requestedRole === "barber" || requestedRole === "client"
      ? requestedRole
      : null;
  const callbackUrl = selectedRole
    ? `/auth/redirect?role=${selectedRole}`
    : "/auth/redirect";
  const [authMethod, setAuthMethod] = useState<"choice" | "manual">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const result = await signIn("credentials", {
      email: normalizedEmail,
      password,
      intent: isSignupMode ? "signup" : "signin",
      redirect: false,
    });

    if (result?.ok) {
      router.push(callbackUrl);
      return;
    }

    setError(
      isSignupMode
        ? "Unable to create account with that email/password. If this email was created with Google, use Google sign-in first."
        : "Invalid email or password. If you signed up with Google, use Google sign-in."
    );
  };

  return (
    <AuthLayout
      title={isSignupMode ? "Sign Up" : "Sign In"}
      footerText={isSignupMode ? "Already have an account?" : "Don't have an account?"}
      footerLink={isSignupMode ? "/login" : "/register"}
      footerLinkText={isSignupMode ? "Sign In" : "Sign Up"}
    >
      <h1 className="text-[22px] font-bold text-center mt-4 mb-3 text-[#1c130d]">
        {isSignupMode ? "Create Account" : "Welcome Back"}
      </h1>

      <p className="text-[#9e6b47] text-sm text-center py-2">
        {isSignupMode
          ? "Choose how you want to create your account"
          : "Choose how you want to sign in"}
      </p>

      {authMethod === "choice" ? (
        <div className="w-full max-w-[480px] space-y-4">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="flex items-center justify-center w-full h-12 rounded-xl bg-white border border-[#e5e5e5] text-sm font-semibold gap-3 text-[#1c130d] hover:bg-[#faf6f4] active:scale-[0.98] transition-all shadow-sm"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#db4437] text-white">
              <Circle className="w-4 h-4 rotate-45" strokeWidth={3} />
            </span>
            Continue with Google
          </button>

          <button
            onClick={() => setAuthMethod("manual")}
            type="button"
            className="w-full h-12 rounded-xl bg-[#f96b06] text-[#fcfaf8] text-base font-bold tracking-wide hover:bg-[#e66105] transition-all shadow-md hover:shadow-lg"
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
          <AuthInput
            type="password"
            placeholder="Password"
            icon={Lock}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />

          {error ? (
            <p className="text-sm text-red-600 text-center">{error}</p>
          ) : null}

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#f96b06] text-[#fcfaf8] text-base font-bold tracking-wide hover:bg-[#e66105] transition-all shadow-md hover:shadow-lg"
          >
            {isSignupMode ? "Sign Up" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => setAuthMethod("choice")}
            className="w-full h-12 rounded-xl border border-[#e0c4b0] text-[#1c130d] text-sm font-semibold hover:bg-[#faf6f4] transition-all"
          >
            {isSignupMode ? "Back to Sign Up Options" : "Back to Sign In Options"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
