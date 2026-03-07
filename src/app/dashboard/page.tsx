/**
 * AUTO-FILE-COMMENT: src/app/dashboard/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

/**
 * AUTO-FUNCTION-COMMENT: DashboardPage
 * Purpose: Handles dashboard page.
 * Line-by-line:
 * 1. Executes `const session = await getServerSession(authOptions);`.
 * 2. Executes `if (!session?.user) {`.
 * 3. Executes `redirect("/login");`.
 * 4. Executes `}`.
 * 5. Executes `if (session.user.role) {`.
 * 6. Executes `redirect(\`/dashboard/${session.user.role}\`);`.
 * 7. Executes `}`.
 * 8. Executes `redirect("/register");`.
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role) {
    redirect(`/dashboard/${session.user.role}`);
  }

  redirect("/register");
}
