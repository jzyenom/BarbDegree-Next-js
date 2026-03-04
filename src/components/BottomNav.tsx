// import { Home, List, User } from "lucide-react";
// import Link from "next/link";

// export default function BottomNav() {
//   const items = [
//     { name: "Home", icon: Home, active: true },
//     { name: "Requests", icon: List, active: false },
//     { name: "Profile", icon: User, active: false },
//   ];

//   return (
//     <nav className="border-t border-[#f5f2f0] bg-white flex justify-around py-2">
//       {items.map(({ name, icon: Icon, active }) => (
//         <Link
//           key={name}
//           href="#"
//           className={`flex flex-col items-center ${
//             active ? "text-[#181411]" : "text-[#8a7560]"
//           }`}
//         >
//           <Icon size={24} />
//           <p className="text-xs font-medium">{name}</p>
//         </Link>
//       ))}
//     </nav>
//   );
// }

import { Calendar, Home, List, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type NavItem = {
  name: string;
  icon: LucideIcon;
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
  { name: "Home", icon: Home, active: true, href: "/" },
  { name: "Book", icon: Calendar, href: "/book" },
  { name: "Profile", icon: User, href: "/profile" },
];

export const barberNavItems: NavItem[] = [
  { name: "Home", icon: Home, href: "/dashboard/barber" },
  { name: "Bookings", icon: Calendar, href: "/dashboard/barber/bookings" },
  { name: "Services", icon: List, href: "/dashboard/barber/services" },
  { name: "Profile", icon: User, href: "/dashboard/barber" },
];

const defaultItems: NavItem[] = clientNavItems;

export default function BottomNav({
  items = defaultItems,
  activeItem,
  variant = "default",
  className = "",
}: BottomNavProps) {
  const navClass =
    variant === "light"
      ? "fixed bottom-0 left-0 right-0 bg-white border-t border-[#efe8e2]"
      : "fixed bottom-0 left-0 right-0 bg-content-light/90 dark:bg-content-dark/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700";

  return (
    <nav className={`${navClass} ${className}`}>
      <div className="flex justify-around h-20 items-center max-w-lg mx-auto">
        {items.map(({ name, icon: Icon, active, href = "#" }) => {
          const isActive = activeItem ? activeItem === name : !!active;
          const itemClass =
            variant === "light"
              ? isActive
                ? "text-[#ff6900] font-semibold"
                : "text-[#ff6900] font-medium"
              : isActive
              ? "text-[#ff6900] font-bold"
              : "text-[#ff6900] font-medium";

          const iconClass =
            variant === "light"
              ? isActive
                ? "fill-current stroke-current"
                : "fill-transparent stroke-current"
              : isActive
              ? "fill-current stroke-current"
              : "fill-transparent stroke-current";

          return (
            <Link
              key={name}
              href={href}
              className={`group flex flex-col items-center gap-1 ${itemClass} hover:text-[#ff6900]`}
            >
              <Icon
                className={`${iconClass} group-hover:fill-current group-hover:stroke-current`}
                size={22}
              />
            <span className="text-xs">{name}</span>
          </Link>
          );
        })}
      </div>
    </nav>
  );
}
