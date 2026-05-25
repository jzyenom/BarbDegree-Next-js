import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { isAdminRole, isSuperadminRole } from "@/lib/roles";
import { dashboardPathForRole, getCurrentUserRoleByEmail } from "@/lib/userRole";

export async function requireAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentRole = await getCurrentUserRoleByEmail(session.user.email);

  if (!isAdminRole(currentRole)) {
    redirect(currentRole ? dashboardPathForRole(currentRole) : "/register");
  }

  session.user.role = currentRole;
  return session;
}

export async function requireSuperadminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentRole = await getCurrentUserRoleByEmail(session.user.email);

  if (!isSuperadminRole(currentRole)) {
    redirect(currentRole ? dashboardPathForRole(currentRole) : "/register");
  }

  session.user.role = currentRole;
  return session;
}
