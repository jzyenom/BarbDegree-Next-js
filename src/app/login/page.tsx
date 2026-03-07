/**
 * AUTO-FILE-COMMENT: src/app/login/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

import { signIn } from "next-auth/react";
import AuthLayout from "@/components/layouts/AuthLayout";
import AuthInput from "@/components/AuthInput";
import { Mail, Lock, Circle } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * AUTO-FUNCTION-COMMENT: LoginPage
 * Purpose: Handles login page.
 * Line-by-line:
 * 1. Executes `const router = useRouter();`.
 * 2. Executes `const searchParams = useSearchParams();`.
 * 3. Executes `const isSignupMode = searchParams?.get("mode") === "signup";`.
 * 4. Executes `const requestedRole = searchParams?.get("role");`.
 * 5. Executes `const selectedRole =`.
 * 6. Executes `requestedRole === "barber" || requestedRole === "client"`.
 * 7. Executes `? requestedRole`.
 * 8. Executes `: null;`.
 * 9. Executes `const callbackUrl = selectedRole`.
 * 10. Executes `? \`/auth/redirect?role=${selectedRole}\``.
 * 11. Executes `: "/auth/redirect";`.
 * 12. Executes `const [authMethod, setAuthMethod] = useState<"choice" | "manual">("choice");`.
 * 13. Executes `const [email, setEmail] = useState("");`.
 * 14. Executes `const [password, setPassword] = useState("");`.
 * 15. Executes `const [error, setError] = useState("");`.
 * 16. Executes `const handleGoogleLogin = () => {`.
 * 17. Executes `signIn("google", { callbackUrl });`.
 * 18. Executes `};`.
 * 19. Executes `const handleSubmit = async (e: React.FormEvent) => {`.
 * 20. Executes `e.preventDefault();`.
 * 21. Executes `setError("");`.
 * 22. Executes `const normalizedEmail = email.trim().toLowerCase();`.
 * 23. Executes `if (!EMAIL_PATTERN.test(normalizedEmail)) {`.
 * 24. Executes `setError("Enter a valid email address.");`.
 * 25. Executes `return;`.
 * 26. Executes `}`.
 * 27. Executes `if (password.length < 8 || password.length > 72) {`.
 * 28. Executes `setError("Password must be between 8 and 72 characters.");`.
 * 29. Executes `return;`.
 * 30. Executes `}`.
 * 31. Executes `const result = await signIn("credentials", {`.
 * 32. Executes `email: normalizedEmail,`.
 * 33. Executes `password,`.
 * 34. Executes `intent: isSignupMode ? "signup" : "signin",`.
 * 35. Executes `redirect: false,`.
 * 36. Executes `});`.
 * 37. Executes `if (result?.ok) {`.
 * 38. Executes `router.push(callbackUrl);`.
 * 39. Executes `return;`.
 * 40. Executes `}`.
 * 41. Executes `setError(`.
 * 42. Executes `isSignupMode`.
 * 43. Executes `? "Unable to create account with that email/password. If this email was created with Google, use Google sign-in first."`.
 * 44. Executes `: "Invalid email or password. If you signed up with Google, use Google sign-in."`.
 * 45. Executes `);`.
 * 46. Executes `};`.
 * 47. Executes `return (`.
 * 48. Executes `<AuthLayout`.
 * 49. Executes `title={isSignupMode ? "Sign Up" : "Sign In"}`.
 * 50. Executes `footerText={isSignupMode ? "Already have an account?" : "Don't have an account?"}`.
 * 51. Executes `footerLink={isSignupMode ? "/login" : "/register"}`.
 * 52. Executes `footerLinkText={isSignupMode ? "Sign In" : "Sign Up"}`.
 * 53. Executes `>`.
 * 54. Executes `<h1 className="text-[22px] font-bold text-center mt-4 mb-3 text-[#1c130d]">`.
 * 55. Executes `{isSignupMode ? "Create Account" : "Welcome Back"}`.
 * 56. Executes `</h1>`.
 * 57. Executes `<p className="text-[#9e6b47] text-sm text-center py-2">`.
 * 58. Executes `{isSignupMode`.
 * 59. Executes `? "Choose how you want to create your account"`.
 * 60. Executes `: "Choose how you want to sign in"}`.
 * 61. Executes `</p>`.
 * 62. Executes `{authMethod === "choice" ? (`.
 * 63. Executes `<div className="w-full max-w-[480px] space-y-4">`.
 * 64. Executes `<button`.
 * 65. Executes `onClick={handleGoogleLogin}`.
 * 66. Executes `type="button"`.
 * 67. Executes `className="flex items-center justify-center w-full h-12 rounded-xl bg-white border border-[#e5e5e5] text-sm font-semibold gap-3 text-[#1c...`.
 * 68. Executes `>`.
 * 69. Executes `<span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#db4437] text-white">`.
 * 70. Executes `<Circle className="w-4 h-4 rotate-45" strokeWidth={3} />`.
 * 71. Executes `</span>`.
 * 72. Executes `Continue with Google`.
 * 73. Executes `</button>`.
 * 74. Executes `<button`.
 * 75. Executes `onClick={() => setAuthMethod("manual")}`.
 * 76. Executes `type="button"`.
 * 77. Executes `className="w-full h-12 rounded-xl bg-[#f96b06] text-[#fcfaf8] text-base font-bold tracking-wide hover:bg-[#e66105] transition-all shadow-...`.
 * 78. Executes `>`.
 * 79. Executes `Use Email & Password`.
 * 80. Executes `</button>`.
 * 81. Executes `</div>`.
 * 82. Executes `) : (`.
 * 83. Executes `<form onSubmit={handleSubmit} className="w-full max-w-[480px] space-y-4">`.
 * 84. Executes `<AuthInput`.
 * 85. Executes `type="email"`.
 * 86. Executes `placeholder="Email"`.
 * 87. Executes `icon={Mail}`.
 * 88. Executes `value={email}`.
 * 89. Executes `onChange={(e: React.ChangeEvent<HTMLInputElement>) =>`.
 * 90. Executes `setEmail(e.target.value)`.
 * 91. Executes `}`.
 * 92. Executes `/>`.
 * 93. Executes `<AuthInput`.
 * 94. Executes `type="password"`.
 * 95. Executes `placeholder="Password"`.
 * 96. Executes `icon={Lock}`.
 * 97. Executes `value={password}`.
 * 98. Executes `onChange={(e: React.ChangeEvent<HTMLInputElement>) =>`.
 * 99. Executes `setPassword(e.target.value)`.
 * 100. Executes `}`.
 * 101. Executes `/>`.
 * 102. Executes `{error ? (`.
 * 103. Executes `<p className="text-sm text-red-600 text-center">{error}</p>`.
 * 104. Executes `) : null}`.
 * 105. Executes `<button`.
 * 106. Executes `type="submit"`.
 * 107. Executes `className="w-full h-12 rounded-xl bg-[#f96b06] text-[#fcfaf8] text-base font-bold tracking-wide hover:bg-[#e66105] transition-all shadow-...`.
 * 108. Executes `>`.
 * 109. Executes `{isSignupMode ? "Sign Up" : "Sign In"}`.
 * 110. Executes `</button>`.
 * 111. Executes `<button`.
 * 112. Executes `type="button"`.
 * 113. Executes `onClick={() => setAuthMethod("choice")}`.
 * 114. Executes `className="w-full h-12 rounded-xl border border-[#e0c4b0] text-[#1c130d] text-sm font-semibold hover:bg-[#faf6f4] transition-all"`.
 * 115. Executes `>`.
 * 116. Executes `{isSignupMode ? "Back to Sign Up Options" : "Back to Sign In Options"}`.
 * 117. Executes `</button>`.
 * 118. Executes `</form>`.
 * 119. Executes `)}`.
 * 120. Executes `</AuthLayout>`.
 * 121. Executes `);`.
 */
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
  const [authMethod, setAuthMethod] = useState<"choice" | "manual">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /**
   * AUTO-FUNCTION-COMMENT: handleGoogleLogin
   * Purpose: Handles handle google login.
   * Line-by-line:
   * 1. Executes `signIn("google", { callbackUrl });`.
   */
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl });
  };

  /**
   * AUTO-FUNCTION-COMMENT: handleSubmit
   * Purpose: Handles handle submit.
   * Line-by-line:
   * 1. Executes `e.preventDefault();`.
   * 2. Executes `setError("");`.
   * 3. Executes `const normalizedEmail = email.trim().toLowerCase();`.
   * 4. Executes `if (!EMAIL_PATTERN.test(normalizedEmail)) {`.
   * 5. Executes `setError("Enter a valid email address.");`.
   * 6. Executes `return;`.
   * 7. Executes `}`.
   * 8. Executes `if (password.length < 8 || password.length > 72) {`.
   * 9. Executes `setError("Password must be between 8 and 72 characters.");`.
   * 10. Executes `return;`.
   * 11. Executes `}`.
   * 12. Executes `const result = await signIn("credentials", {`.
   * 13. Executes `email: normalizedEmail,`.
   * 14. Executes `password,`.
   * 15. Executes `intent: isSignupMode ? "signup" : "signin",`.
   * 16. Executes `redirect: false,`.
   * 17. Executes `});`.
   * 18. Executes `if (result?.ok) {`.
   * 19. Executes `router.push(callbackUrl);`.
   * 20. Executes `return;`.
   * 21. Executes `}`.
   * 22. Executes `setError(`.
   * 23. Executes `isSignupMode`.
   * 24. Executes `? "Unable to create account with that email/password. If this email was created with Google, use Google sign-in first."`.
   * 25. Executes `: "Invalid email or password. If you signed up with Google, use Google sign-in."`.
   * 26. Executes `);`.
   */
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

/**
 * AUTO-FUNCTION-COMMENT: LoginPage
 * Purpose: Handles login page.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<Suspense`.
 * 3. Executes `fallback={`.
 * 4. Executes `<div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">`.
 * 5. Executes `<p className="text-sm font-medium">Loading sign in...</p>`.
 * 6. Executes `</div>`.
 * 7. Executes `}`.
 * 8. Executes `>`.
 * 9. Executes `<LoginPageContent />`.
 * 10. Executes `</Suspense>`.
 * 11. Executes `);`.
 */
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
