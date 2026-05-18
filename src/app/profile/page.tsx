import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

export default async function ProfileShortcutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "barber") {
    redirect("/dashboard/barber/profile");
  }

  if (session.user.role === "admin" || session.user.role === "superadmin") {
    redirect(`/dashboard/${session.user.role}`);
  }

  redirect("/dashboard/client/profile");
}
