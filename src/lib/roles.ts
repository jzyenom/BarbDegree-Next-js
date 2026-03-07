export type AppRole = "client" | "barber" | "admin" | "superadmin";

/**
 * AUTO-FUNCTION-COMMENT: isAdminRole
 * Purpose: Handles is admin role.
 * Line-by-line:
 * 1. Executes `return role === "admin" || role === "superadmin";`.
 */
export function isAdminRole(role?: string | null): role is "admin" | "superadmin" {
  return role === "admin" || role === "superadmin";
}

/**
 * AUTO-FUNCTION-COMMENT: isSuperadminRole
 * Purpose: Handles is superadmin role.
 * Line-by-line:
 * 1. Executes `return role === "superadmin";`.
 */
export function isSuperadminRole(role?: string | null): role is "superadmin" {
  return role === "superadmin";
}

