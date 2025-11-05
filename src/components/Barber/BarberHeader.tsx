import { ArrowLeft } from "lucide-react";

export default function BarberHeader({ title }: { title: string }) {
  return (
    <div className="mt-5">
      <header className="flex items-center bg-white p-4 pb-2 justify-between border-b border-gray-100">
        <button className="text-[#181411] flex items-center justify-center">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold flex-1 text-center pr-12">{title}</h1>
      </header>
    </div>
  );
}
