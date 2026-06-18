import { ReactNode } from "react";

// interface DetailRowProps {
//   icon: ReactNode;
//   label: string;
//   value: string;
// }

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



export default function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-h-14 items-center gap-3 bg-white px-4 py-1.5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f5f2f0] text-[#181411]">
        {icon}
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        {/* show text */}
        <p className="text-sm font-medium text-[#181411]">{label}</p>
        {/* show text */}
        <p className="break-words text-xs text-[#8a7560]">{value}</p>
      </div>
    </div>
  );
}
