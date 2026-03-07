/**
 * AUTO-FILE-COMMENT: src/app/register_role/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type RequestError = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
};

/**
 * AUTO-FUNCTION-COMMENT: RoleSelectionPage
 * Purpose: Handles role selection page.
 * Line-by-line:
 * 1. Executes `const router = useRouter();`.
 * 2. Executes `const { data: session, status } = useSession();`.
 * 3. Executes `const [loading, setLoading] = useState(false);`.
 * 4. Executes `useEffect(() => {`.
 * 5. Executes `if (status === "loading") return;`.
 * 6. Executes `if (session?.user?.role) {`.
 * 7. Executes `router.replace(\`/dashboard/${session.user.role}\`);`.
 * 8. Executes `}`.
 * 9. Executes `}, [router, session, status]);`.
 * 10. Executes `const handleRoleSelect = async (role: "barber" | "client") => {`.
 * 11. Executes `if (!session?.user?.email) {`.
 * 12. Executes `router.push(\`/login?mode=signup&role=${role}\`);`.
 * 13. Executes `return;`.
 * 14. Executes `}`.
 * 15. Executes `setLoading(true);`.
 * 16. Executes `try {`.
 * 17. Executes `const response = await axios.post<{ message: string }>("/api/role", {`.
 * 18. Executes `role,`.
 * 19. Executes `});`.
 * 20. Executes `if (response.data.message === "Role updated") {`.
 * 21. Executes `router.push(\`/register/${role}\`);`.
 * 22. Executes `}`.
 * 23. Executes `} catch (err: unknown) {`.
 * 24. Executes `console.error("Role selection failed:", err);`.
 * 25. Executes `const requestError = err as RequestError;`.
 * 26. Executes `const errorMessage =`.
 * 27. Executes `requestError.response?.data?.message ||`.
 * 28. Executes `requestError.response?.data?.error ||`.
 * 29. Executes `"Failed to save role. Please try again.";`.
 * 30. Executes `alert(\`Error: ${errorMessage}\`);`.
 * 31. Executes `} finally {`.
 * 32. Executes `setLoading(false);`.
 * 33. Executes `}`.
 * 34. Executes `};`.
 * 35. Executes `return (`.
 * 36. Executes `<div className="flex flex-col items-center justify-center h-screen bg-gray-50">`.
 * 37. Executes `<h1 className="text-2xl font-semibold mb-6">Tell us who you are</h1>`.
 * 38. Executes `<p className="text-gray-600 mb-8">`.
 * 39. Executes `Choose your role to personalize your experience`.
 * 40. Executes `</p>`.
 * 41. Executes `<div className="grid grid-cols-2 gap-6">`.
 * 42. Executes `<button`.
 * 43. Executes `onClick={() => handleRoleSelect("barber")}`.
 * 44. Executes `disabled={loading}`.
 * 45. Executes `className="p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all disabled:opacity-50"`.
 * 46. Executes `>`.
 * 47. Executes `<h2 className="font-semibold mt-2">I&apos;m a Barber</h2>`.
 * 48. Executes `</button>`.
 * 49. Executes `<button`.
 * 50. Executes `onClick={() => handleRoleSelect("client")}`.
 * 51. Executes `disabled={loading}`.
 * 52. Executes `className="p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all disabled:opacity-50"`.
 * 53. Executes `>`.
 * 54. Executes `<h2 className="font-semibold mt-2">I&apos;m a Client</h2>`.
 * 55. Executes `</button>`.
 * 56. Executes `</div>`.
 * 57. Executes `{loading && <p className="mt-4 text-sm text-gray-500">Saving role...</p>}`.
 * 58. Executes `</div>`.
 * 59. Executes `);`.
 */
export default function RoleSelectionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.role) {
      router.replace(`/dashboard/${session.user.role}`);
    }
  }, [router, session, status]);

  /**
   * AUTO-FUNCTION-COMMENT: handleRoleSelect
   * Purpose: Handles handle role select.
   * Line-by-line:
   * 1. Executes `if (!session?.user?.email) {`.
   * 2. Executes `router.push(\`/login?mode=signup&role=${role}\`);`.
   * 3. Executes `return;`.
   * 4. Executes `}`.
   * 5. Executes `setLoading(true);`.
   * 6. Executes `try {`.
   * 7. Executes `const response = await axios.post<{ message: string }>("/api/role", {`.
   * 8. Executes `role,`.
   * 9. Executes `});`.
   * 10. Executes `if (response.data.message === "Role updated") {`.
   * 11. Executes `router.push(\`/register/${role}\`);`.
   * 12. Executes `}`.
   * 13. Executes `} catch (err: unknown) {`.
   * 14. Executes `console.error("Role selection failed:", err);`.
   * 15. Executes `const requestError = err as RequestError;`.
   * 16. Executes `const errorMessage =`.
   * 17. Executes `requestError.response?.data?.message ||`.
   * 18. Executes `requestError.response?.data?.error ||`.
   * 19. Executes `"Failed to save role. Please try again.";`.
   * 20. Executes `alert(\`Error: ${errorMessage}\`);`.
   * 21. Executes `} finally {`.
   * 22. Executes `setLoading(false);`.
   * 23. Executes `}`.
   */
  const handleRoleSelect = async (role: "barber" | "client") => {
    if (!session?.user?.email) {
      router.push(`/login?mode=signup&role=${role}`);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post<{ message: string }>("/api/role", {
        role,
      });
      if (response.data.message === "Role updated") {
        router.push(`/register/${role}`);
      }
    } catch (err: unknown) {
      console.error("Role selection failed:", err);
      const requestError = err as RequestError;
      const errorMessage =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Failed to save role. Please try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">Tell us who you are</h1>
      <p className="text-gray-600 mb-8">
        Choose your role to personalize your experience
      </p>
      <div className="grid grid-cols-2 gap-6">
        <button
          onClick={() => handleRoleSelect("barber")}
          disabled={loading}
          className="p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all disabled:opacity-50"
        >
          <h2 className="font-semibold mt-2">I&apos;m a Barber</h2>
        </button>

        <button
          onClick={() => handleRoleSelect("client")}
          disabled={loading}
          className="p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all disabled:opacity-50"
        >
          <h2 className="font-semibold mt-2">I&apos;m a Client</h2>
        </button>
      </div>
      {loading && <p className="mt-4 text-sm text-gray-500">Saving role...</p>}
    </div>
  );
}
