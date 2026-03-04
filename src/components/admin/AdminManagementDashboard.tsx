"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  CreditCard,
  Scissors,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import LogoutButton from "@/components/LogoutButton";
import { formatNaira } from "@/lib/format";

type DashboardMode = "admin" | "superadmin";

type ManagedUser = {
  _id: string;
  name: string;
  email: string;
  role: string | null;
  hasBarberProfile: boolean;
  hasClientProfile: boolean;
  barberSubscribed: boolean | null;
};

type DashboardStatsResponse = {
  stats: {
    users: {
      total: number;
      clients: number;
      barbers: number;
      admins: number;
      superadmins: number;
    };
    profiles: {
      barberProfiles: number;
      clientProfiles: number;
      subscribedBarbers: number;
    };
    services: {
      total: number;
    };
    bookings: {
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      declined: number;
      paid: number;
      unpaid: number;
    };
    transactions: {
      total: number;
      success: number;
      pending: number;
      failed: number;
      revenue: number;
    };
  };
  recent: {
    bookings: Array<{
      _id: string;
      service?: string;
      createdAt?: string;
      dateTime?: string;
      status?: string;
      paymentStatus?: string;
      clientId?: { name?: string; email?: string };
      barberId?: { userId?: { name?: string; email?: string } };
    }>;
    transactions: Array<{
      _id: string;
      amount?: number;
      status?: string;
      reference?: string;
      createdAt?: string;
      userId?: { name?: string; email?: string };
      bookingId?: { _id?: string; service?: string };
    }>;
  };
};

type UsersResponse = {
  users: ManagedUser[];
};

type AdminManagementDashboardProps = {
  mode: DashboardMode;
};

const roleOptionsByMode: Record<DashboardMode, string[]> = {
  admin: ["client", "barber"],
  superadmin: ["client", "barber", "admin", "superadmin"],
};

function roleBadgeClass(role?: string | null) {
  switch (role) {
    case "superadmin":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "admin":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "barber":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "client":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

function shortDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function AdminManagementDashboard({
  mode,
}: AdminManagementDashboardProps) {
  const { data: session, status } = useSession();
  const [dashboard, setDashboard] = useState<DashboardStatsResponse | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});

  const sessionRole = session?.user?.role || null;
  const allowedRoles =
    mode === "superadmin" ? ["superadmin"] : ["admin", "superadmin"];
  const canAccess = sessionRole ? allowedRoles.includes(sessionRole) : false;

  const title = mode === "superadmin" ? "Superadmin Dashboard" : "Admin Dashboard";
  const subtitle =
    mode === "superadmin"
      ? "Move users across roles and monitor platform activity"
      : "Manage platform activity, bookings, and barber subscriptions";

  const loadDashboard = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const json = (await res.json()) as DashboardStatsResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
      setDashboard(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (roleFilter) query.set("role", roleFilter);
      query.set("limit", "100");

      const res = await fetch(`/api/admin/users?${query.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as UsersResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to load users");

      setUsers(json.users ?? []);
      setMoveTargets((prev) => {
        const next = { ...prev };
        for (const user of json.users ?? []) {
          next[user._id] = next[user._id] || user.role || "client";
        }
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    if (status !== "authenticated" || !canAccess) return;
    setError(null);
    void loadDashboard();
    void loadUsers();
  }, [status, canAccess, loadDashboard, loadUsers]);

  const cards = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        label: "Total Users",
        value: dashboard.stats.users.total.toLocaleString(),
        icon: Users,
      },
      {
        label: "Bookings",
        value: dashboard.stats.bookings.total.toLocaleString(),
        icon: CalendarDays,
      },
      {
        label: "Paid Bookings",
        value: dashboard.stats.bookings.paid.toLocaleString(),
        icon: ShieldCheck,
      },
      {
        label: "Revenue",
        value: formatNaira(dashboard.stats.transactions.revenue),
        icon: CreditCard,
      },
      {
        label: "Barbers",
        value: dashboard.stats.users.barbers.toLocaleString(),
        icon: Scissors,
      },
      {
        label: "Subscribed Barbers",
        value: dashboard.stats.profiles.subscribedBarbers.toLocaleString(),
        icon: Shield,
      },
    ];
  }, [dashboard]);

  async function handleRoleUpdate(userId: string) {
    const nextRole = moveTargets[userId];
    if (!nextRole) return;

    setSavingUserId(userId);
    setNotice(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const json = (await res.json()) as { error?: string; user?: ManagedUser };
      if (!res.ok) throw new Error(json.error || "Failed to update user role");

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, role: json.user?.role ?? nextRole } : u
        )
      );
      setNotice("User role updated.");
      void loadDashboard();
      void loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user role");
    } finally {
      setSavingUserId(null);
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen bg-white p-6">Loading dashboard...</div>;
  }

  if (status !== "authenticated") {
    return <div className="min-h-screen bg-white p-6">Please sign in.</div>;
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-white p-6">
        <p className="text-red-600 font-medium">Forbidden</p>
        <p className="text-sm text-gray-500 mt-2">
          You do not have permission to view this dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#1f1a16]">
      <PageHeader
        title={title}
        titleClassName="text-base md:text-lg"
        left={<div className="w-6" />}
        right={<LogoutButton />}
        className="border-b border-[#ece4da]"
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <section className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-sm text-[#75624e] mt-1">{subtitle}</p>
              <p className="text-xs text-[#8b7b68] mt-2">
                Signed in as {session.user?.email || "Unknown user"} ({sessionRole})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/admin/subscriptions"
                className="inline-flex items-center rounded-lg border border-[#e3d4bf] px-3 py-2 text-sm font-medium hover:bg-[#faf4ea]"
              >
                Barber Subscriptions
              </Link>
              <Link
                href="/bookings"
                className="inline-flex items-center rounded-lg border border-[#e3d4bf] px-3 py-2 text-sm font-medium hover:bg-[#faf4ea]"
              >
                Bookings
              </Link>
              <Link
                href="/transactions"
                className="inline-flex items-center rounded-lg bg-[#f2800d] px-3 py-2 text-sm font-semibold text-white hover:bg-[#de760d]"
              >
                Transactions
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </div>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Overview</h3>
            <button
              onClick={() => {
                setError(null);
                void loadDashboard();
                void loadUsers();
              }}
              className="rounded-lg border border-[#e3d4bf] bg-white px-3 py-2 text-sm font-medium hover:bg-[#faf4ea]"
              disabled={statsLoading || usersLoading}
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#6f5c48]">{card.label}</p>
                    <Icon className="h-4 w-4 text-[#f2800d]" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[#1f1a16]">
                    {statsLoading ? "..." : card.value}
                  </p>
                </div>
              );
            })}
          </div>

          {dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">
                <h4 className="font-semibold mb-3">Users Breakdown</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-[#faf7f2] p-3">
                    Clients: {dashboard.stats.users.clients}
                  </div>
                  <div className="rounded-lg bg-[#faf7f2] p-3">
                    Barbers: {dashboard.stats.users.barbers}
                  </div>
                  <div className="rounded-lg bg-[#faf7f2] p-3">
                    Admins: {dashboard.stats.users.admins}
                  </div>
                  <div className="rounded-lg bg-[#faf7f2] p-3">
                    Superadmins: {dashboard.stats.users.superadmins}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">
                <h4 className="font-semibold mb-3">Bookings / Payments</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-[#faf7f2] p-3">
                    Pending: {dashboard.stats.bookings.pending}
                  </div>
                  <div className="rounded-lg bg-[#faf7f2] p-3">
                    Confirmed: {dashboard.stats.bookings.confirmed}
                  </div>
                  <div className="rounded-lg bg-[#faf7f2] p-3">
                    Completed: {dashboard.stats.bookings.completed}
                  </div>
                  <div className="rounded-lg bg-[#faf7f2] p-3">
                    Unpaid: {dashboard.stats.bookings.unpaid}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {mode === "superadmin" ? "Move Users (Role Management)" : "User Management"}
              </h3>
              <p className="text-sm text-[#75624e]">
                {mode === "superadmin"
                  ? "Move any user between client, barber, admin, and superadmin roles."
                  : "Move users between client and barber roles. Admin-level accounts require superadmin."}
              </p>
            </div>

            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void loadUsers();
              }}
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email"
                className="h-10 rounded-lg border border-[#e3d4bf] px-3 text-sm outline-none focus:ring-2 focus:ring-[#f3c080]"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-lg border border-[#e3d4bf] px-3 text-sm bg-white"
              >
                <option value="">All roles</option>
                <option value="client">Client</option>
                <option value="barber">Barber</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
              <button
                type="submit"
                className="h-10 rounded-lg bg-[#f2800d] px-4 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </form>
          </div>

          <div className="mt-4 space-y-3">
            {usersLoading && <p className="text-sm text-[#75624e]">Loading users...</p>}
            {!usersLoading && users.length === 0 && (
              <p className="text-sm text-[#75624e]">No users found.</p>
            )}

            {users.map((item) => {
              const isProtectedAdminAccount =
                mode !== "superadmin" &&
                (item.role === "admin" || item.role === "superadmin");
              const options = roleOptionsByMode[mode];

              return (
                <div
                  key={item._id}
                  className="rounded-xl border border-[#eee4d6] bg-[#fffdf9] p-3"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold break-all">
                          {item.name || item.email || "Unnamed user"}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${roleBadgeClass(
                            item.role
                          )}`}
                        >
                          {item.role || "no role"}
                        </span>
                        {item.hasBarberProfile && (
                          <span className="text-xs rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                            Barber profile
                          </span>
                        )}
                        {item.hasClientProfile && (
                          <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                            Client profile
                          </span>
                        )}
                        {item.barberSubscribed === true && (
                          <span className="text-xs rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                            Subscribed barber
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#75624e] break-all mt-1">
                        {item.email || "No email"}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <select
                        value={moveTargets[item._id] || item.role || "client"}
                        onChange={(e) =>
                          setMoveTargets((prev) => ({
                            ...prev,
                            [item._id]: e.target.value,
                          }))
                        }
                        disabled={isProtectedAdminAccount || savingUserId === item._id}
                        className="h-10 rounded-lg border border-[#e3d4bf] px-3 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        {options.map((roleOption) => (
                          <option key={roleOption} value={roleOption}>
                            {roleOption}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => void handleRoleUpdate(item._id)}
                        disabled={
                          isProtectedAdminAccount ||
                          savingUserId === item._id ||
                          (moveTargets[item._id] || item.role || "") === (item.role || "")
                        }
                        className="h-10 rounded-lg bg-[#1f1a16] px-4 text-sm font-semibold text-white disabled:bg-[#b7aaa0]"
                      >
                        {savingUserId === item._id ? "Saving..." : "Move"}
                      </button>
                    </div>
                  </div>

                  {isProtectedAdminAccount && (
                    <p className="mt-2 text-xs text-[#9b6b00]">
                      Only superadmin can modify admin or superadmin accounts.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-8">
          <div className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>
            <div className="space-y-2">
              {(dashboard?.recent.bookings ?? []).map((booking) => {
                const barberName =
                  booking.barberId?.userId?.name ||
                  booking.barberId?.userId?.email ||
                  "Barber";
                const clientName =
                  booking.clientId?.name || booking.clientId?.email || "Client";

                return (
                  <div
                    key={booking._id}
                    className="rounded-lg border border-[#eee4d6] p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">
                        {booking.service || "Booking"}
                      </p>
                      <Link
                        href={`/bookings/${booking._id}`}
                        className="text-[#f2800d] font-medium"
                      >
                        Open
                      </Link>
                    </div>
                    <p className="text-[#75624e] mt-1">
                      {clientName} {"->"} {barberName}
                    </p>
                    <p className="text-[#75624e] mt-1">
                      {shortDate(booking.dateTime || booking.createdAt)} |{" "}
                      {booking.status || "pending"} | {booking.paymentStatus || "pending"}
                    </p>
                  </div>
                );
              })}
              {!dashboard?.recent.bookings?.length && (
                <p className="text-sm text-[#75624e]">No recent bookings.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
            <div className="space-y-2">
              {(dashboard?.recent.transactions ?? []).map((tx) => (
                <div
                  key={tx._id}
                  className="rounded-lg border border-[#eee4d6] p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{formatNaira(tx.amount ?? 0)}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.status === "success"
                          ? "bg-green-100 text-green-700"
                          : tx.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tx.status || "pending"}
                    </span>
                  </div>
                  <p className="text-[#75624e] mt-1">
                    {tx.userId?.name || tx.userId?.email || "User"}
                  </p>
                  <p className="text-[#75624e] mt-1 break-all">
                    Ref: {tx.reference || "-"}
                  </p>
                  <p className="text-[#75624e] mt-1">
                    {shortDate(tx.createdAt)}
                    {tx.bookingId?._id ? (
                      <>
                        {" "}
                        |{" "}
                        <Link
                          href={`/bookings/${tx.bookingId._id}`}
                          className="text-[#f2800d] font-medium"
                        >
                          {tx.bookingId.service || "Booking"}
                        </Link>
                      </>
                    ) : null}
                  </p>
                </div>
              ))}
              {!dashboard?.recent.transactions?.length && (
                <p className="text-sm text-[#75624e]">No recent transactions.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
