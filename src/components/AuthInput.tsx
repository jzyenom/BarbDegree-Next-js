import { LucideIcon } from "lucide-react";

interface AuthInputProps {
  name?: string;
  type: string;
  placeholder: string;
  icon?: LucideIcon;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


export default function AuthInput({
  name,
  type,
  placeholder,
  icon: Icon,
  value,
  onChange,
}: AuthInputProps) {
  return (
    <div className="relative">
      {/* show an input field */}
      <input
        value={value}
        name={name}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl bg-[#f4ece6] px-4 pr-11 text-[#1c130d] placeholder:text-[#9e6b47] focus:outline-none"
      />
      {Icon && (
        <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9e6b47]" size={18} />
      )}
    </div>
  );
}
