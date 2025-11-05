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
      <input
        value={value}
        name={name}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="w-full h-14 rounded-xl bg-[#f4ece6] text-[#1c130d] placeholder:text-[#9e6b47] px-4 focus:outline-none"
      />
      {Icon && (
        <Icon className="absolute right-4 top-4 text-[#9e6b47]" size={20} />
      )}
    </div>
  );
}
