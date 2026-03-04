"use client";

import { signIn } from "next-auth/react";
import AuthLayout from "@/components/layouts/AuthLayout";
import AuthInput from "@/components/AuthInput";
import { Mail, Lock, Circle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"choice" | "manual">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/auth/redirect" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/auth/redirect");
      return;
    }

    setError(
      "Invalid email or password. If you signed up with Google, use Google sign-in."
    );
  };

  return (
    <AuthLayout
      title="Sign In"
      footerText="Don't have an account?"
      footerLink="/register"
      footerLinkText="Sign Up"
    >
      <h1 className="text-[22px] font-bold text-center mt-4 mb-3 text-[#1c130d]">
        Welcome Back
      </h1>

      <p className="text-[#9e6b47] text-sm text-center py-2">
        Choose how you want to sign in
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
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setAuthMethod("choice")}
            className="w-full h-12 rounded-xl border border-[#e0c4b0] text-[#1c130d] text-sm font-semibold hover:bg-[#faf6f4] transition-all"
          >
            Back to Sign In Options
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
