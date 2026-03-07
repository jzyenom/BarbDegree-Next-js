/**
 * AUTO-FILE-COMMENT: src/app/register/client/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layouts/AuthLayout";
import AuthInput from "@/components/AuthInput";
import { Phone, Globe, MapPin, Home } from "lucide-react";

type RequestError = {
  response?: {
    data?: {
      message?: string;
      error?: string;
      exists?: boolean;
    };
  };
};

/**
 * AUTO-FUNCTION-COMMENT: ClientForm
 * Purpose: Handles client form.
 * Line-by-line:
 * 1. Executes `const { data: session } = useSession();`.
 * 2. Executes `const router = useRouter();`.
 * 3. Executes `const [formData, setFormData] = useState({`.
 * 4. Executes `whatsapp: "",`.
 * 5. Executes `mobile: "",`.
 * 6. Executes `country: "",`.
 * 7. Executes `state: "",`.
 * 8. Executes `address: "",`.
 * 9. Executes `});`.
 * 10. Executes `const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {`.
 * 11. Executes `setFormData({ ...formData, [e.target.name]: e.target.value });`.
 * 12. Executes `};`.
 * 13. Executes `const validateForm = () => {`.
 * 14. Executes `const requiredFields = ['whatsapp', 'mobile', 'country', 'state', 'address'];`.
 * 15. Executes `for (const field of requiredFields) {`.
 * 16. Executes `if (!formData[field as keyof typeof formData]?.trim()) {`.
 * 17. Executes `alert(\`${field.charAt(0).toUpperCase() + field.slice(1)} is required\`);`.
 * 18. Executes `return false;`.
 * 19. Executes `}`.
 * 20. Executes `}`.
 * 21. Executes `// Validate phone numbers`.
 * 22. Executes `const phoneRegex = /^\+?[\d\s\-\(\)]+$/;`.
 * 23. Executes `if (!phoneRegex.test(formData.whatsapp) || !phoneRegex.test(formData.mobile)) {`.
 * 24. Executes `alert("Please enter valid phone numbers");`.
 * 25. Executes `return false;`.
 * 26. Executes `}`.
 * 27. Executes `return true;`.
 * 28. Executes `};`.
 * 29. Executes `const handleSubmit = async (e: React.FormEvent) => {`.
 * 30. Executes `e.preventDefault();`.
 * 31. Executes `if (!validateForm()) return;`.
 * 32. Executes `if (!session?.user?.email) {`.
 * 33. Executes `alert("Session expired. Please login again.");`.
 * 34. Executes `router.push("/login");`.
 * 35. Executes `return;`.
 * 36. Executes `}`.
 * 37. Executes `try {`.
 * 38. Executes `const response = await axios.post<{ message: string }>("/api/client", formData);`.
 * 39. Executes `if (response.data.message === "Client registered successfully") {`.
 * 40. Executes `router.push("/dashboard/client");`.
 * 41. Executes `}`.
 * 42. Executes `} catch (error: unknown) {`.
 * 43. Executes `console.error("Error submitting client form", error);`.
 * 44. Executes `const errorMessage = (error as any)?.response?.data?.message || (error as any)?.response?.data?.error || "Failed to register. Please try ...`.
 * 45. Executes `alert(\`Error: ${errorMessage}\`);`.
 * 46. Executes `}`.
 * 47. Executes `};`.
 * 48. Executes `return (`.
 * 49. Executes `<AuthLayout`.
 * 50. Executes `title="Complete Your Profile"`.
 * 51. Executes `footerText="Already have an account?"`.
 * 52. Executes `footerLink="/login"`.
 * 53. Executes `footerLinkText="Sign In"`.
 * 54. Executes `>`.
 * 55. Executes `<div className="w-full max-w-[480px] space-y-4">`.
 * 56. Executes `<h1 className="text-[22px] font-bold text-center mt-2 mb-6">`.
 * 57. Executes `Client Information`.
 * 58. Executes `</h1>`.
 * 59. Executes `<form onSubmit={handleSubmit} className="space-y-4">`.
 * 60. Executes `<AuthInput`.
 * 61. Executes `name="whatsapp"`.
 * 62. Executes `type="text"`.
 * 63. Executes `placeholder="WhatsApp Number"`.
 * 64. Executes `icon={Phone}`.
 * 65. Executes `value={formData.whatsapp}`.
 * 66. Executes `onChange={handleChange}`.
 * 67. Executes `/>`.
 * 68. Executes `<AuthInput`.
 * 69. Executes `name="mobile"`.
 * 70. Executes `type="text"`.
 * 71. Executes `placeholder="Mobile Number"`.
 * 72. Executes `icon={Phone}`.
 * 73. Executes `value={formData.mobile}`.
 * 74. Executes `onChange={handleChange}`.
 * 75. Executes `/>`.
 * 76. Executes `<AuthInput`.
 * 77. Executes `name="country"`.
 * 78. Executes `type="text"`.
 * 79. Executes `placeholder="Country"`.
 * 80. Executes `icon={Globe}`.
 * 81. Executes `value={formData.country}`.
 * 82. Executes `onChange={handleChange}`.
 * 83. Executes `/>`.
 * 84. Executes `<AuthInput`.
 * 85. Executes `name="state"`.
 * 86. Executes `type="text"`.
 * 87. Executes `placeholder="State"`.
 * 88. Executes `icon={MapPin}`.
 * 89. Executes `value={formData.state}`.
 * 90. Executes `onChange={handleChange}`.
 * 91. Executes `/>`.
 * 92. Executes `<AuthInput`.
 * 93. Executes `name="address"`.
 * 94. Executes `type="text"`.
 * 95. Executes `placeholder="Address"`.
 * 96. Executes `icon={Home}`.
 * 97. Executes `value={formData.address}`.
 * 98. Executes `onChange={handleChange}`.
 * 99. Executes `/>`.
 * 100. Executes `<button`.
 * 101. Executes `type="submit"`.
 * 102. Executes `className="w-full h-12 rounded-xl bg-[#f96b06] text-white font-bold tracking-wide hover:bg-orange-600 transition-all"`.
 * 103. Executes `>`.
 * 104. Executes `Save & Continue`.
 * 105. Executes `</button>`.
 * 106. Executes `</form>`.
 * 107. Executes `</div>`.
 * 108. Executes `</AuthLayout>`.
 * 109. Executes `);`.
 */
export default function ClientForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [formData, setFormData] = useState({
    whatsapp: "",
    mobile: "",
    country: "",
    state: "",
    address: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      router.replace("/login?mode=signup&role=client");
      return;
    }

    if (session.user.role && session.user.role !== "client") {
      router.replace("/register");
      return;
    }

    let mounted = true;

    /**
     * AUTO-FUNCTION-COMMENT: verifyRegistrationState
     * Purpose: Handles verify registration state.
     * Line-by-line:
     * 1. Executes `try {`.
     * 2. Executes `const response = await fetch("/api/client", { cache: "no-store" });`.
     * 3. Executes `const payload = (await response.json().catch(() => ({}))) as {`.
     * 4. Executes `exists?: boolean;`.
     * 5. Executes `};`.
     * 6. Executes `if (mounted && response.ok && payload.exists) {`.
     * 7. Executes `router.replace("/dashboard/client");`.
     * 8. Executes `return;`.
     * 9. Executes `}`.
     * 10. Executes `} finally {`.
     * 11. Executes `if (mounted) {`.
     * 12. Executes `setCheckingAccess(false);`.
     * 13. Executes `}`.
     * 14. Executes `}`.
     */
    const verifyRegistrationState = async () => {
      try {
        const response = await fetch("/api/client", { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as {
          exists?: boolean;
        };

        if (mounted && response.ok && payload.exists) {
          router.replace("/dashboard/client");
          return;
        }
      } finally {
        if (mounted) {
          setCheckingAccess(false);
        }
      }
    };

    void verifyRegistrationState();

    return () => {
      mounted = false;
    };
  }, [router, session?.user?.email, session?.user?.role, status]);

  /**
   * AUTO-FUNCTION-COMMENT: handleChange
   * Purpose: Handles handle change.
   * Line-by-line:
   * 1. Executes `setFormData({ ...formData, [e.target.name]: e.target.value });`.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * AUTO-FUNCTION-COMMENT: validateForm
   * Purpose: Handles validate form.
   * Line-by-line:
   * 1. Executes `const requiredFields = ['whatsapp', 'mobile', 'country', 'state', 'address'];`.
   * 2. Executes `for (const field of requiredFields) {`.
   * 3. Executes `if (!formData[field as keyof typeof formData]?.trim()) {`.
   * 4. Executes `alert(\`${field.charAt(0).toUpperCase() + field.slice(1)} is required\`);`.
   * 5. Executes `return false;`.
   * 6. Executes `}`.
   * 7. Executes `}`.
   * 8. Executes `const phoneRegex = /^\+?[\d\s\-\(\)]+$/;`.
   * 9. Executes `if (!phoneRegex.test(formData.whatsapp) || !phoneRegex.test(formData.mobile)) {`.
   * 10. Executes `alert("Please enter valid phone numbers");`.
   * 11. Executes `return false;`.
   * 12. Executes `}`.
   * 13. Executes `return true;`.
   */
  const validateForm = () => {
    const requiredFields = ['whatsapp', 'mobile', 'country', 'state', 'address'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.trim()) {
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    // Validate phone numbers
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.whatsapp) || !phoneRegex.test(formData.mobile)) {
      alert("Please enter valid phone numbers");
      return false;
    }
    return true;
  };

  /**
   * AUTO-FUNCTION-COMMENT: handleSubmit
   * Purpose: Handles handle submit.
   * Line-by-line:
   * 1. Executes `e.preventDefault();`.
   * 2. Executes `if (!validateForm()) return;`.
   * 3. Executes `if (!session?.user?.email) {`.
   * 4. Executes `alert("Session expired. Please login again.");`.
   * 5. Executes `router.push("/login");`.
   * 6. Executes `return;`.
   * 7. Executes `}`.
   * 8. Executes `try {`.
   * 9. Executes `const response = await axios.post<{ message: string }>("/api/client", formData);`.
   * 10. Executes `if (response.data.message === "Client registered successfully") {`.
   * 11. Executes `router.push("/dashboard/client");`.
   * 12. Executes `}`.
   * 13. Executes `} catch (error: unknown) {`.
   * 14. Executes `console.error("Error submitting client form", error);`.
   * 15. Executes `const errorMessage = (error as any)?.response?.data?.message || (error as any)?.response?.data?.error || "Failed to register. Please try ...`.
   * 16. Executes `alert(\`Error: ${errorMessage}\`);`.
   * 17. Executes `}`.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!session?.user?.email) {
      alert("Session expired. Please login again.");
      router.push("/login");
      return;
    }

    try {
      const response = await axios.post<{ message: string }>("/api/client", formData);
      if (response.data.message === "Client registered successfully") {
        router.push("/dashboard/client");
      }
    } catch (error: unknown) {
      console.error("Error submitting client form", error);
      const requestError = error as RequestError;
      const errorMessage =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Failed to register. Please try again.";
      alert(`Error: ${errorMessage}`);
    }
  };

  if (status === "loading" || checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">
        <p className="text-sm font-medium">Preparing registration...</p>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Complete Your Profile"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign In"
    >
      <div className="w-full max-w-[480px] space-y-4">
        <h1 className="text-[22px] font-bold text-center mt-2 mb-6">
          Client Information
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            name="whatsapp"
            type="text"
            placeholder="WhatsApp Number"
            icon={Phone}
            value={formData.whatsapp}
            onChange={handleChange}
          />
          <AuthInput
            name="mobile"
            type="text"
            placeholder="Mobile Number"
            icon={Phone}
            value={formData.mobile}
            onChange={handleChange}
          />
          <AuthInput
            name="country"
            type="text"
            placeholder="Country"
            icon={Globe}
            value={formData.country}
            onChange={handleChange}
          />
          <AuthInput
            name="state"
            type="text"
            placeholder="State"
            icon={MapPin}
            value={formData.state}
            onChange={handleChange}
          />
          <AuthInput
            name="address"
            type="text"
            placeholder="Address"
            icon={Home}
            value={formData.address}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#f96b06] text-white font-bold tracking-wide hover:bg-orange-600 transition-all"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
