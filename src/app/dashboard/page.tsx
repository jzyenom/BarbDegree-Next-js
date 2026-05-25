import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { dashboardPathForRole, getCurrentUserRoleByEmail } from "@/lib/userRole";


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentRole = await getCurrentUserRoleByEmail(session.user.email);

  if (currentRole) {
    redirect(dashboardPathForRole(currentRole));
  }

  redirect("/register");
}
