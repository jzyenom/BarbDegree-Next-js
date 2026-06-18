"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/BottomNav";
import NotificationsBell from "@/components/NotificationsBell";
import { fetchNotifications } from "@/features/notifications/notificationsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type MarketplaceService = {
  _id: string;
  name: string;
  price: number;
  durationMinutes?: number;
};

type MarketplaceBarber = {
  _id: string;
  name: string;
  address?: string;
  state?: string;
  country?: string;
  charge?: string | number;
  avatar?: string;
  shopName?: string;
  shopAddress?: string;
  location?: string;
  rating: number | null;
  reviews: number;
  services?: MarketplaceService[];
  bookable: boolean;
};

type StyleItem = {
  name: string;
  barberCount: number;
  serviceCount: number;
};

type LoadState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

const initialBarberState: LoadState<MarketplaceBarber[]> = {
  data: [],
  loading: true,
  error: null,
};

const initialStyleState: LoadState<StyleItem[]> = {
  data: [],
  loading: true,
  error: null,
};

function formatName(value?: string | null) {
  if (!value?.trim()) return "there";
  return value.trim().split(" ")[0];
}

function formatLocation(barber: MarketplaceBarber) {
  return (
    barber.location?.trim() ||
    barber.shopAddress?.trim() ||
    barber.address?.trim() ||
    [barber.state, barber.country].filter(Boolean).join(", ") ||
    "Location unavailable"
  );
}

function formatRating(value: number | null) {
  return typeof value === "number" ? value.toFixed(1) : "New";
}

function formatReviewCount(value: number) {
  return `${value} ${value === 1 ? "review" : "reviews"}`;
}

function formatPrice(value?: string | number) {
  const numeric = Number(value);
  if (!value || Number.isNaN(numeric)) return "Price unavailable";
  return `NGN ${new Intl.NumberFormat("en-NG").format(numeric)}`;
}

function getBarberImage(barber: MarketplaceBarber) {
  const rawAvatar = barber.avatar?.trim();
  if (!rawAvatar || rawAvatar === "avatar.png") return "/avatar.svg";
  return rawAvatar;
}

function getPrimaryService(barber: MarketplaceBarber) {
  return barber.services?.[0]?.name ?? "No active services";
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof json.error === "string" ? json.error : "Request failed"
    );
  }

  return json as T;
}

function StarIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <Image
      src="/assets/star-52.png"
      alt=""
      width={12}
      height={12}
      className={className}
    />
  );
}

function ForwardIcon({
  direction,
  className = "h-5 w-5",
}: {
  direction: "previous" | "next";
  className?: string;
}) {
  return (
    <Image
      src={
        direction === "previous"
          ? "/assets/forward-59.png"
          : "/assets/forward-60.png"
      }
      alt=""
      width={20}
      height={20}
      className={className}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="w-[167px] shrink-0 overflow-hidden rounded-[15px] border border-[#c2c2c1] bg-[#fffffe] p-[10px]">
      <div className="h-[143px] w-[147px] animate-pulse rounded-xl bg-[#f1f0ef]" />
      <div className="mt-3 h-3 w-24 animate-pulse rounded bg-[#f1f0ef]" />
      <div className="mt-2 h-2.5 w-20 animate-pulse rounded bg-[#f1f0ef]" />
      <div className="mt-3 h-5 w-20 animate-pulse rounded bg-[#f1f0ef]" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="h-20 w-[104px] shrink-0 animate-pulse rounded-lg bg-[#f1f0ef]" />
      <div className="min-w-0 flex-1">
        <div className="h-3.5 w-36 animate-pulse rounded bg-[#f1f0ef]" />
        <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-[#f1f0ef]" />
        <div className="mt-2 h-2.5 w-28 animate-pulse rounded bg-[#f1f0ef]" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#f1f0ef]" />
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[10px] border border-dashed border-[#c2c2c1] px-3 py-4 text-xs font-medium text-[#50504f]">
      {children}
    </p>
  );
}

export default function ClientMarketplaceHome() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const profileName = useAppSelector((state) => state.user.user?.name);
  const [activeStyle, setActiveStyle] = useState("");
  const [topRated, setTopRated] = useState(initialBarberState);
  const [available, setAvailable] = useState(initialBarberState);
  const [styleState, setStyleState] = useState(initialStyleState);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMarketplaceData() {
      const [topRatedResult, availableResult, stylesResult] =
        await Promise.allSettled([
          fetchJson<{ barbers: MarketplaceBarber[] }>(
            "/api/barbers?rated=true&sort=rating&limit=10",
            controller.signal
          ),
          fetchJson<{ barbers: MarketplaceBarber[] }>(
            "/api/barbers?available=true&limit=10",
            controller.signal
          ),
          fetchJson<{ styles: StyleItem[] }>(
            "/api/services?styles=true&limit=8",
            controller.signal
          ),
        ]);

      if (controller.signal.aborted) return;

      if (topRatedResult.status === "fulfilled") {
        setTopRated({
          data: topRatedResult.value.barbers ?? [],
          loading: false,
          error: null,
        });
      } else {
        setTopRated({
          data: [],
          loading: false,
          error: topRatedResult.reason?.message ?? "Could not load top rated barbers",
        });
      }

      if (availableResult.status === "fulfilled") {
        setAvailable({
          data: availableResult.value.barbers ?? [],
          loading: false,
          error: null,
        });
      } else {
        setAvailable({
          data: [],
          loading: false,
          error: availableResult.reason?.message ?? "Could not load available barbers",
        });
      }

      if (stylesResult.status === "fulfilled") {
        const styles = stylesResult.value.styles ?? [];
        setStyleState({ data: styles, loading: false, error: null });
        setActiveStyle((current) => current || styles[0]?.name || "");
      } else {
        setStyleState({
          data: [],
          loading: false,
          error: stylesResult.reason?.message ?? "Could not load styles",
        });
      }
    }

    loadMarketplaceData();
    return () => controller.abort();
  }, []);

  const firstName = formatName(
    profileName || session?.user?.name || session?.user?.email?.split("@")[0]
  );

  const topRatedBarbers = useMemo(
    () => topRated.data.filter((barber) => barber.rating !== null && barber.reviews > 0),
    [topRated.data]
  );

  return (
    <div className="flex min-h-screen justify-center bg-[#fffffe] text-[#212020]">
      <div className="relative w-full max-w-[430px] pb-28 font-sans">
        <header className="flex items-center justify-between px-6 pb-3 pt-8">
          <div className="flex items-center gap-4">
            <Image
              src="/assets/ellipse-3-17.svg"
              alt=""
              width={50}
              height={50}
              className="h-[50px] w-[50px] shrink-0 rounded-full object-cover"
              unoptimized
            />
            <div>
              <p className="text-base font-bold leading-tight text-[#212020]">
                Morning, {firstName}.
              </p>
              <p className="mt-0.5 text-xs font-normal leading-tight text-[#50504f]">
                Narayi, Kaduna.
              </p>
            </div>
          </div>
          <NotificationsBell
            useAssetIcon
            buttonClassName="relative flex h-[25px] w-[25px] items-center justify-center"
            iconClassName="h-[25px] w-[25px]"
            dotClassName="absolute right-0 top-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
          />
        </header>

        <main>
          <section className="mt-2 flex items-center gap-3 px-6">
            <label className="flex h-10 flex-1 items-center gap-3 rounded-[10px] bg-[#f7f6f9] px-4">
              <Image
                src="/assets/search-21.png"
                alt=""
                width={22}
                height={22}
                className="h-[22px] w-[22px] shrink-0"
              />
              <input
                type="search"
                placeholder="Search..."
                className="h-full flex-1 bg-transparent text-xs font-normal text-[#50504f] outline-none placeholder:text-[#50504f]"
              />
            </label>
            <button
              type="button"
              aria-label="Filters"
              className="flex h-10 w-[49px] shrink-0 items-center justify-center rounded-[10px] bg-[#212020]"
            >
              <Image
                src="/assets/slider-23.png"
                alt=""
                width={22}
                height={22}
                className="h-[22px] w-[22px]"
              />
            </button>
          </section>

          <section className="mt-6 px-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#212020]">
                Top Rated Near You
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous top rated"
                  className="flex h-5 w-5 items-center justify-center"
                >
                  <ForwardIcon direction="previous" />
                </button>
                <button
                  type="button"
                  aria-label="Next top rated"
                  className="flex h-5 w-5 items-center justify-center"
                >
                  <ForwardIcon direction="next" />
                </button>
              </div>
            </div>

            {topRated.loading ? (
              <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : topRated.error ? (
              <EmptyState>{topRated.error}</EmptyState>
            ) : topRatedBarbers.length === 0 ? (
              <EmptyState>No reviewed barbers are available yet.</EmptyState>
            ) : (
              <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide">
                {topRatedBarbers.map((barber) => (
                  <Link
                    key={barber._id}
                    href={
                      barber.bookable
                        ? `/book?barberId=${barber._id}`
                        : `/barbers/${barber._id}`
                    }
                    className="w-[167px] shrink-0 overflow-hidden rounded-[15px] border border-[#c2c2c1] bg-[#fffffe]"
                  >
                    <div className="relative">
                      <Image
                        src={getBarberImage(barber)}
                        alt={barber.name || "Barber"}
                        width={147}
                        height={143}
                        className="m-[10px] h-[143px] w-[147px] rounded-xl object-cover"
                        unoptimized
                      />
                      <div className="absolute bottom-[14px] right-[14px] flex items-center gap-1 rounded-[5px] bg-white px-[6px] py-[3px]">
                        <StarIcon />
                        <span className="text-[10px] font-medium text-[#212020]">
                          {formatRating(barber.rating)}
                        </span>
                      </div>
                    </div>
                    <div className="px-[10px] pb-3">
                      <p className="mt-1 truncate text-xs font-bold text-[#212020]">
                        {barber.name || "Unnamed barber"}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] font-medium text-[#212020]">
                        {formatLocation(barber)}
                      </p>
                      <p className="mt-1 truncate text-[10px] font-medium text-[#50504f]">
                        {formatReviewCount(barber.reviews)}
                      </p>
                      <span className="mt-2 inline-block max-w-full truncate rounded-[5px] bg-[#f4f4f0] px-2 py-[3px] text-[10px] font-bold text-[#50504f]">
                        {getPrimaryService(barber)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="mt-6 px-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#212020]">Explore Styles</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous style"
                  className="flex h-5 w-5 items-center justify-center"
                >
                  <ForwardIcon direction="previous" />
                </button>
                <button
                  type="button"
                  aria-label="Next style"
                  className="flex h-5 w-5 items-center justify-center"
                >
                  <ForwardIcon direction="next" />
                </button>
              </div>
            </div>
            {styleState.loading ? (
              <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 scrollbar-hide">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-[23px] w-20 shrink-0 animate-pulse rounded-lg bg-[#f1f0ef]"
                  />
                ))}
              </div>
            ) : styleState.error ? (
              <EmptyState>{styleState.error}</EmptyState>
            ) : styleState.data.length === 0 ? (
              <EmptyState>No active styles are available yet.</EmptyState>
            ) : (
              <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 scrollbar-hide">
                {styleState.data.map((style) => (
                  <button
                    key={style.name}
                    type="button"
                    onClick={() => setActiveStyle(style.name)}
                    className={`h-[23px] shrink-0 whitespace-nowrap rounded-lg border px-3 font-sans text-xs font-semibold transition-colors ${
                      activeStyle === style.name
                        ? "border-[#212020] bg-[#212020] text-white"
                        : "border-[#c2c2c1] bg-transparent text-[#212020]"
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="mt-6 px-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#212020]">
                Available Barbers
              </h2>
              <Link href="/book" className="text-[10px] font-bold text-[#50504f]">
                See All
              </Link>
            </div>

            {available.loading ? (
              <div className="flex flex-col">
                <RowSkeleton />
                <div className="h-px bg-[#c2c2c1]" />
                <RowSkeleton />
              </div>
            ) : available.error ? (
              <EmptyState>{available.error}</EmptyState>
            ) : available.data.length === 0 ? (
              <EmptyState>No active barbers are available right now.</EmptyState>
            ) : (
              <div className="flex flex-col">
                {available.data.map((barber, index) => (
                  <div key={barber._id}>
                    <Link
                      href={
                        barber.bookable
                          ? `/book?barberId=${barber._id}`
                          : `/barbers/${barber._id}`
                      }
                      className="flex items-center gap-4 py-4"
                    >
                      <Image
                        src={getBarberImage(barber)}
                        alt={barber.name || "Barber"}
                        width={104}
                        height={80}
                        className="h-20 w-[104px] shrink-0 rounded-lg object-cover"
                        unoptimized
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold leading-tight text-[#212020]">
                          {barber.name || "Unnamed barber"}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <StarIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate text-[10px] font-medium text-[#212020]">
                            {barber.rating === null
                              ? "No reviews yet"
                              : `${formatRating(barber.rating)}  \u2022  ${formatReviewCount(
                                  barber.reviews
                                )}`}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[10px] font-bold text-[#50504f]">
                          {getPrimaryService(barber)}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-[#212020]">
                          <span>From </span>
                          <span className="text-xs font-bold">
                            {formatPrice(barber.charge)}
                          </span>
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-[#50504f]">
                        View
                      </span>
                    </Link>
                    {index < available.data.length - 1 && (
                      <div className="h-px bg-[#c2c2c1]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
      <BottomNav activeItem="Home" />
    </div>
  );
}
