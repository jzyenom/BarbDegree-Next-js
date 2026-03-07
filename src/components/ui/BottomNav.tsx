import Link from "next/link";
import { Home, Calendar, User } from "lucide-react";

/**
 * AUTO-FUNCTION-COMMENT: BottomNav
 * Purpose: Handles bottom nav.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="flex gap-2 border-t border-[#f5f2f0] bg-white px-4 pb-3 pt-2">`.
 * 3. Executes `<Link href="/" className="flex flex-1 flex-col items-center text-[#8a7560]">`.
 * 4. Executes `<Home size={24} />`.
 * 5. Executes `<p className="text-xs">Home</p>`.
 * 6. Executes `</Link>`.
 * 7. Executes `<Link href="/booking" className="flex flex-1 flex-col items-center text-[#181411]">`.
 * 8. Executes `<Calendar size={24} />`.
 * 9. Executes `<p className="text-xs">Book</p>`.
 * 10. Executes `</Link>`.
 * 11. Executes `<Link href="/profile" className="flex flex-1 flex-col items-center text-[#8a7560]">`.
 * 12. Executes `<User size={24} />`.
 * 13. Executes `<p className="text-xs">Profile</p>`.
 * 14. Executes `</Link>`.
 * 15. Executes `</div>`.
 * 16. Executes `);`.
 */
export default function BottomNav() {
  return (
    <div className="flex gap-2 border-t border-[#f5f2f0] bg-white px-4 pb-3 pt-2">
      <Link href="/" className="flex flex-1 flex-col items-center text-[#8a7560]">
        <Home size={24} />
        <p className="text-xs">Home</p>
      </Link>

      <Link href="/booking" className="flex flex-1 flex-col items-center text-[#181411]">
        <Calendar size={24} />
        <p className="text-xs">Book</p>
      </Link>

      <Link href="/profile" className="flex flex-1 flex-col items-center text-[#8a7560]">
        <User size={24} />
        <p className="text-xs">Profile</p>
      </Link>
    </div>
  );
}
