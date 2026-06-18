"use client";

import Image from "next/image";
import { Calendar, Home, List, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  name: string;
  icon: LucideIcon | string;
  href?: string;
  active?: boolean;
};

type BottomNavProps = {
  items?: NavItem[];
  activeItem?: string;
  variant?: "default" | "light";
  className?: string;
};

export const clientNavItems: NavItem[] = [
  { name: "Home", icon: "/assets/home-90.png", href: "/" },
  { name: "Bookings", icon: "/assets/calendar-91.png", href: "/bookings" },
  { name: "Messages", icon: "/assets/chat-bubble-93.png", href: "#" },
  { name: "Profile", icon: "/assets/account-male-92.png", href: "/dashboard/client/profile" },
];

export const barberNavItems: NavItem[] = [
  { name: "Home", icon: Home, href: "/dashboard/barber" },
  { name: "Bookings", icon: Calendar, href: "/dashboard/barber/bookings" },
  { name: "Services", icon: List, href: "/dashboard/barber/services" },
  { name: "Profile", icon: User, href: "/dashboard/barber/profile" },
];

const defaultItems: NavItem[] = clientNavItems;

function isActiveItem(pathname: string | null, item: NavItem, activeItem?: string) {
  if (activeItem) return activeItem === item.name;
  if (item.active) return true;
  if (!pathname || !item.href || item.href === "#") return false;

  if (item.href === "/") return pathname === "/" || pathname === "/dashboard/client";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavIcon({
  icon,
  isActive,
  name,
}: {
  icon: NavItem["icon"];
  isActive: boolean;
  name: string;
}) {
  if (typeof icon === "string") {
    return (
      <Image
        src={icon}
        alt=""
        width={25}
        height={25}
        className="h-[25px] w-[25px]"
      />
    );
  }

  const Icon = icon;
  return (
    <Icon
      size={22}
      strokeWidth={2.4}
      className="text-white"
      fill={isActive && name === "Home" ? "currentColor" : "none"}
    />
  );
}

export default function BottomNav({
  items = defaultItems,
  activeItem,
  className = "",
}: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={`fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] left-1/2 z-50 h-11 max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-[24px] bg-[#212020] px-5 shadow-[0_10px_24px_rgba(0,0,0,0.22)] ${className}`}
      aria-label="Primary navigation"
    >
      <div className="flex h-full items-center gap-4">
        {items.map((item) => {
          const { name, icon, href = "#" } = item;
          const isActive = isActiveItem(pathname, item, activeItem);

          return (
            <Link
              key={name}
              href={href}
              aria-label={name}
              className="flex h-6 w-6 items-center justify-center"
            >
              <NavIcon icon={icon} isActive={isActive} name={name} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
