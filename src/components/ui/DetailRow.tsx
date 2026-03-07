import { ReactNode } from "react";

// interface DetailRowProps {
//   icon: ReactNode;
//   label: string;
//   value: string;
// }

// export default function DetailRow({ icon, label, value }: DetailRowProps) {
//   return (
//     <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
//       <div className="text-[#181411] flex items-center justify-center rounded-lg bg-[#f5f2f0] size-12">
//         {icon}
//       </div>
//       <div className="flex flex-col justify-center">
//         <p className="text-[#181411] text-base font-medium">{label}</p>
//         <p className="text-[#8a7560] text-sm">{value}</p>
//       </div>
//     </div>
//   );
// }


/**
 * AUTO-FUNCTION-COMMENT: DetailRow
 * Purpose: Handles detail row.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">`.
 * 3. Executes `<div className="text-[#181411] flex items-center justify-center rounded-lg bg-[#f5f2f0] size-12">`.
 * 4. Executes `{icon}`.
 * 5. Executes `</div>`.
 * 6. Executes `<div className="flex flex-col justify-center">`.
 * 7. Executes `<p className="text-[#181411] text-base font-medium">{label}</p>`.
 * 8. Executes `<p className="text-[#8a7560] text-sm">{value}</p>`.
 * 9. Executes `</div>`.
 * 10. Executes `</div>`.
 * 11. Executes `);`.
 */
export default function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
      <div className="text-[#181411] flex items-center justify-center rounded-lg bg-[#f5f2f0] size-12">
        {icon}
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-[#181411] text-base font-medium">{label}</p>
        <p className="text-[#8a7560] text-sm">{value}</p>
      </div>
    </div>
  );
}
