import type { ReactNode } from "react";
import { requireSuperadminPage } from "@/lib/adminAuth";

export default async function SuperadminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSuperadminPage();

  return children;
}
