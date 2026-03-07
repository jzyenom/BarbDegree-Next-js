/**
 * AUTO-FILE-COMMENT: src/components/BottomNav.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
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

/**
 * AUTO-FUNCTION-COMMENT: BottomNav
 * Purpose: Handles bottom nav.
 * Line-by-line:
 * 1. Executes `const navClass =`.
 * 2. Executes `variant === "light"`.
 * 3. Executes `? "fixed bottom-0 left-0 right-0 bg-white border-t border-[#efe8e2]"`.
 * 4. Executes `: "fixed bottom-0 left-0 right-0 bg-content-light/90 dark:bg-content-dark/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-7...`.
 * 5. Executes `return (`.
 * 6. Executes `<nav className={\`${navClass} ${className}\`}>`.
 * 7. Executes `<div className="flex justify-around h-20 items-center max-w-lg mx-auto">`.
 * 8. Executes `{items.map(({ name, icon: Icon, active, href = "#" }) => {`.
 * 9. Executes `const isActive = activeItem ? activeItem === name : !!active;`.
 * 10. Executes `const itemClass =`.
 * 11. Executes `variant === "light"`.
 * 12. Executes `? isActive`.
 * 13. Executes `? "text-[#ff6900] font-semibold"`.
 * 14. Executes `: "text-[#ff6900] font-medium"`.
 * 15. Executes `: isActive`.
 * 16. Executes `? "text-[#ff6900] font-bold"`.
 * 17. Executes `: "text-[#ff6900] font-medium";`.
 * 18. Executes `const iconClass =`.
 * 19. Executes `variant === "light"`.
 * 20. Executes `? isActive`.
 * 21. Executes `? "fill-current stroke-current"`.
 * 22. Executes `: "fill-transparent stroke-current"`.
 * 23. Executes `: isActive`.
 * 24. Executes `? "fill-current stroke-current"`.
 * 25. Executes `: "fill-transparent stroke-current";`.
 * 26. Executes `return (`.
 * 27. Executes `<Link`.
 * 28. Executes `key={name}`.
 * 29. Executes `href={href}`.
 * 30. Executes `className={\`group flex flex-col items-center gap-1 ${itemClass} hover:text-[#ff6900]\`}`.
 * 31. Executes `>`.
 * 32. Executes `<Icon`.
 * 33. Executes `className={\`${iconClass} group-hover:fill-current group-hover:stroke-current\`}`.
 * 34. Executes `size={22}`.
 * 35. Executes `/>`.
 * 36. Executes `<span className="text-xs">{name}</span>`.
 * 37. Executes `</Link>`.
 * 38. Executes `);`.
 * 39. Executes `})}`.
 * 40. Executes `</div>`.
 * 41. Executes `</nav>`.
 * 42. Executes `);`.
 */
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
