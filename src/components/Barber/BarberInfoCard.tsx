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
