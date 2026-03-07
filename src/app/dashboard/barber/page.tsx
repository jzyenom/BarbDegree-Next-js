/**
 * AUTO-FILE-COMMENT: src/app/dashboard/barber/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

import BarberHeader from "@/components/Barber/BarberHeader";
import BarberInfoCard from "@/components/Barber/BarberInfoCard";
import BarberRating from "@/components/Barber/BarberRating";
import BarberGallery from "@/components/Barber/BarberGallery";
import BottomNav, { barberNavItems } from "@/components/BottomNav";

/**
 * AUTO-FUNCTION-COMMENT: BarberDashboard
 * Purpose: Handles barber dashboard.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="flex flex-col min-h-screen bg-white text-[#181411] justify-between font-inter">`.
 * 3. Executes `<div>`.
 * 4. Executes `<BarberHeader title="Dashboard" />`.
 * 5. Executes `<div className="p-4">`.
 * 6. Executes `<BarberInfoCard`.
 * 7. Executes `name="The Sharp Edge"`.
 * 8. Executes `address="123 Main St, Anytown"`.
 * 9. Executes `plan="Basic Plan"`.
 * 10. Executes `imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBIuaix6f85NyYrrU_wfJSOZHrWu8VmEe4YSYkexd1sIlqk2p255iP0T_NupTHqn1LTTl-vSmPs6...`.
 * 11. Executes `/>`.
 * 12. Executes `<div className="flex gap-3 py-3 justify-between">`.
 * 13. Executes `<button className="flex-1 h-10 rounded-xl bg-[#f2800d] text-sm font-bold">`.
 * 14. Executes `Upgrade Plan`.
 * 15. Executes `</button>`.
 * 16. Executes `<button className="flex-1 h-10 rounded-xl bg-[#f5f2f0] text-sm font-bold">`.
 * 17. Executes `View Details`.
 * 18. Executes `</button>`.
 * 19. Executes `</div>`.
 * 20. Executes `<BarberRating rating={4.8} totalReviews={234} />`.
 * 21. Executes `</div>`.
 * 22. Executes `<div className="px-4 pb-3">`.
 * 23. Executes `<h2 className="text-[22px] font-bold mb-3">Gallery</h2>`.
 * 24. Executes `<BarberGallery />`.
 * 25. Executes `</div>`.
 * 26. Executes `</div>`.
 * 27. Executes `<BottomNav items={barberNavItems} activeItem="Home" />`.
 * 28. Executes `</div>`.
 * 29. Executes `);`.
 */
export default function BarberDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#181411] justify-between font-inter">
      <div>
        <BarberHeader title="Dashboard" />

        <div className="p-4">
          <BarberInfoCard
            name="The Sharp Edge"
            address="123 Main St, Anytown"
            plan="Basic Plan"
            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBIuaix6f85NyYrrU_wfJSOZHrWu8VmEe4YSYkexd1sIlqk2p255iP0T_NupTHqn1LTTl-vSmPs6IfnnXfjnWpvIole60IiOG9GY3tZ8pLr2YXBxmm4M9PbUynte7WkYWiVhVaNSP4LN2qfzRxyRg2sv4IrDoc7HPSeReKoOFx_jjKUhe7alyXAd6tz-PYFZNm8a8M7TsPQtW_BXvh8sDSKL8xJv4pg4ezIgqhQbiHgIDxs_smn6hvgtW8nQG5nDQ6K97ny7ckZIO6i"
          />

          <div className="flex gap-3 py-3 justify-between">
            <button className="flex-1 h-10 rounded-xl bg-[#f2800d] text-sm font-bold">
              Upgrade Plan
            </button>
            <button className="flex-1 h-10 rounded-xl bg-[#f5f2f0] text-sm font-bold">
              View Details
            </button>
          </div>

          <BarberRating rating={4.8} totalReviews={234} />
        </div>

        <div className="px-4 pb-3">
          <h2 className="text-[22px] font-bold mb-3">Gallery</h2>
          <BarberGallery />
        </div>
      </div>

      <BottomNav items={barberNavItems} activeItem="Home" />
    </div>
  );
}
