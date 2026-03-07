"use client";

import axios from "axios";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

type ServiceItem = {
  _id: string;
  name: string;
  price: number;
  durationMinutes?: number;
};

type BarberListItem = {
  _id: string;
  name: string;
  address?: string;
  state?: string;
  country?: string;
  avatar?: string;
  serviceCount?: number;
  services?: ServiceItem[];
};

/**
 * AUTO-FUNCTION-COMMENT: ClientBookingFormContent
 * Purpose: Handles client booking form content.
 * Line-by-line:
 * 1. Executes `const { data: session } = useSession();`.
 * 2. Executes `const router = useRouter();`.
 * 3. Executes `const searchParams = useSearchParams();`.
 * 4. Executes `const barberFromQuery = searchParams?.get("barberId") ?? "";`.
 * 5. Executes `type CreateBookingResponse = {`.
 * 6. Executes `booking?: {`.
 * 7. Executes `_id?: string;`.
 * 8. Executes `};`.
 * 9. Executes `error?: string;`.
 * 10. Executes `};`.
 * 11. Executes `const [loading, setLoading] = useState(false);`.
 * 12. Executes `const [barbers, setBarbers] = useState<BarberListItem[]>([]);`.
 * 13. Executes `const [barberId, setBarberId] = useState(barberFromQuery);`.
 * 14. Executes `const [services, setServices] = useState<ServiceItem[]>([]);`.
 * 15. Executes `const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);`.
 * 16. Executes `const [form, setForm] = useState({`.
 * 17. Executes `name: "",`.
 * 18. Executes `email: "",`.
 * 19. Executes `address: "",`.
 * 20. Executes `dateTime: "",`.
 * 21. Executes `note: "",`.
 * 22. Executes `});`.
 * 23. Executes `const [step, setStep] = useState(1);`.
 * 24. Executes `const selectedBarber = useMemo(`.
 * 25. Executes `() => barbers.find((barber) => barber._id === barberId) ?? null,`.
 * 26. Executes `[barberId, barbers]`.
 * 27. Executes `);`.
 * 28. Executes `const selectedServices = useMemo(`.
 * 29. Executes `() =>`.
 * 30. Executes `selectedServiceIds`.
 * 31. Executes `.map((id) => services.find((service) => service._id === id))`.
 * 32. Executes `.filter((service): service is ServiceItem => Boolean(service)),`.
 * 33. Executes `[selectedServiceIds, services]`.
 * 34. Executes `);`.
 * 35. Executes `const estimatedPrice = useMemo(`.
 * 36. Executes `() => selectedServices.reduce((sum, service) => sum + (service.price || 0), 0),`.
 * 37. Executes `[selectedServices]`.
 * 38. Executes `);`.
 * 39. Executes `useEffect(() => {`.
 * 40. Executes `const loadBarbers = async () => {`.
 * 41. Executes `const res = await fetch("/api/barbers");`.
 * 42. Executes `const json = await res.json().catch(() => ({}));`.
 * 43. Executes `if (res.ok) {`.
 * 44. Executes `setBarbers(Array.isArray(json.barbers) ? json.barbers : []);`.
 * 45. Executes `}`.
 * 46. Executes `};`.
 * 47. Executes `loadBarbers();`.
 * 48. Executes `}, []);`.
 * 49. Executes `useEffect(() => {`.
 * 50. Executes `setForm((previous) => ({`.
 * 51. Executes `...previous,`.
 * 52. Executes `name: previous.name || session?.user?.name || "",`.
 * 53. Executes `email: previous.email || session?.user?.email || "",`.
 * 54. Executes `}));`.
 * 55. Executes `}, [session?.user?.email, session?.user?.name]);`.
 * 56. Executes `useEffect(() => {`.
 * 57. Executes `setSelectedServiceIds([]);`.
 * 58. Executes `if (!barberId) {`.
 * 59. Executes `setServices([]);`.
 * 60. Executes `return;`.
 * 61. Executes `}`.
 * 62. Executes `const loadServices = async () => {`.
 * 63. Executes `const res = await fetch(\`/api/services?barberId=${barberId}\`);`.
 * 64. Executes `const json = await res.json().catch(() => ({}));`.
 * 65. Executes `if (res.ok) {`.
 * 66. Executes `setServices(Array.isArray(json.services) ? json.services : []);`.
 * 67. Executes `} else {`.
 * 68. Executes `setServices([]);`.
 * 69. Executes `}`.
 * 70. Executes `};`.
 * 71. Executes `loadServices();`.
 * 72. Executes `}, [barberId]);`.
 * 73. Executes `const handleChange = (`.
 * 74. Executes `e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>`.
 * 75. Executes `) => {`.
 * 76. Executes `setForm({ ...form, [e.target.name]: e.target.value });`.
 * 77. Executes `};`.
 * 78. Executes `const handleSubmit = async (e: React.FormEvent) => {`.
 * 79. Executes `e.preventDefault();`.
 * 80. Executes `setLoading(true);`.
 * 81. Executes `try {`.
 * 82. Executes `const res = await axios.post<CreateBookingResponse>("/api/bookings", {`.
 * 83. Executes `...form,`.
 * 84. Executes `clientEmail: session?.user?.email,`.
 * 85. Executes `barberId,`.
 * 86. Executes `serviceIds: selectedServiceIds,`.
 * 87. Executes `});`.
 * 88. Executes `const booking = res.data?.booking;`.
 * 89. Executes `if (booking?._id) {`.
 * 90. Executes `router.push(\`/checkout/${booking._id}\`);`.
 * 91. Executes `}`.
 * 92. Executes `setForm({ name: "", email: "", address: "", dateTime: "", note: "" });`.
 * 93. Executes `setSelectedServiceIds([]);`.
 * 94. Executes `} catch (error: unknown) {`.
 * 95. Executes `const responseError =`.
 * 96. Executes `typeof error === "object" &&`.
 * 97. Executes `error !== null &&`.
 * 98. Executes `"response" in error &&`.
 * 99. Executes `typeof error.response === "object" &&`.
 * 100. Executes `error.response !== null &&`.
 * 101. Executes `"data" in error.response &&`.
 * 102. Executes `typeof error.response.data === "object" &&`.
 * 103. Executes `error.response.data !== null &&`.
 * 104. Executes `"error" in error.response.data &&`.
 * 105. Executes `typeof error.response.data.error === "string"`.
 * 106. Executes `? error.response.data.error`.
 * 107. Executes `: null;`.
 * 108. Executes `const message =`.
 * 109. Executes `responseError || (error instanceof Error ? error.message : "Booking failed");`.
 * 110. Executes `alert(message);`.
 * 111. Executes `} finally {`.
 * 112. Executes `setLoading(false);`.
 * 113. Executes `}`.
 * 114. Executes `};`.
 * 115. Executes `const handleToggleService = (serviceId: string) => {`.
 * 116. Executes `setSelectedServiceIds((previous) =>`.
 * 117. Executes `previous.includes(serviceId)`.
 * 118. Executes `? previous.filter((id) => id !== serviceId)`.
 * 119. Executes `: [...previous, serviceId]`.
 * 120. Executes `);`.
 * 121. Executes `};`.
 * 122. Executes `const canGoNext =`.
 * 123. Executes `(step === 1 && Boolean(barberId)) ||`.
 * 124. Executes `(step === 2 &&`.
 * 125. Executes `form.name.trim() &&`.
 * 126. Executes `form.email.trim() &&`.
 * 127. Executes `form.dateTime.trim()) ||`.
 * 128. Executes `(step === 3 && selectedServiceIds.length > 0);`.
 * 129. Executes `return (`.
 * 130. Executes `<div className="min-h-screen bg-white flex flex-col justify-between">`.
 * 131. Executes `<div>`.
 * 132. Executes `<div className="flex items-center bg-white p-4 pb-2 justify-between">`.
 * 133. Executes `<h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">`.
 * 134. Executes `Book Appointment`.
 * 135. Executes `</h2>`.
 * 136. Executes `</div>`.
 * 137. Executes `<div className="flex justify-center gap-3 py-5">`.
 * 138. Executes `<div`.
 * 139. Executes `className={\`h-2 w-2 rounded-full ${step >= 1 ? "bg-[#181411]" : "bg-[#e6e0db]"}\`}`.
 * 140. Executes `/>`.
 * 141. Executes `<div`.
 * 142. Executes `className={\`h-2 w-2 rounded-full ${step >= 2 ? "bg-[#181411]" : "bg-[#e6e0db]"}\`}`.
 * 143. Executes `/>`.
 * 144. Executes `<div`.
 * 145. Executes `className={\`h-2 w-2 rounded-full ${step >= 3 ? "bg-[#181411]" : "bg-[#e6e0db]"}\`}`.
 * 146. Executes `/>`.
 * 147. Executes `</div>`.
 * 148. Executes `{!barberId && step === 1 && (`.
 * 149. Executes `<p className="px-4 text-sm text-red-600">`.
 * 150. Executes `Please pick a barber before booking.`.
 * 151. Executes `</p>`.
 * 152. Executes `)}`.
 * 153. Executes `<form onSubmit={handleSubmit} className="max-w-[480px] mx-auto">`.
 * 154. Executes `{step === 1 && (`.
 * 155. Executes `<div className="px-4 py-3 space-y-3">`.
 * 156. Executes `<p className="text-[#181411] text-base font-medium pb-1">`.
 * 157. Executes `Select Barber`.
 * 158. Executes `</p>`.
 * 159. Executes `{barbers.length === 0 && (`.
 * 160. Executes `<div className="rounded-xl border border-dashed border-[#e6e0db] p-4 text-sm text-[#8a7560]">`.
 * 161. Executes `No barbers are available yet.`.
 * 162. Executes `</div>`.
 * 163. Executes `)}`.
 * 164. Executes `<div className="grid grid-cols-2 gap-3">`.
 * 165. Executes `{barbers.map((barber) => (`.
 * 166. Executes `<button`.
 * 167. Executes `key={barber._id}`.
 * 168. Executes `type="button"`.
 * 169. Executes `onClick={() => setBarberId(barber._id)}`.
 * 170. Executes `className={\`rounded-xl border p-3 text-left ${`.
 * 171. Executes `barberId === barber._id`.
 * 172. Executes `? "border-[#f2800d] bg-[#fff4ea]"`.
 * 173. Executes `: "border-[#eee]"`.
 * 174. Executes `}\`}`.
 * 175. Executes `>`.
 * 176. Executes `<div className="h-20 w-full overflow-hidden rounded-lg bg-[#f5f2f0]">`.
 * 177. Executes `<img`.
 * 178. Executes `src={barber.avatar || "/avatar.svg"}`.
 * 179. Executes `alt={barber.name || "Barber"}`.
 * 180. Executes `className="h-full w-full object-cover"`.
 * 181. Executes `/>`.
 * 182. Executes `</div>`.
 * 183. Executes `<p className="pt-2 text-sm font-semibold text-[#181411]">`.
 * 184. Executes `{barber.name || "Barber"}`.
 * 185. Executes `</p>`.
 * 186. Executes `<p className="text-xs text-[#8a7560]">`.
 * 187. Executes `{barber.address ||`.
 * 188. Executes `[barber.state, barber.country].filter(Boolean).join(", ")}`.
 * 189. Executes `</p>`.
 * 190. Executes `<p className="pt-1 text-xs text-[#8a7560]">`.
 * 191. Executes `{barber.serviceCount ?? barber.services?.length ?? 0} services`.
 * 192. Executes `</p>`.
 * 193. Executes `</button>`.
 * 194. Executes `))}`.
 * 195. Executes `</div>`.
 * 196. Executes `</div>`.
 * 197. Executes `)}`.
 * 198. Executes `{step === 2 && (`.
 * 199. Executes `<>`.
 * 200. Executes `{(["name", "email", "address"] as const).map((field) => (`.
 * 201. Executes `<div key={field} className="px-4 py-3">`.
 * 202. Executes `<label className="flex flex-col min-w-40 flex-1">`.
 * 203. Executes `<p className="text-[#181411] text-base font-medium pb-2 capitalize">`.
 * 204. Executes `{field}`.
 * 205. Executes `</p>`.
 * 206. Executes `<input`.
 * 207. Executes `name={field}`.
 * 208. Executes `value={form[field]}`.
 * 209. Executes `onChange={handleChange}`.
 * 210. Executes `placeholder={\`Enter your ${field}\`}`.
 * 211. Executes `className="form-input w-full rounded-lg bg-[#f5f2f0] text-[#181411] p-4 h-14 placeholder:text-[#8a7560] focus:ring-0 focus:outline-0 bord...`.
 * 212. Executes `required={field !== "address"}`.
 * 213. Executes `/>`.
 * 214. Executes `</label>`.
 * 215. Executes `</div>`.
 * 216. Executes `))}`.
 * 217. Executes `<div className="px-4 py-3">`.
 * 218. Executes `<label className="flex flex-col">`.
 * 219. Executes `<p className="text-[#181411] text-base font-medium pb-2">`.
 * 220. Executes `Date and Time`.
 * 221. Executes `</p>`.
 * 222. Executes `<input`.
 * 223. Executes `type="datetime-local"`.
 * 224. Executes `name="dateTime"`.
 * 225. Executes `value={form.dateTime}`.
 * 226. Executes `onChange={handleChange}`.
 * 227. Executes `className="form-input w-full rounded-lg bg-[#f5f2f0] text-[#181411] p-4 h-14 focus:ring-0 border-none"`.
 * 228. Executes `required`.
 * 229. Executes `/>`.
 * 230. Executes `</label>`.
 * 231. Executes `</div>`.
 * 232. Executes `<div className="px-4 py-3">`.
 * 233. Executes `<label className="flex flex-col">`.
 * 234. Executes `<p className="text-[#181411] text-base font-medium pb-2">Note</p>`.
 * 235. Executes `<textarea`.
 * 236. Executes `name="note"`.
 * 237. Executes `value={form.note}`.
 * 238. Executes `onChange={handleChange}`.
 * 239. Executes `placeholder="Add a note (optional)"`.
 * 240. Executes `className="form-textarea w-full min-h-36 rounded-lg bg-[#f5f2f0] text-[#181411] p-4 placeholder:text-[#8a7560] focus:ring-0 border-none"`.
 * 241. Executes `/>`.
 * 242. Executes `</label>`.
 * 243. Executes `</div>`.
 * 244. Executes `</>`.
 * 245. Executes `)}`.
 * 246. Executes `{step === 3 && (`.
 * 247. Executes `<div className="px-4 py-6">`.
 * 248. Executes `<div className="rounded-2xl bg-[#3f4a57] p-6 text-white">`.
 * 249. Executes `<div className="flex items-center justify-between mb-4">`.
 * 250. Executes `<div>`.
 * 251. Executes `<h3 className="text-lg font-semibold">Select Services</h3>`.
 * 252. Executes `<p className="text-sm text-white/70">`.
 * 253. Executes `{selectedBarber?.name`.
 * 254. Executes `? \`Choose from ${selectedBarber.name}'s active services\``.
 * 255. Executes `: "Choose one or more services"}`.
 * 256. Executes `</p>`.
 * 257. Executes `</div>`.
 * 258. Executes `<button`.
 * 259. Executes `type="button"`.
 * 260. Executes `className="text-sm font-semibold text-white/80"`.
 * 261. Executes `onClick={() => setSelectedServiceIds([])}`.
 * 262. Executes `>`.
 * 263. Executes `Clear`.
 * 264. Executes `</button>`.
 * 265. Executes `</div>`.
 * 266. Executes `{services.length === 0 ? (`.
 * 267. Executes `<div className="rounded-xl border border-dashed border-white/30 p-4 text-sm text-white/80">`.
 * 268. Executes `This barber has not added any active services yet.`.
 * 269. Executes `</div>`.
 * 270. Executes `) : (`.
 * 271. Executes `<div className="mt-5 space-y-3">`.
 * 272. Executes `{services.map((service) => {`.
 * 273. Executes `const selected = selectedServiceIds.includes(service._id);`.
 * 274. Executes `return (`.
 * 275. Executes `<button`.
 * 276. Executes `key={service._id}`.
 * 277. Executes `type="button"`.
 * 278. Executes `onClick={() => handleToggleService(service._id)}`.
 * 279. Executes `className={\`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${`.
 * 280. Executes `selected`.
 * 281. Executes `? "border-white bg-white/10"`.
 * 282. Executes `: "border-white/25 hover:border-white/60"`.
 * 283. Executes `}\`}`.
 * 284. Executes `>`.
 * 285. Executes `<div>`.
 * 286. Executes `<p className="text-sm font-semibold">{service.name}</p>`.
 * 287. Executes `<p className="text-xs text-white/70">`.
 * 288. Executes `NGN {service.price} • {service.durationMinutes ?? 30} min`.
 * 289. Executes `</p>`.
 * 290. Executes `</div>`.
 * 291. Executes `<span className="text-xs font-semibold">`.
 * 292. Executes `{selected ? "Selected" : "Add"}`.
 * 293. Executes `</span>`.
 * 294. Executes `</button>`.
 * 295. Executes `);`.
 * 296. Executes `})}`.
 * 297. Executes `</div>`.
 * 298. Executes `)}`.
 * 299. Executes `{selectedServices.length > 0 && (`.
 * 300. Executes `<div className="mt-6 space-y-2">`.
 * 301. Executes `{selectedServices.map((service) => (`.
 * 302. Executes `<div`.
 * 303. Executes `key={service._id}`.
 * 304. Executes `className="flex items-center justify-between rounded-lg border border-white/30 px-3 py-2"`.
 * 305. Executes `>`.
 * 306. Executes `<div>`.
 * 307. Executes `<p className="text-sm font-medium">{service.name}</p>`.
 * 308. Executes `<p className="text-xs text-white/60">`.
 * 309. Executes `NGN {service.price} • {service.durationMinutes ?? 30} min`.
 * 310. Executes `</p>`.
 * 311. Executes `</div>`.
 * 312. Executes `<button`.
 * 313. Executes `type="button"`.
 * 314. Executes `onClick={() => handleToggleService(service._id)}`.
 * 315. Executes `className="text-sm font-bold text-white"`.
 * 316. Executes `>`.
 * 317. Executes `Remove`.
 * 318. Executes `</button>`.
 * 319. Executes `</div>`.
 * 320. Executes `))}`.
 * 321. Executes `</div>`.
 * 322. Executes `)}`.
 * 323. Executes `</div>`.
 * 324. Executes `<div className="mt-6">`.
 * 325. Executes `<div`.
 * 326. Executes `className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-lg pt-[132px]"`.
 * 327. Executes `style={{`.
 * 328. Executes `backgroundImage:`.
 * 329. Executes `"linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%), url('https://images.unsplash.com/photo-1595433562696-a8b4e3c5f4ef?a...`.
 * 330. Executes `}}`.
 * 331. Executes `>`.
 * 332. Executes `<div className="flex w-full items-end justify-between gap-4 p-4">`.
 * 333. Executes `<p className="text-white text-2xl font-bold leading-tight flex-1">`.
 * 334. Executes `Estimated Price: NGN {estimatedPrice}`.
 * 335. Executes `</p>`.
 * 336. Executes `</div>`.
 * 337. Executes `</div>`.
 * 338. Executes `</div>`.
 * 339. Executes `</div>`.
 * 340. Executes `)}`.
 * 341. Executes `<div className="flex gap-3 px-4 py-6">`.
 * 342. Executes `<button`.
 * 343. Executes `type="button"`.
 * 344. Executes `onClick={() => setStep((previous) => Math.max(1, previous - 1))}`.
 * 345. Executes `disabled={step === 1}`.
 * 346. Executes `className="flex-1 h-12 rounded-lg bg-[#f5f2f0] text-[#181411] font-bold disabled:opacity-60"`.
 * 347. Executes `>`.
 * 348. Executes `Previous`.
 * 349. Executes `</button>`.
 * 350. Executes `{step < 3 ? (`.
 * 351. Executes `<button`.
 * 352. Executes `type="button"`.
 * 353. Executes `disabled={!canGoNext}`.
 * 354. Executes `onClick={() => setStep((previous) => Math.min(3, previous + 1))}`.
 * 355. Executes `className="flex-1 h-12 rounded-lg bg-[#f2800d] text-[#181411] font-bold disabled:opacity-60 disabled:cursor-not-allowed"`.
 * 356. Executes `>`.
 * 357. Executes `Next`.
 * 358. Executes `</button>`.
 * 359. Executes `) : (`.
 * 360. Executes `<button`.
 * 361. Executes `type="submit"`.
 * 362. Executes `disabled={loading || selectedServiceIds.length === 0}`.
 * 363. Executes `className="flex-1 h-12 rounded-lg bg-[#f2800d] text-[#181411] font-bold disabled:opacity-60 disabled:cursor-not-allowed"`.
 * 364. Executes `>`.
 * 365. Executes `{loading ? "Processing..." : "Place Order"}`.
 * 366. Executes `</button>`.
 * 367. Executes `)}`.
 * 368. Executes `</div>`.
 * 369. Executes `</form>`.
 * 370. Executes `</div>`.
 * 371. Executes `</div>`.
 * 372. Executes `);`.
 */
function ClientBookingFormContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const barberFromQuery = searchParams?.get("barberId") ?? "";
  type CreateBookingResponse = {
    booking?: {
      _id?: string;
    };
    error?: string;
  };
  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState<BarberListItem[]>([]);
  const [barberId, setBarberId] = useState(barberFromQuery);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    dateTime: "",
    note: "",
  });
  const [step, setStep] = useState(1);

  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber._id === barberId) ?? null,
    [barberId, barbers]
  );

  const selectedServices = useMemo(
    () =>
      selectedServiceIds
        .map((id) => services.find((service) => service._id === id))
        .filter((service): service is ServiceItem => Boolean(service)),
    [selectedServiceIds, services]
  );

  const estimatedPrice = useMemo(
    () => selectedServices.reduce((sum, service) => sum + (service.price || 0), 0),
    [selectedServices]
  );

  useEffect(() => {
    /**
     * AUTO-FUNCTION-COMMENT: loadBarbers
     * Purpose: Handles load barbers.
     * Line-by-line:
     * 1. Executes `const res = await fetch("/api/barbers");`.
     * 2. Executes `const json = await res.json().catch(() => ({}));`.
     * 3. Executes `if (res.ok) {`.
     * 4. Executes `setBarbers(Array.isArray(json.barbers) ? json.barbers : []);`.
     * 5. Executes `}`.
     */
    const loadBarbers = async () => {
      const res = await fetch("/api/barbers");
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setBarbers(Array.isArray(json.barbers) ? json.barbers : []);
      }
    };

    loadBarbers();
  }, []);

  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      name: previous.name || session?.user?.name || "",
      email: previous.email || session?.user?.email || "",
    }));
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    setSelectedServiceIds([]);

    if (!barberId) {
      setServices([]);
      return;
    }

    /**
     * AUTO-FUNCTION-COMMENT: loadServices
     * Purpose: Handles load services.
     * Line-by-line:
     * 1. Executes `const res = await fetch(\`/api/services?barberId=${barberId}\`);`.
     * 2. Executes `const json = await res.json().catch(() => ({}));`.
     * 3. Executes `if (res.ok) {`.
     * 4. Executes `setServices(Array.isArray(json.services) ? json.services : []);`.
     * 5. Executes `} else {`.
     * 6. Executes `setServices([]);`.
     * 7. Executes `}`.
     */
    const loadServices = async () => {
      const res = await fetch(`/api/services?barberId=${barberId}`);
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setServices(Array.isArray(json.services) ? json.services : []);
      } else {
        setServices([]);
      }
    };

    loadServices();
  }, [barberId]);

  /**
   * AUTO-FUNCTION-COMMENT: handleChange
   * Purpose: Handles handle change.
   * Line-by-line:
   * 1. Executes `setForm({ ...form, [e.target.name]: e.target.value });`.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * AUTO-FUNCTION-COMMENT: handleSubmit
   * Purpose: Handles handle submit.
   * Line-by-line:
   * 1. Executes `e.preventDefault();`.
   * 2. Executes `setLoading(true);`.
   * 3. Executes `try {`.
   * 4. Executes `const res = await axios.post<CreateBookingResponse>("/api/bookings", {`.
   * 5. Executes `...form,`.
   * 6. Executes `clientEmail: session?.user?.email,`.
   * 7. Executes `barberId,`.
   * 8. Executes `serviceIds: selectedServiceIds,`.
   * 9. Executes `});`.
   * 10. Executes `const booking = res.data?.booking;`.
   * 11. Executes `if (booking?._id) {`.
   * 12. Executes `router.push(\`/checkout/${booking._id}\`);`.
   * 13. Executes `}`.
   * 14. Executes `setForm({ name: "", email: "", address: "", dateTime: "", note: "" });`.
   * 15. Executes `setSelectedServiceIds([]);`.
   * 16. Executes `} catch (error: unknown) {`.
   * 17. Executes `const responseError =`.
   * 18. Executes `typeof error === "object" &&`.
   * 19. Executes `error !== null &&`.
   * 20. Executes `"response" in error &&`.
   * 21. Executes `typeof error.response === "object" &&`.
   * 22. Executes `error.response !== null &&`.
   * 23. Executes `"data" in error.response &&`.
   * 24. Executes `typeof error.response.data === "object" &&`.
   * 25. Executes `error.response.data !== null &&`.
   * 26. Executes `"error" in error.response.data &&`.
   * 27. Executes `typeof error.response.data.error === "string"`.
   * 28. Executes `? error.response.data.error`.
   * 29. Executes `: null;`.
   * 30. Executes `const message =`.
   * 31. Executes `responseError || (error instanceof Error ? error.message : "Booking failed");`.
   * 32. Executes `alert(message);`.
   * 33. Executes `} finally {`.
   * 34. Executes `setLoading(false);`.
   * 35. Executes `}`.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post<CreateBookingResponse>("/api/bookings", {
        ...form,
        clientEmail: session?.user?.email,
        barberId,
        serviceIds: selectedServiceIds,
      });
      const booking = res.data?.booking;
      if (booking?._id) {
        router.push(`/checkout/${booking._id}`);
      }
      setForm({ name: "", email: "", address: "", dateTime: "", note: "" });
      setSelectedServiceIds([]);
    } catch (error: unknown) {
      const responseError =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "error" in error.response.data &&
        typeof error.response.data.error === "string"
          ? error.response.data.error
          : null;
      const message =
        responseError || (error instanceof Error ? error.message : "Booking failed");
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * AUTO-FUNCTION-COMMENT: handleToggleService
   * Purpose: Handles handle toggle service.
   * Line-by-line:
   * 1. Executes `setSelectedServiceIds((previous) =>`.
   * 2. Executes `previous.includes(serviceId)`.
   * 3. Executes `? previous.filter((id) => id !== serviceId)`.
   * 4. Executes `: [...previous, serviceId]`.
   * 5. Executes `);`.
   */
  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((previous) =>
      previous.includes(serviceId)
        ? previous.filter((id) => id !== serviceId)
        : [...previous, serviceId]
    );
  };

  const canGoNext =
    (step === 1 && Boolean(barberId)) ||
    (step === 2 &&
      form.name.trim() &&
      form.email.trim() &&
      form.dateTime.trim()) ||
    (step === 3 && selectedServiceIds.length > 0);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <div>
        <div className="flex items-center bg-white p-4 pb-2 justify-between">
          <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Book Appointment
          </h2>
        </div>

        <div className="flex justify-center gap-3 py-5">
          <div
            className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-[#181411]" : "bg-[#e6e0db]"}`}
          />
          <div
            className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-[#181411]" : "bg-[#e6e0db]"}`}
          />
          <div
            className={`h-2 w-2 rounded-full ${step >= 3 ? "bg-[#181411]" : "bg-[#e6e0db]"}`}
          />
        </div>

        {!barberId && step === 1 && (
          <p className="px-4 text-sm text-red-600">
            Please pick a barber before booking.
          </p>
        )}

        <form onSubmit={handleSubmit} className="max-w-[480px] mx-auto">
          {step === 1 && (
            <div className="px-4 py-3 space-y-3">
              <p className="text-[#181411] text-base font-medium pb-1">
                Select Barber
              </p>

              {barbers.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#e6e0db] p-4 text-sm text-[#8a7560]">
                  No barbers are available yet.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {barbers.map((barber) => (
                  <button
                    key={barber._id}
                    type="button"
                    onClick={() => setBarberId(barber._id)}
                    className={`rounded-xl border p-3 text-left ${
                      barberId === barber._id
                        ? "border-[#f2800d] bg-[#fff4ea]"
                        : "border-[#eee]"
                    }`}
                  >
                    <div className="h-20 w-full overflow-hidden rounded-lg bg-[#f5f2f0]">
                      <img
                        src={barber.avatar || "/avatar.svg"}
                        alt={barber.name || "Barber"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="pt-2 text-sm font-semibold text-[#181411]">
                      {barber.name || "Barber"}
                    </p>
                    <p className="text-xs text-[#8a7560]">
                      {barber.address ||
                        [barber.state, barber.country].filter(Boolean).join(", ")}
                    </p>
                    <p className="pt-1 text-xs text-[#8a7560]">
                      {barber.serviceCount ?? barber.services?.length ?? 0} services
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              {(["name", "email", "address"] as const).map((field) => (
                <div key={field} className="px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#181411] text-base font-medium pb-2 capitalize">
                      {field}
                    </p>
                    <input
                      name={field}
                      value={form[field]}
                      onChange={handleChange}
                      placeholder={`Enter your ${field}`}
                      className="form-input w-full rounded-lg bg-[#f5f2f0] text-[#181411] p-4 h-14 placeholder:text-[#8a7560] focus:ring-0 focus:outline-0 border-none"
                      required={field !== "address"}
                    />
                  </label>
                </div>
              ))}

              <div className="px-4 py-3">
                <label className="flex flex-col">
                  <p className="text-[#181411] text-base font-medium pb-2">
                    Date and Time
                  </p>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={form.dateTime}
                    onChange={handleChange}
                    className="form-input w-full rounded-lg bg-[#f5f2f0] text-[#181411] p-4 h-14 focus:ring-0 border-none"
                    required
                  />
                </label>
              </div>

              <div className="px-4 py-3">
                <label className="flex flex-col">
                  <p className="text-[#181411] text-base font-medium pb-2">Note</p>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Add a note (optional)"
                    className="form-textarea w-full min-h-36 rounded-lg bg-[#f5f2f0] text-[#181411] p-4 placeholder:text-[#8a7560] focus:ring-0 border-none"
                  />
                </label>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="px-4 py-6">
              <div className="rounded-2xl bg-[#3f4a57] p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Select Services</h3>
                    <p className="text-sm text-white/70">
                      {selectedBarber?.name
                        ? `Choose from ${selectedBarber.name}'s active services`
                        : "Choose one or more services"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-white/80"
                    onClick={() => setSelectedServiceIds([])}
                  >
                    Clear
                  </button>
                </div>

                {services.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/30 p-4 text-sm text-white/80">
                    This barber has not added any active services yet.
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {services.map((service) => {
                      const selected = selectedServiceIds.includes(service._id);
                      return (
                        <button
                          key={service._id}
                          type="button"
                          onClick={() => handleToggleService(service._id)}
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                            selected
                              ? "border-white bg-white/10"
                              : "border-white/25 hover:border-white/60"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold">{service.name}</p>
                            <p className="text-xs text-white/70">
                              NGN {service.price} • {service.durationMinutes ?? 30} min
                            </p>
                          </div>
                          <span className="text-xs font-semibold">
                            {selected ? "Selected" : "Add"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedServices.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {selectedServices.map((service) => (
                      <div
                        key={service._id}
                        className="flex items-center justify-between rounded-lg border border-white/30 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{service.name}</p>
                          <p className="text-xs text-white/60">
                            NGN {service.price} • {service.durationMinutes ?? 30} min
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleService(service._id)}
                          className="text-sm font-bold text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div
                  className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-lg pt-[132px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%), url('https://images.unsplash.com/photo-1595433562696-a8b4e3c5f4ef?auto=format&fit=crop&w=500&q=80')",
                  }}
                >
                  <div className="flex w-full items-end justify-between gap-4 p-4">
                    <p className="text-white text-2xl font-bold leading-tight flex-1">
                      Estimated Price: NGN {estimatedPrice}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 px-4 py-6">
            <button
              type="button"
              onClick={() => setStep((previous) => Math.max(1, previous - 1))}
              disabled={step === 1}
              className="flex-1 h-12 rounded-lg bg-[#f5f2f0] text-[#181411] font-bold disabled:opacity-60"
            >
              Previous
            </button>
            {step < 3 ? (
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setStep((previous) => Math.min(3, previous + 1))}
                className="flex-1 h-12 rounded-lg bg-[#f2800d] text-[#181411] font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || selectedServiceIds.length === 0}
                className="flex-1 h-12 rounded-lg bg-[#f2800d] text-[#181411] font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * AUTO-FUNCTION-COMMENT: ClientBookingForm
 * Purpose: Handles client booking form.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<Suspense`.
 * 3. Executes `fallback={`.
 * 4. Executes `<div className="min-h-screen bg-white flex items-center justify-center">`.
 * 5. Executes `<p className="text-sm text-[#8a7560]">Loading booking form...</p>`.
 * 6. Executes `</div>`.
 * 7. Executes `}`.
 * 8. Executes `>`.
 * 9. Executes `<ClientBookingFormContent />`.
 * 10. Executes `</Suspense>`.
 * 11. Executes `);`.
 */
export default function ClientBookingForm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-sm text-[#8a7560]">Loading booking form...</p>
        </div>
      }
    >
      <ClientBookingFormContent />
    </Suspense>
  );
}
