import { Search } from "lucide-react";

export default function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="px-4">
      <div className="flex items-center h-14 bg-content-light dark:bg-content-dark rounded-lg shadow-sm">
        <div className="pl-4 text-gray-500">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 px-2 bg-transparent focus:outline-none text-sm"
        />
      </div>
    </div>
  );
}
