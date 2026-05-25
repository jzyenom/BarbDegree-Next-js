import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { isAdminRole, isSuperadminRole } from "@/lib/roles";

export async function requireAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/dashboard");
  }

  return session;
}

export async function requireSuperadminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!isSuperadminRole(session.user.role)) {
    redirect("/dashboard");
  }

  return session;
}
