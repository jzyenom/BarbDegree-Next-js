import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { dashboardPathForRole, getCurrentUserRoleByEmail } from "@/lib/userRole";

export default async function ProfileShortcutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentRole = await getCurrentUserRoleByEmail(session.user.email);

  if (currentRole === "barber") {
    redirect("/dashboard/barber/profile");
  }

  if (currentRole === "admin" || currentRole === "superadmin") {
    redirect(dashboardPathForRole(currentRole));
  }

  if (currentRole === "client") {
    redirect("/dashboard/client/profile");
  }

  redirect("/register");
}
