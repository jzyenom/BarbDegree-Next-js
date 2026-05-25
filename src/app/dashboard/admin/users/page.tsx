"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminPageShell, {
  AdminEmptyState,
  AdminStatusBadge,
} from "@/components/admin/AdminPageShell";

type ManagedUser = {
  _id: string;
  name: string;
  email: string;
  role: string | null;
  avatar?: string | null;
  hasBarberProfile: boolean;
  hasClientProfile: boolean;
  barberSubscribed: boolean | null;
};

type UsersResponse = {
  users?: ManagedUser[];
  error?: string;
};

const roleOptionsByMode: Record<"admin" | "superadmin", string[]> = {
  admin: ["client", "barber"],
  superadmin: ["client", "barber", "admin", "superadmin"],
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const mode = session?.user?.role === "superadmin" ? "superadmin" : "admin";
  const roleOptions = roleOptionsByMode[mode];

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (roleFilter) query.set("role", roleFilter);
    query.set("limit", "200");

    try {
      const res = await fetch(`/api/admin/users?${query.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as UsersResponse;
      if (!res.ok) throw new Error(json.error || "Failed to load users");
      const nextUsers = json.users ?? [];
      setUsers(nextUsers);
      setMoveTargets((prev) => {
        const next = { ...prev };
        nextUsers.forEach((user) => {
          next[user._id] = next[user._id] || user.role || "client";
        });
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleRoleUpdate(userId: string) {
    const nextRole = moveTargets[userId];
    if (!nextRole) return;

    setSavingUserId(userId);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const json = (await res.json()) as { user?: ManagedUser; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to update user role");
      setNotice("User role updated.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user role");
    } finally {
      setSavingUserId(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadUsers();
  }

  return (
    <AdminPageShell
      title="Users"
      subtitle="Move users between client, barber, admin, and superadmin roles according to your current access level."
    >
      <section className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]"
        >
          {/* show an input field */}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email"
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#f2800d]"
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            {/* show one choice */}
            <option value="">All roles</option>
            {/* show one choice */}
            <option value="client">Client</option>
            {/* show one choice */}
            <option value="barber">Barber</option>
            {/* show one choice */}
            <option value="admin">Admin</option>
            {/* show one choice */}
            <option value="superadmin">Superadmin</option>
          </select>
          <button className="h-11 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white">
            Apply
          </button>
        </form>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        {loading ? (
          // show text
          <p className="text-sm text-slate-500">Loading users...</p>
        ) : users.length === 0 ? (
          <AdminEmptyState>No users found.</AdminEmptyState>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const protectedAdmin =
                mode !== "superadmin" &&
                (user.role === "admin" || user.role === "superadmin");
              const selectedRole = moveTargets[user._id] || user.role || "client";

              return (
                // show article
                <article
                  key={user._id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-all text-base font-semibold">
                          {user.name || user.email || "Unnamed user"}
                        </h2>
                        <AdminStatusBadge value={user.role || "no role"} />
                        {user.hasBarberProfile ? <AdminStatusBadge value="barber profile" /> : null}
                        {user.hasClientProfile ? <AdminStatusBadge value="client profile" /> : null}
                        {user.barberSubscribed ? <AdminStatusBadge value="active" /> : null}
                      </div>
                      {/* show text */}
                      <p className="mt-1 break-all text-sm text-slate-600">
                        {user.email || "No email"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        value={selectedRole}
                        onChange={(event) =>
                          setMoveTargets((prev) => ({
                            ...prev,
                            [user._id]: event.target.value,
                          }))
                        }
                        disabled={protectedAdmin || savingUserId === user._id}
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {roleOptions.map((role) => (
                          // show one choice
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => void handleRoleUpdate(user._id)}
                        disabled={
                          protectedAdmin ||
                          savingUserId === user._id ||
                          selectedRole === (user.role || "")
                        }
                        className="h-10 rounded-lg bg-[#f2800d] px-4 text-sm font-semibold text-white disabled:bg-slate-300"
                      >
                        {savingUserId === user._id ? "Saving..." : "Move"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AdminPageShell>
  );
}
