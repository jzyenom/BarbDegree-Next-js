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

/**
 * AUTO-FUNCTION-COMMENT: roleBadgeClass
 * Purpose: Handles role badge class.
 * Line-by-line:
 * 1. Executes `switch (role) {`.
 * 2. Executes `case "superadmin":`.
 * 3. Executes `return "bg-amber-100 text-amber-800 border-amber-200";`.
 * 4. Executes `case "admin":`.
 * 5. Executes `return "bg-blue-100 text-blue-800 border-blue-200";`.
 * 6. Executes `case "barber":`.
 * 7. Executes `return "bg-emerald-100 text-emerald-800 border-emerald-200";`.
 * 8. Executes `case "client":`.
 * 9. Executes `return "bg-gray-100 text-gray-700 border-gray-200";`.
 * 10. Executes `default:`.
 * 11. Executes `return "bg-gray-100 text-gray-500 border-gray-200";`.
 * 12. Executes `}`.
 */
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

/**
 * AUTO-FUNCTION-COMMENT: shortDate
 * Purpose: Handles short date.
 * Line-by-line:
 * 1. Executes `if (!value) return "-";`.
 * 2. Executes `return new Date(value).toLocaleString();`.
 */
function shortDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

/**
 * AUTO-FUNCTION-COMMENT: AdminManagementDashboard
 * Purpose: Handles admin management dashboard.
 * Line-by-line:
 * 1. Executes `const { data: session, status } = useSession();`.
 * 2. Executes `const [dashboard, setDashboard] = useState<DashboardStatsResponse | null>(null);`.
 * 3. Executes `const [users, setUsers] = useState<ManagedUser[]>([]);`.
 * 4. Executes `const [statsLoading, setStatsLoading] = useState(false);`.
 * 5. Executes `const [usersLoading, setUsersLoading] = useState(false);`.
 * 6. Executes `const [savingUserId, setSavingUserId] = useState<string | null>(null);`.
 * 7. Executes `const [error, setError] = useState<string | null>(null);`.
 * 8. Executes `const [notice, setNotice] = useState<string | null>(null);`.
 * 9. Executes `const [search, setSearch] = useState("");`.
 * 10. Executes `const [roleFilter, setRoleFilter] = useState("");`.
 * 11. Executes `const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});`.
 * 12. Executes `const sessionRole = session?.user?.role || null;`.
 * 13. Executes `const allowedRoles =`.
 * 14. Executes `mode === "superadmin" ? ["superadmin"] : ["admin", "superadmin"];`.
 * 15. Executes `const canAccess = sessionRole ? allowedRoles.includes(sessionRole) : false;`.
 * 16. Executes `const title = mode === "superadmin" ? "Superadmin Dashboard" : "Admin Dashboard";`.
 * 17. Executes `const subtitle =`.
 * 18. Executes `mode === "superadmin"`.
 * 19. Executes `? "Move users across roles and monitor platform activity"`.
 * 20. Executes `: "Manage platform activity, bookings, and barber subscriptions";`.
 * 21. Executes `const loadDashboard = useCallback(async () => {`.
 * 22. Executes `setStatsLoading(true);`.
 * 23. Executes `try {`.
 * 24. Executes `const res = await fetch("/api/admin/dashboard", { cache: "no-store" });`.
 * 25. Executes `const json = (await res.json()) as DashboardStatsResponse & { error?: string };`.
 * 26. Executes `if (!res.ok) throw new Error(json.error || "Failed to load dashboard");`.
 * 27. Executes `setDashboard(json);`.
 * 28. Executes `} catch (err) {`.
 * 29. Executes `setError(err instanceof Error ? err.message : "Failed to load dashboard");`.
 * 30. Executes `} finally {`.
 * 31. Executes `setStatsLoading(false);`.
 * 32. Executes `}`.
 * 33. Executes `}, []);`.
 * 34. Executes `const loadUsers = useCallback(async () => {`.
 * 35. Executes `setUsersLoading(true);`.
 * 36. Executes `try {`.
 * 37. Executes `const query = new URLSearchParams();`.
 * 38. Executes `if (search.trim()) query.set("search", search.trim());`.
 * 39. Executes `if (roleFilter) query.set("role", roleFilter);`.
 * 40. Executes `query.set("limit", "100");`.
 * 41. Executes `const res = await fetch(\`/api/admin/users?${query.toString()}\`, {`.
 * 42. Executes `cache: "no-store",`.
 * 43. Executes `});`.
 * 44. Executes `const json = (await res.json()) as UsersResponse & { error?: string };`.
 * 45. Executes `if (!res.ok) throw new Error(json.error || "Failed to load users");`.
 * 46. Executes `setUsers(json.users ?? []);`.
 * 47. Executes `setMoveTargets((prev) => {`.
 * 48. Executes `const next = { ...prev };`.
 * 49. Executes `for (const user of json.users ?? []) {`.
 * 50. Executes `next[user._id] = next[user._id] || user.role || "client";`.
 * 51. Executes `}`.
 * 52. Executes `return next;`.
 * 53. Executes `});`.
 * 54. Executes `} catch (err) {`.
 * 55. Executes `setError(err instanceof Error ? err.message : "Failed to load users");`.
 * 56. Executes `} finally {`.
 * 57. Executes `setUsersLoading(false);`.
 * 58. Executes `}`.
 * 59. Executes `}, [search, roleFilter]);`.
 * 60. Executes `useEffect(() => {`.
 * 61. Executes `if (status !== "authenticated" || !canAccess) return;`.
 * 62. Executes `setError(null);`.
 * 63. Executes `void loadDashboard();`.
 * 64. Executes `void loadUsers();`.
 * 65. Executes `}, [status, canAccess, loadDashboard, loadUsers]);`.
 * 66. Executes `const cards = useMemo(() => {`.
 * 67. Executes `if (!dashboard) return [];`.
 * 68. Executes `return [`.
 * 69. Executes `{`.
 * 70. Executes `label: "Total Users",`.
 * 71. Executes `value: dashboard.stats.users.total.toLocaleString(),`.
 * 72. Executes `icon: Users,`.
 * 73. Executes `},`.
 * 74. Executes `{`.
 * 75. Executes `label: "Bookings",`.
 * 76. Executes `value: dashboard.stats.bookings.total.toLocaleString(),`.
 * 77. Executes `icon: CalendarDays,`.
 * 78. Executes `},`.
 * 79. Executes `{`.
 * 80. Executes `label: "Paid Bookings",`.
 * 81. Executes `value: dashboard.stats.bookings.paid.toLocaleString(),`.
 * 82. Executes `icon: ShieldCheck,`.
 * 83. Executes `},`.
 * 84. Executes `{`.
 * 85. Executes `label: "Revenue",`.
 * 86. Executes `value: formatNaira(dashboard.stats.transactions.revenue),`.
 * 87. Executes `icon: CreditCard,`.
 * 88. Executes `},`.
 * 89. Executes `{`.
 * 90. Executes `label: "Barbers",`.
 * 91. Executes `value: dashboard.stats.users.barbers.toLocaleString(),`.
 * 92. Executes `icon: Scissors,`.
 * 93. Executes `},`.
 * 94. Executes `{`.
 * 95. Executes `label: "Subscribed Barbers",`.
 * 96. Executes `value: dashboard.stats.profiles.subscribedBarbers.toLocaleString(),`.
 * 97. Executes `icon: Shield,`.
 * 98. Executes `},`.
 * 99. Executes `];`.
 * 100. Executes `}, [dashboard]);`.
 * 101. Executes `async function handleRoleUpdate(userId: string) {`.
 * 102. Executes `const nextRole = moveTargets[userId];`.
 * 103. Executes `if (!nextRole) return;`.
 * 104. Executes `setSavingUserId(userId);`.
 * 105. Executes `setNotice(null);`.
 * 106. Executes `setError(null);`.
 * 107. Executes `try {`.
 * 108. Executes `const res = await fetch(\`/api/admin/users/${userId}\`, {`.
 * 109. Executes `method: "PATCH",`.
 * 110. Executes `headers: { "Content-Type": "application/json" },`.
 * 111. Executes `body: JSON.stringify({ role: nextRole }),`.
 * 112. Executes `});`.
 * 113. Executes `const json = (await res.json()) as { error?: string; user?: ManagedUser };`.
 * 114. Executes `if (!res.ok) throw new Error(json.error || "Failed to update user role");`.
 * 115. Executes `setUsers((prev) =>`.
 * 116. Executes `prev.map((u) =>`.
 * 117. Executes `u._id === userId ? { ...u, role: json.user?.role ?? nextRole } : u`.
 * 118. Executes `)`.
 * 119. Executes `);`.
 * 120. Executes `setNotice("User role updated.");`.
 * 121. Executes `void loadDashboard();`.
 * 122. Executes `void loadUsers();`.
 * 123. Executes `} catch (err) {`.
 * 124. Executes `setError(err instanceof Error ? err.message : "Failed to update user role");`.
 * 125. Executes `} finally {`.
 * 126. Executes `setSavingUserId(null);`.
 * 127. Executes `}`.
 * 128. Executes `}`.
 * 129. Executes `if (status === "loading") {`.
 * 130. Executes `return <div className="min-h-screen bg-white p-6">Loading dashboard...</div>;`.
 * 131. Executes `}`.
 * 132. Executes `if (status !== "authenticated") {`.
 * 133. Executes `return <div className="min-h-screen bg-white p-6">Please sign in.</div>;`.
 * 134. Executes `}`.
 * 135. Executes `if (!canAccess) {`.
 * 136. Executes `return (`.
 * 137. Executes `<div className="min-h-screen bg-white p-6">`.
 * 138. Executes `<p className="text-red-600 font-medium">Forbidden</p>`.
 * 139. Executes `<p className="text-sm text-gray-500 mt-2">`.
 * 140. Executes `You do not have permission to view this dashboard.`.
 * 141. Executes `</p>`.
 * 142. Executes `</div>`.
 * 143. Executes `);`.
 * 144. Executes `}`.
 * 145. Executes `return (`.
 * 146. Executes `<div className="min-h-screen bg-[#faf7f2] text-[#1f1a16]">`.
 * 147. Executes `<PageHeader`.
 * 148. Executes `title={title}`.
 * 149. Executes `titleClassName="text-base md:text-lg"`.
 * 150. Executes `left={<div className="w-6" />}`.
 * 151. Executes `right={<LogoutButton />}`.
 * 152. Executes `className="border-b border-[#ece4da]"`.
 * 153. Executes `/>`.
 * 154. Executes `<main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">`.
 * 155. Executes `<section className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm">`.
 * 156. Executes `<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">`.
 * 157. Executes `<div>`.
 * 158. Executes `<h2 className="text-xl font-bold">{title}</h2>`.
 * 159. Executes `<p className="text-sm text-[#75624e] mt-1">{subtitle}</p>`.
 * 160. Executes `<p className="text-xs text-[#8b7b68] mt-2">`.
 * 161. Executes `Signed in as {session.user?.email || "Unknown user"} ({sessionRole})`.
 * 162. Executes `</p>`.
 * 163. Executes `</div>`.
 * 164. Executes `<div className="flex flex-wrap gap-2">`.
 * 165. Executes `<Link`.
 * 166. Executes `href="/dashboard/admin/subscriptions"`.
 * 167. Executes `className="inline-flex items-center rounded-lg border border-[#e3d4bf] px-3 py-2 text-sm font-medium hover:bg-[#faf4ea]"`.
 * 168. Executes `>`.
 * 169. Executes `Barber Subscriptions`.
 * 170. Executes `</Link>`.
 * 171. Executes `<Link`.
 * 172. Executes `href="/bookings"`.
 * 173. Executes `className="inline-flex items-center rounded-lg border border-[#e3d4bf] px-3 py-2 text-sm font-medium hover:bg-[#faf4ea]"`.
 * 174. Executes `>`.
 * 175. Executes `Bookings`.
 * 176. Executes `</Link>`.
 * 177. Executes `<Link`.
 * 178. Executes `href="/transactions"`.
 * 179. Executes `className="inline-flex items-center rounded-lg bg-[#f2800d] px-3 py-2 text-sm font-semibold text-white hover:bg-[#de760d]"`.
 * 180. Executes `>`.
 * 181. Executes `Transactions`.
 * 182. Executes `</Link>`.
 * 183. Executes `</div>`.
 * 184. Executes `</div>`.
 * 185. Executes `</section>`.
 * 186. Executes `{error && (`.
 * 187. Executes `<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">`.
 * 188. Executes `{error}`.
 * 189. Executes `</div>`.
 * 190. Executes `)}`.
 * 191. Executes `{notice && (`.
 * 192. Executes `<div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">`.
 * 193. Executes `{notice}`.
 * 194. Executes `</div>`.
 * 195. Executes `)}`.
 * 196. Executes `<section className="space-y-3">`.
 * 197. Executes `<div className="flex items-center justify-between">`.
 * 198. Executes `<h3 className="text-lg font-semibold">Overview</h3>`.
 * 199. Executes `<button`.
 * 200. Executes `onClick={() => {`.
 * 201. Executes `setError(null);`.
 * 202. Executes `void loadDashboard();`.
 * 203. Executes `void loadUsers();`.
 * 204. Executes `}}`.
 * 205. Executes `className="rounded-lg border border-[#e3d4bf] bg-white px-3 py-2 text-sm font-medium hover:bg-[#faf4ea]"`.
 * 206. Executes `disabled={statsLoading || usersLoading}`.
 * 207. Executes `>`.
 * 208. Executes `Refresh`.
 * 209. Executes `</button>`.
 * 210. Executes `</div>`.
 * 211. Executes `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">`.
 * 212. Executes `{cards.map((card) => {`.
 * 213. Executes `const Icon = card.icon;`.
 * 214. Executes `return (`.
 * 215. Executes `<div`.
 * 216. Executes `key={card.label}`.
 * 217. Executes `className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm"`.
 * 218. Executes `>`.
 * 219. Executes `<div className="flex items-center justify-between">`.
 * 220. Executes `<p className="text-sm text-[#6f5c48]">{card.label}</p>`.
 * 221. Executes `<Icon className="h-4 w-4 text-[#f2800d]" />`.
 * 222. Executes `</div>`.
 * 223. Executes `<p className="mt-2 text-2xl font-bold text-[#1f1a16]">`.
 * 224. Executes `{statsLoading ? "..." : card.value}`.
 * 225. Executes `</p>`.
 * 226. Executes `</div>`.
 * 227. Executes `);`.
 * 228. Executes `})}`.
 * 229. Executes `</div>`.
 * 230. Executes `{dashboard && (`.
 * 231. Executes `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">`.
 * 232. Executes `<div className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">`.
 * 233. Executes `<h4 className="font-semibold mb-3">Users Breakdown</h4>`.
 * 234. Executes `<div className="grid grid-cols-2 gap-3 text-sm">`.
 * 235. Executes `<div className="rounded-lg bg-[#faf7f2] p-3">`.
 * 236. Executes `Clients: {dashboard.stats.users.clients}`.
 * 237. Executes `</div>`.
 * 238. Executes `<div className="rounded-lg bg-[#faf7f2] p-3">`.
 * 239. Executes `Barbers: {dashboard.stats.users.barbers}`.
 * 240. Executes `</div>`.
 * 241. Executes `<div className="rounded-lg bg-[#faf7f2] p-3">`.
 * 242. Executes `Admins: {dashboard.stats.users.admins}`.
 * 243. Executes `</div>`.
 * 244. Executes `<div className="rounded-lg bg-[#faf7f2] p-3">`.
 * 245. Executes `Superadmins: {dashboard.stats.users.superadmins}`.
 * 246. Executes `</div>`.
 * 247. Executes `</div>`.
 * 248. Executes `</div>`.
 * 249. Executes `<div className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">`.
 * 250. Executes `<h4 className="font-semibold mb-3">Bookings / Payments</h4>`.
 * 251. Executes `<div className="grid grid-cols-2 gap-3 text-sm">`.
 * 252. Executes `<div className="rounded-lg bg-[#faf7f2] p-3">`.
 * 253. Executes `Pending: {dashboard.stats.bookings.pending}`.
 * 254. Executes `</div>`.
 * 255. Executes `<div className="rounded-lg bg-[#faf7f2] p-3">`.
 * 256. Executes `Confirmed: {dashboard.stats.bookings.confirmed}`.
 * 257. Executes `</div>`.
 * 258. Executes `<div className="rounded-lg bg-[#faf7f2] p-3">`.
 * 259. Executes `Completed: {dashboard.stats.bookings.completed}`.
 * 260. Executes `</div>`.
 * 261. Executes `<div className="rounded-lg bg-[#faf7f2] p-3">`.
 * 262. Executes `Unpaid: {dashboard.stats.bookings.unpaid}`.
 * 263. Executes `</div>`.
 * 264. Executes `</div>`.
 * 265. Executes `</div>`.
 * 266. Executes `</div>`.
 * 267. Executes `)}`.
 * 268. Executes `</section>`.
 * 269. Executes `<section className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">`.
 * 270. Executes `<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">`.
 * 271. Executes `<div>`.
 * 272. Executes `<h3 className="text-lg font-semibold">`.
 * 273. Executes `{mode === "superadmin" ? "Move Users (Role Management)" : "User Management"}`.
 * 274. Executes `</h3>`.
 * 275. Executes `<p className="text-sm text-[#75624e]">`.
 * 276. Executes `{mode === "superadmin"`.
 * 277. Executes `? "Move any user between client, barber, admin, and superadmin roles."`.
 * 278. Executes `: "Move users between client and barber roles. Admin-level accounts require superadmin."}`.
 * 279. Executes `</p>`.
 * 280. Executes `</div>`.
 * 281. Executes `<form`.
 * 282. Executes `className="flex flex-col sm:flex-row gap-2"`.
 * 283. Executes `onSubmit={(e) => {`.
 * 284. Executes `e.preventDefault();`.
 * 285. Executes `void loadUsers();`.
 * 286. Executes `}}`.
 * 287. Executes `>`.
 * 288. Executes `<input`.
 * 289. Executes `value={search}`.
 * 290. Executes `onChange={(e) => setSearch(e.target.value)}`.
 * 291. Executes `placeholder="Search name or email"`.
 * 292. Executes `className="h-10 rounded-lg border border-[#e3d4bf] px-3 text-sm outline-none focus:ring-2 focus:ring-[#f3c080]"`.
 * 293. Executes `/>`.
 * 294. Executes `<select`.
 * 295. Executes `value={roleFilter}`.
 * 296. Executes `onChange={(e) => setRoleFilter(e.target.value)}`.
 * 297. Executes `className="h-10 rounded-lg border border-[#e3d4bf] px-3 text-sm bg-white"`.
 * 298. Executes `>`.
 * 299. Executes `<option value="">All roles</option>`.
 * 300. Executes `<option value="client">Client</option>`.
 * 301. Executes `<option value="barber">Barber</option>`.
 * 302. Executes `<option value="admin">Admin</option>`.
 * 303. Executes `<option value="superadmin">Superadmin</option>`.
 * 304. Executes `</select>`.
 * 305. Executes `<button`.
 * 306. Executes `type="submit"`.
 * 307. Executes `className="h-10 rounded-lg bg-[#f2800d] px-4 text-sm font-semibold text-white"`.
 * 308. Executes `>`.
 * 309. Executes `Apply`.
 * 310. Executes `</button>`.
 * 311. Executes `</form>`.
 * 312. Executes `</div>`.
 * 313. Executes `<div className="mt-4 space-y-3">`.
 * 314. Executes `{usersLoading && <p className="text-sm text-[#75624e]">Loading users...</p>}`.
 * 315. Executes `{!usersLoading && users.length === 0 && (`.
 * 316. Executes `<p className="text-sm text-[#75624e]">No users found.</p>`.
 * 317. Executes `)}`.
 * 318. Executes `{users.map((item) => {`.
 * 319. Executes `const isProtectedAdminAccount =`.
 * 320. Executes `mode !== "superadmin" &&`.
 * 321. Executes `(item.role === "admin" || item.role === "superadmin");`.
 * 322. Executes `const options = roleOptionsByMode[mode];`.
 * 323. Executes `return (`.
 * 324. Executes `<div`.
 * 325. Executes `key={item._id}`.
 * 326. Executes `className="rounded-xl border border-[#eee4d6] bg-[#fffdf9] p-3"`.
 * 327. Executes `>`.
 * 328. Executes `<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">`.
 * 329. Executes `<div className="min-w-0">`.
 * 330. Executes `<div className="flex flex-wrap items-center gap-2">`.
 * 331. Executes `<p className="font-semibold break-all">`.
 * 332. Executes `{item.name || item.email || "Unnamed user"}`.
 * 333. Executes `</p>`.
 * 334. Executes `<span`.
 * 335. Executes `className={\`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${roleBadgeClass(`.
 * 336. Executes `item.role`.
 * 337. Executes `)}\`}`.
 * 338. Executes `>`.
 * 339. Executes `{item.role || "no role"}`.
 * 340. Executes `</span>`.
 * 341. Executes `{item.hasBarberProfile && (`.
 * 342. Executes `<span className="text-xs rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">`.
 * 343. Executes `Barber profile`.
 * 344. Executes `</span>`.
 * 345. Executes `)}`.
 * 346. Executes `{item.hasClientProfile && (`.
 * 347. Executes `<span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">`.
 * 348. Executes `Client profile`.
 * 349. Executes `</span>`.
 * 350. Executes `)}`.
 * 351. Executes `{item.barberSubscribed === true && (`.
 * 352. Executes `<span className="text-xs rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">`.
 * 353. Executes `Subscribed barber`.
 * 354. Executes `</span>`.
 * 355. Executes `)}`.
 * 356. Executes `</div>`.
 * 357. Executes `<p className="text-sm text-[#75624e] break-all mt-1">`.
 * 358. Executes `{item.email || "No email"}`.
 * 359. Executes `</p>`.
 * 360. Executes `</div>`.
 * 361. Executes `<div className="flex flex-col sm:flex-row gap-2 sm:items-center">`.
 * 362. Executes `<select`.
 * 363. Executes `value={moveTargets[item._id] || item.role || "client"}`.
 * 364. Executes `onChange={(e) =>`.
 * 365. Executes `setMoveTargets((prev) => ({`.
 * 366. Executes `...prev,`.
 * 367. Executes `[item._id]: e.target.value,`.
 * 368. Executes `}))`.
 * 369. Executes `}`.
 * 370. Executes `disabled={isProtectedAdminAccount || savingUserId === item._id}`.
 * 371. Executes `className="h-10 rounded-lg border border-[#e3d4bf] px-3 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"`.
 * 372. Executes `>`.
 * 373. Executes `{options.map((roleOption) => (`.
 * 374. Executes `<option key={roleOption} value={roleOption}>`.
 * 375. Executes `{roleOption}`.
 * 376. Executes `</option>`.
 * 377. Executes `))}`.
 * 378. Executes `</select>`.
 * 379. Executes `<button`.
 * 380. Executes `onClick={() => void handleRoleUpdate(item._id)}`.
 * 381. Executes `disabled={`.
 * 382. Executes `isProtectedAdminAccount ||`.
 * 383. Executes `savingUserId === item._id ||`.
 * 384. Executes `(moveTargets[item._id] || item.role || "") === (item.role || "")`.
 * 385. Executes `}`.
 * 386. Executes `className="h-10 rounded-lg bg-[#1f1a16] px-4 text-sm font-semibold text-white disabled:bg-[#b7aaa0]"`.
 * 387. Executes `>`.
 * 388. Executes `{savingUserId === item._id ? "Saving..." : "Move"}`.
 * 389. Executes `</button>`.
 * 390. Executes `</div>`.
 * 391. Executes `</div>`.
 * 392. Executes `{isProtectedAdminAccount && (`.
 * 393. Executes `<p className="mt-2 text-xs text-[#9b6b00]">`.
 * 394. Executes `Only superadmin can modify admin or superadmin accounts.`.
 * 395. Executes `</p>`.
 * 396. Executes `)}`.
 * 397. Executes `</div>`.
 * 398. Executes `);`.
 * 399. Executes `})}`.
 * 400. Executes `</div>`.
 * 401. Executes `</section>`.
 * 402. Executes `<section className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-8">`.
 * 403. Executes `<div className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">`.
 * 404. Executes `<h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>`.
 * 405. Executes `<div className="space-y-2">`.
 * 406. Executes `{(dashboard?.recent.bookings ?? []).map((booking) => {`.
 * 407. Executes `const barberName =`.
 * 408. Executes `booking.barberId?.userId?.name ||`.
 * 409. Executes `booking.barberId?.userId?.email ||`.
 * 410. Executes `"Barber";`.
 * 411. Executes `const clientName =`.
 * 412. Executes `booking.clientId?.name || booking.clientId?.email || "Client";`.
 * 413. Executes `return (`.
 * 414. Executes `<div`.
 * 415. Executes `key={booking._id}`.
 * 416. Executes `className="rounded-lg border border-[#eee4d6] p-3 text-sm"`.
 * 417. Executes `>`.
 * 418. Executes `<div className="flex items-center justify-between gap-2">`.
 * 419. Executes `<p className="font-medium truncate">`.
 * 420. Executes `{booking.service || "Booking"}`.
 * 421. Executes `</p>`.
 * 422. Executes `<Link`.
 * 423. Executes `href={\`/bookings/${booking._id}\`}`.
 * 424. Executes `className="text-[#f2800d] font-medium"`.
 * 425. Executes `>`.
 * 426. Executes `Open`.
 * 427. Executes `</Link>`.
 * 428. Executes `</div>`.
 * 429. Executes `<p className="text-[#75624e] mt-1">`.
 * 430. Executes `{clientName} {"->"} {barberName}`.
 * 431. Executes `</p>`.
 * 432. Executes `<p className="text-[#75624e] mt-1">`.
 * 433. Executes `{shortDate(booking.dateTime || booking.createdAt)} |{" "}`.
 * 434. Executes `{booking.status || "pending"} | {booking.paymentStatus || "pending"}`.
 * 435. Executes `</p>`.
 * 436. Executes `</div>`.
 * 437. Executes `);`.
 * 438. Executes `})}`.
 * 439. Executes `{!dashboard?.recent.bookings?.length && (`.
 * 440. Executes `<p className="text-sm text-[#75624e]">No recent bookings.</p>`.
 * 441. Executes `)}`.
 * 442. Executes `</div>`.
 * 443. Executes `</div>`.
 * 444. Executes `<div className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">`.
 * 445. Executes `<h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>`.
 * 446. Executes `<div className="space-y-2">`.
 * 447. Executes `{(dashboard?.recent.transactions ?? []).map((tx) => (`.
 * 448. Executes `<div`.
 * 449. Executes `key={tx._id}`.
 * 450. Executes `className="rounded-lg border border-[#eee4d6] p-3 text-sm"`.
 * 451. Executes `>`.
 * 452. Executes `<div className="flex items-center justify-between gap-2">`.
 * 453. Executes `<p className="font-medium">{formatNaira(tx.amount ?? 0)}</p>`.
 * 454. Executes `<span`.
 * 455. Executes `className={\`rounded-full px-2 py-0.5 text-xs font-medium ${`.
 * 456. Executes `tx.status === "success"`.
 * 457. Executes `? "bg-green-100 text-green-700"`.
 * 458. Executes `: tx.status === "failed"`.
 * 459. Executes `? "bg-red-100 text-red-700"`.
 * 460. Executes `: "bg-gray-100 text-gray-700"`.
 * 461. Executes `}\`}`.
 * 462. Executes `>`.
 * 463. Executes `{tx.status || "pending"}`.
 * 464. Executes `</span>`.
 * 465. Executes `</div>`.
 * 466. Executes `<p className="text-[#75624e] mt-1">`.
 * 467. Executes `{tx.userId?.name || tx.userId?.email || "User"}`.
 * 468. Executes `</p>`.
 * 469. Executes `<p className="text-[#75624e] mt-1 break-all">`.
 * 470. Executes `Ref: {tx.reference || "-"}`.
 * 471. Executes `</p>`.
 * 472. Executes `<p className="text-[#75624e] mt-1">`.
 * 473. Executes `{shortDate(tx.createdAt)}`.
 * 474. Executes `{tx.bookingId?._id ? (`.
 * 475. Executes `<>`.
 * 476. Executes `{" "}`.
 * 477. Executes `|{" "}`.
 * 478. Executes `<Link`.
 * 479. Executes `href={\`/bookings/${tx.bookingId._id}\`}`.
 * 480. Executes `className="text-[#f2800d] font-medium"`.
 * 481. Executes `>`.
 * 482. Executes `{tx.bookingId.service || "Booking"}`.
 * 483. Executes `</Link>`.
 * 484. Executes `</>`.
 * 485. Executes `) : null}`.
 * 486. Executes `</p>`.
 * 487. Executes `</div>`.
 * 488. Executes `))}`.
 * 489. Executes `{!dashboard?.recent.transactions?.length && (`.
 * 490. Executes `<p className="text-sm text-[#75624e]">No recent transactions.</p>`.
 * 491. Executes `)}`.
 * 492. Executes `</div>`.
 * 493. Executes `</div>`.
 * 494. Executes `</section>`.
 * 495. Executes `</main>`.
 * 496. Executes `</div>`.
 * 497. Executes `);`.
 */
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

  /**
   * AUTO-FUNCTION-COMMENT: handleRoleUpdate
   * Purpose: Handles handle role update.
   * Line-by-line:
   * 1. Executes `const nextRole = moveTargets[userId];`.
   * 2. Executes `if (!nextRole) return;`.
   * 3. Executes `setSavingUserId(userId);`.
   * 4. Executes `setNotice(null);`.
   * 5. Executes `setError(null);`.
   * 6. Executes `try {`.
   * 7. Executes `const res = await fetch(\`/api/admin/users/${userId}\`, {`.
   * 8. Executes `method: "PATCH",`.
   * 9. Executes `headers: { "Content-Type": "application/json" },`.
   * 10. Executes `body: JSON.stringify({ role: nextRole }),`.
   * 11. Executes `});`.
   * 12. Executes `const json = (await res.json()) as { error?: string; user?: ManagedUser };`.
   * 13. Executes `if (!res.ok) throw new Error(json.error || "Failed to update user role");`.
   * 14. Executes `setUsers((prev) =>`.
   * 15. Executes `prev.map((u) =>`.
   * 16. Executes `u._id === userId ? { ...u, role: json.user?.role ?? nextRole } : u`.
   * 17. Executes `)`.
   * 18. Executes `);`.
   * 19. Executes `setNotice("User role updated.");`.
   * 20. Executes `void loadDashboard();`.
   * 21. Executes `void loadUsers();`.
   * 22. Executes `} catch (err) {`.
   * 23. Executes `setError(err instanceof Error ? err.message : "Failed to update user role");`.
   * 24. Executes `} finally {`.
   * 25. Executes `setSavingUserId(null);`.
   * 26. Executes `}`.
   */
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
