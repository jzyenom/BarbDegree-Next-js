interface FilterPillProps {
  label: string;
}

export default function FilterPill({ label }: FilterPillProps) {
  return (
    <div className="flex h-8 items-center justify-center rounded-lg bg-[#f5f2f0] px-4">
      <p className="text-[#181411] text-sm font-medium">{label}</p>
    </div>
  );
}
