/**
 * AUTO-FILE-COMMENT: src/app/auth/redirect/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type SelectedRole = "barber" | "client" | null;

/**
 * AUTO-FUNCTION-COMMENT: parseSelectedRole
 * Purpose: Handles parse selected role.
 * Line-by-line:
 * 1. Executes `if (value === "barber" || value === "client") {`.
 * 2. Executes `return value;`.
 * 3. Executes `}`.
 * 4. Executes `return null;`.
 */
function parseSelectedRole(value: string | null): SelectedRole {
  if (value === "barber" || value === "client") {
    return value;
  }
  return null;
}

/**
 * AUTO-FUNCTION-COMMENT: AuthRedirectPageContent
 * Purpose: Handles auth redirect page content.
 * Line-by-line:
 * 1. Executes `const router = useRouter();`.
 * 2. Executes `const searchParams = useSearchParams();`.
 * 3. Executes `const { data: session, status } = useSession();`.
 * 4. Executes `const hasHandledRedirect = useRef(false);`.
 * 5. Executes `const selectedRole = useMemo(`.
 * 6. Executes `() => parseSelectedRole(searchParams?.get("role") ?? null),`.
 * 7. Executes `[searchParams]`.
 * 8. Executes `);`.
 * 9. Executes `useEffect(() => {`.
 * 10. Executes `if (status === "loading" || hasHandledRedirect.current) return;`.
 * 11. Executes `if (!session?.user) {`.
 * 12. Executes `hasHandledRedirect.current = true;`.
 * 13. Executes `router.replace("/login");`.
 * 14. Executes `return;`.
 * 15. Executes `}`.
 * 16. Executes `const role = session.user.role;`.
 * 17. Executes `if (role) {`.
 * 18. Executes `hasHandledRedirect.current = true;`.
 * 19. Executes `router.replace(\`/dashboard/${role}\`);`.
 * 20. Executes `return;`.
 * 21. Executes `}`.
 * 22. Executes `if (!selectedRole) {`.
 * 23. Executes `hasHandledRedirect.current = true;`.
 * 24. Executes `router.replace("/register");`.
 * 25. Executes `return;`.
 * 26. Executes `}`.
 * 27. Executes `hasHandledRedirect.current = true;`.
 * 28. Executes `const persistRoleAndRedirect = async () => {`.
 * 29. Executes `try {`.
 * 30. Executes `const response = await fetch("/api/role", {`.
 * 31. Executes `method: "POST",`.
 * 32. Executes `headers: {`.
 * 33. Executes `"Content-Type": "application/json",`.
 * 34. Executes `},`.
 * 35. Executes `body: JSON.stringify({ role: selectedRole }),`.
 * 36. Executes `});`.
 * 37. Executes `if (!response.ok) {`.
 * 38. Executes `router.replace("/register");`.
 * 39. Executes `return;`.
 * 40. Executes `}`.
 * 41. Executes `router.replace(\`/register/${selectedRole}\`);`.
 * 42. Executes `} catch {`.
 * 43. Executes `router.replace("/register");`.
 * 44. Executes `}`.
 * 45. Executes `};`.
 * 46. Executes `void persistRoleAndRedirect();`.
 * 47. Executes `}, [router, selectedRole, session?.user, status]);`.
 * 48. Executes `return (`.
 * 49. Executes `<div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">`.
 * 50. Executes `<p className="text-sm font-medium">Redirecting...</p>`.
 * 51. Executes `</div>`.
 * 52. Executes `);`.
 */
function AuthRedirectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const hasHandledRedirect = useRef(false);
  const selectedRole = useMemo(
    () => parseSelectedRole(searchParams?.get("role") ?? null),
    [searchParams]
  );

  useEffect(() => {
    if (status === "loading" || hasHandledRedirect.current) return;

    if (!session?.user) {
      hasHandledRedirect.current = true;
      router.replace("/login");
      return;
    }

    const role = session.user.role;
    if (role) {
      hasHandledRedirect.current = true;
      router.replace(`/dashboard/${role}`);
      return;
    }

    if (!selectedRole) {
      hasHandledRedirect.current = true;
      router.replace("/register");
      return;
    }

    hasHandledRedirect.current = true;

    /**
     * AUTO-FUNCTION-COMMENT: persistRoleAndRedirect
     * Purpose: Handles persist role and redirect.
     * Line-by-line:
     * 1. Executes `try {`.
     * 2. Executes `const response = await fetch("/api/role", {`.
     * 3. Executes `method: "POST",`.
     * 4. Executes `headers: {`.
     * 5. Executes `"Content-Type": "application/json",`.
     * 6. Executes `},`.
     * 7. Executes `body: JSON.stringify({ role: selectedRole }),`.
     * 8. Executes `});`.
     * 9. Executes `if (!response.ok) {`.
     * 10. Executes `router.replace("/register");`.
     * 11. Executes `return;`.
     * 12. Executes `}`.
     * 13. Executes `router.replace(\`/register/${selectedRole}\`);`.
     * 14. Executes `} catch {`.
     * 15. Executes `router.replace("/register");`.
     * 16. Executes `}`.
     */
    const persistRoleAndRedirect = async () => {
      try {
        const response = await fetch("/api/role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: selectedRole }),
        });

        if (!response.ok) {
          router.replace("/register");
          return;
        }

        router.replace(`/register/${selectedRole}`);
      } catch {
        router.replace("/register");
      }
    };

    void persistRoleAndRedirect();
  }, [router, selectedRole, session?.user, status]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">
      <p className="text-sm font-medium">Redirecting...</p>
    </div>
  );
}

/**
 * AUTO-FUNCTION-COMMENT: AuthRedirectPage
 * Purpose: Handles auth redirect page.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<Suspense`.
 * 3. Executes `fallback={`.
 * 4. Executes `<div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">`.
 * 5. Executes `<p className="text-sm font-medium">Redirecting...</p>`.
 * 6. Executes `</div>`.
 * 7. Executes `}`.
 * 8. Executes `>`.
 * 9. Executes `<AuthRedirectPageContent />`.
 * 10. Executes `</Suspense>`.
 * 11. Executes `);`.
 */
export default function AuthRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">
          <p className="text-sm font-medium">Redirecting...</p>
        </div>
      }
    >
      <AuthRedirectPageContent />
    </Suspense>
  );
}
