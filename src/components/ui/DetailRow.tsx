import { ReactNode } from "react";

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export default function DetailRow({ icon, label, value }: DetailRowProps) {
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
