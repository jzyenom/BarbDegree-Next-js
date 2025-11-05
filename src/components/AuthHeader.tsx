import { ArrowLeft } from "lucide-react";

export default function AuthHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between p-4 pb-2">
      <button className="flex items-center justify-center size-12">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h2 className="flex-1 text-center pr-12 text-lg font-bold">{title}</h2>
    </header>
  );
}
