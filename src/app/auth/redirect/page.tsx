import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Client from "@/models/Client";
import User from "@/models/User";

type SelectedRole = "barber" | "client";
type DashboardRole = "client" | "barber" | "admin" | "superadmin";

type AuthRedirectPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseSelectedRole(value: string | string[] | undefined): SelectedRole | null {
  const role = Array.isArray(value) ? value[0] : value;
  return role === "barber" || role === "client" ? role : null;
}

async function persistSelectedRole(email: string, role: SelectedRole) {
  await connectToDatabase();

  const user = await User.findOne({ email }).select("_id role");
  if (!user) return null;

  const currentRole = user.role as string | undefined;
  if (currentRole) return currentRole;

  if (role === "barber") {
    const existingClient = await Client.findOne({ userId: user._id }).select("_id");
    if (existingClient) return null;
  }

  if (role === "client") {
    const existingBarber = await Barber.findOne({ userId: user._id }).select("_id");
    if (existingBarber) return null;
  }

  user.role = role;
  await user.save();
  return role;
}

async function getCurrentUserRole(email: string) {
  await connectToDatabase();

  const user = await User.findOne({ email }).select("_id role");
  return (user?.role as DashboardRole | undefined) ?? null;
}

export default async function AuthRedirectPage({ searchParams }: AuthRedirectPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const email = session.user.email.trim().toLowerCase();
  const currentRole = await getCurrentUserRole(email);

  if (currentRole) {
    redirect(`/dashboard/${currentRole}`);
  }

  const params = await searchParams;
  const selectedRole = parseSelectedRole(params?.role);

  if (!selectedRole) {
    redirect("/register");
  }

  const persistedRole = await persistSelectedRole(email, selectedRole);

  if (persistedRole === "client" || persistedRole === "barber") {
    redirect(`/register/${persistedRole}`);
  }

  if (persistedRole === "admin" || persistedRole === "superadmin") {
    redirect(`/dashboard/${persistedRole}`);
  }

  redirect("/register");
}
