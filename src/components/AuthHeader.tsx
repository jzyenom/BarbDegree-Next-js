import { ArrowLeft } from "lucide-react";


export default function AuthHeader({ title }: { title: string }) {
  return (
    // show the header
    <header className="safe-top flex items-center justify-between px-3 pb-1">
      <button className="flex size-10 items-center justify-center">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h2 className="flex-1 pr-10 text-center text-base font-bold">{title}</h2>
    </header>
  );
}
