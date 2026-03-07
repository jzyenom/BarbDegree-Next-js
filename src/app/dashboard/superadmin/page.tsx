/**
 * AUTO-FILE-COMMENT: src/app/dashboard/superadmin/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import AdminManagementDashboard from "@/components/admin/AdminManagementDashboard";

/**
 * AUTO-FUNCTION-COMMENT: SuperadminDashboardPage
 * Purpose: Handles superadmin dashboard page.
 * Line-by-line:
 * 1. Executes `return <AdminManagementDashboard mode="superadmin" />;`.
 */
export default function SuperadminDashboardPage() {
  return <AdminManagementDashboard mode="superadmin" />;
}

