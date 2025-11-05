import { SlidersHorizontal, MapPin, Star, Tag, ChevronDown } from "lucide-react";

export default function FilterChips() {
  const filters = [
    { icon: SlidersHorizontal, label: "Filters" },
    { icon: MapPin, label: "Location", dropdown: true },
    { icon: Star, label: "Rating", dropdown: true },
    { icon: Tag, label: "Price", dropdown: true },
  ];

  return (
    <div className="flex gap-3 px-4 overflow-x-auto pb-2">
      {filters.map(({ icon: Icon, label, dropdown }) => (
        <button
          key={label}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-content-light dark:bg-content-dark shadow-sm whitespace-nowrap"
        >
          <Icon size={18} className="text-gray-500" />
          <p className="text-sm font-medium">{label}</p>
          {dropdown && <ChevronDown size={18} className="text-gray-500" />}
        </button>
      ))}
    </div>
  );
}
