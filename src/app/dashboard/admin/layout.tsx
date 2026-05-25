import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/adminAuth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminPage();

  return children;
}
