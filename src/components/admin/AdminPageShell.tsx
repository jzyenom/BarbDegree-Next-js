"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  CalendarDays,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Scissors,
  ShieldCheck,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const navItems = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/barbers", label: "Barbers", icon: Scissors },
  { href: "/dashboard/admin/clients", label: "Clients", icon: UserRound },
  { href: "/dashboard/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/admin/services", label: "Services", icon: ClipboardList },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: CreditCard },
  { href: "/dashboard/admin/subscriptions", label: "Subscriptions", icon: ShieldCheck },
  { href: "/dashboard/admin/plans", label: "Plans", icon: BadgeDollarSign },
  { href: "/dashboard/admin/reviews", label: "Reviews", icon: Star },
];

type AdminPageShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AdminStatusBadge({ value }: { value?: string | boolean | null }) {
  const normalized = String(value ?? "unknown").toLowerCase();
  const positive = ["active", "paid", "success", "confirmed", "completed", "true"];
  const negative = ["inactive", "failed", "declined", "cancelled", "false"];
  const className = positive.includes(normalized)
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : negative.includes(normalized)
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    // show inline text
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {normalized}
    </span>
  );
}

export function AdminEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export function formatAdminDate(value?: string | Date | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export default function AdminPageShell({
  title,
  subtitle,
  actions,
  children,
}: AdminPageShellProps) {
  const pathname = usePathname() ?? "";

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      {/* show the header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {/* show text */}
              <p className="text-xs font-semibold uppercase tracking-wide text-[#f2800d]">
                BarbDegree Admin
              </p>
              {/* show the main heading */}
              <h1 className="mt-1 text-2xl font-bold">{title}</h1>
              {subtitle ? (
                // show text
                <p className="mt-1 max-w-3xl text-sm text-slate-600">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              <LogoutButton />
            </div>
          </div>

          {/* show navigation */}
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/dashboard/admin"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* show main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
