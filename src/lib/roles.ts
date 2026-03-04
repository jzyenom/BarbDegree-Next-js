export type AppRole = "client" | "barber" | "admin" | "superadmin";

export function isAdminRole(role?: string | null): role is "admin" | "superadmin" {
  return role === "admin" || role === "superadmin";
}

export function isSuperadminRole(role?: string | null): role is "superadmin" {
  return role === "superadmin";
}

