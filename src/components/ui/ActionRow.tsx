import { FileText } from "lucide-react";

interface ActionRowProps {
  label: string;
  onClick?: () => void;
}

export default function ActionRow({ label, onClick }: ActionRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 bg-white px-4 min-h-14 w-full"
    >
      <div className="flex items-center justify-center size-10 rounded-lg bg-[#f5f2f0]">
        <FileText size={20} className="text-[#181411]" />
      </div>

      <p className="text-[#181411] text-base flex-1 truncate">{label}</p>
    </button>
  );
}
