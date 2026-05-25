import connectToDatabase from "@/database/dbConnect";
import type { AppRole } from "@/lib/roles";
import User from "@/models/User";

const DASHBOARD_ROLES: AppRole[] = ["client", "barber", "admin", "superadmin"];

export function dashboardPathForRole(role: AppRole) {
  return `/dashboard/${role}`;
}

export async function getCurrentUserRoleByEmail(email?: string | null) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return null;

  await connectToDatabase();

  const user = await User.findOne({ email: normalizedEmail }).select("_id role");
  const role = user?.role as AppRole | undefined;

  return role && DASHBOARD_ROLES.includes(role) ? role : null;
}
