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

import { Home, Calendar, List, User } from "lucide-react";
import Link from "next/link";

export default function BottomNav() {
  const items = [
    { name: "Home", icon: Home, active: true },
    { name: "Bookings", icon: Calendar },
    { name: "Requests", icon: List },
    { name: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-content-light/90 dark:bg-content-dark/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around h-20 items-center max-w-lg mx-auto">
        {items.map(({ name, icon: Icon, active }) => (
          <Link
            key={name}
            href="#"
            className={`flex flex-col items-center gap-1 ${
              active
                ? "text-primary font-bold"
                : "text-gray-500 dark:text-gray-400 font-medium"
            }`}
          >
            <Icon
              className={`${active ? "fill-primary stroke-none" : ""}`}
              size={22}
            />
            <span className="text-xs">{name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
