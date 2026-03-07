/**
 * AUTO-FILE-COMMENT: src/components/Barber/BarberInfoCard.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
// interface Props {
//   name: string;
//   address: string;
//   plan: string;
//   imageUrl: string;
// }

// export default function BarberInfoCard({ name, address, plan, imageUrl }: Props) {
//   return (
//     <div className="flex gap-4 items-center">
//       <div
//         className="bg-cover bg-center rounded-xl w-32 h-32 flex-shrink-0"
//         style={{ backgroundImage: `url(${imageUrl})` }}
//       />
//       <button
//   onClick={() => signOut({ callbackUrl: "/login" })}
//   className="text-red-500"
// >
//   Logout
// </button>

//       <div>
//         <p className="text-[22px] font-bold">{name}</p>
//         <p className="text-[#8a7560]">{address}</p>
//         <p className="text-[#8a7560]">{plan}</p>
//       </div>
//     </div>
//   );
// }

"use client";

import { signOut } from "next-auth/react";

interface Props {
  name: string;
  address: string;
  plan: string;
  imageUrl: string;
}

/**
 * AUTO-FUNCTION-COMMENT: BarberInfoCard
 * Purpose: Handles barber info card.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="flex gap-4 items-center">`.
 * 3. Executes `<div`.
 * 4. Executes `className="bg-cover bg-center rounded-xl w-32 h-32 flex-shrink-0"`.
 * 5. Executes `style={{ backgroundImage: \`url(${imageUrl})\` }}`.
 * 6. Executes `/>`.
 * 7. Executes `<div>`.
 * 8. Executes `<p className="text-[22px] font-bold">{name}</p>`.
 * 9. Executes `<p className="text-[#8a7560]">{address}</p>`.
 * 10. Executes `<p className="text-[#8a7560]">{plan}</p>`.
 * 11. Executes `</div>`.
 * 12. Executes `<button`.
 * 13. Executes `onClick={() => signOut({ callbackUrl: "/login" })}`.
 * 14. Executes `className="ml-auto px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition"`.
 * 15. Executes `>`.
 * 16. Executes `Logout`.
 * 17. Executes `</button>`.
 * 18. Executes `</div>`.
 * 19. Executes `);`.
 */
export default function BarberInfoCard({ name, address, plan, imageUrl }: Props) {
  return (
    <div className="flex gap-4 items-center">
      <div
        className="bg-cover bg-center rounded-xl w-32 h-32 flex-shrink-0"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      <div>
        <p className="text-[22px] font-bold">{name}</p>
        <p className="text-[#8a7560]">{address}</p>
        <p className="text-[#8a7560]">{plan}</p>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="ml-auto px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
