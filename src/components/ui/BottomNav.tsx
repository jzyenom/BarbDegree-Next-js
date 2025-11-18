import Link from "next/link";
import { Home, Calendar, User } from "lucide-react";

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
