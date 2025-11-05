"use client";

import { signIn } from "next-auth/react";
import AuthLayout from "@/components/layouts/AuthLayout";
import AuthInput from "@/components/AuthInput";
import { Mail, Lock, Circle } from "lucide-react";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/register" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add email/password sign-in logic if needed
  };

  return (
    <AuthLayout
      title="Sign In"
      footerText="Don't have an account?"
      footerLink="/barber/signup"
      footerLinkText="Sign Up"
    >
      <h1 className="text-[22px] font-bold text-center mt-4 mb-3 text-[#1c130d]">
        Welcome Back
      </h1>

      <p className="text-[#9e6b47] text-sm text-center py-2">
        Sign in with your account details
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-[480px] space-y-4">
        <AuthInput type="email" placeholder="Email" icon={Mail} />
        <AuthInput type="password" placeholder="Password" icon={Lock} />

        <button
          type="submit"
          className="w-full h-12 rounded-xl bg-[#f96b06] text-[#fcfaf8] text-base font-bold tracking-wide hover:bg-[#e66105] transition-all shadow-md hover:shadow-lg"
        >
          Sign In
        </button>
      </form>

      <div className="flex items-center justify-center mt-8 mb-2">
        <div className="border-t border-[#e0c4b0] w-2/5"></div>
        <span className="mx-3 text-[#b38b6d] text-sm font-medium">or</span>
        <div className="border-t border-[#e0c4b0] w-2/5"></div>
      </div>

      <div className="flex items-center justify-center mt-4">
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="flex items-center justify-center w-full max-w-[480px] h-12 rounded-xl bg-white border border-[#e5e5e5] text-sm font-semibold gap-3 text-[#1c130d] hover:bg-[#faf6f4] active:scale-[0.98] transition-all shadow-sm"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#db4437] text-white">
            <Circle className="w-4 h-4 rotate-45" strokeWidth={3} />
          </span>
          Continue with Google
        </button>
      </div>
    </AuthLayout>
  );
}
