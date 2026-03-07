/**
 * AUTO-FILE-COMMENT: src/components/AuthInput.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { LucideIcon } from "lucide-react";

interface AuthInputProps {
  name?: string;
  type: string;
  placeholder: string;
  icon?: LucideIcon;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * AUTO-FUNCTION-COMMENT: AuthInput
 * Purpose: Handles auth input.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="relative">`.
 * 3. Executes `<input`.
 * 4. Executes `value={value}`.
 * 5. Executes `name={name}`.
 * 6. Executes `onChange={onChange}`.
 * 7. Executes `type={type}`.
 * 8. Executes `placeholder={placeholder}`.
 * 9. Executes `className="w-full h-14 rounded-xl bg-[#f4ece6] text-[#1c130d] placeholder:text-[#9e6b47] px-4 focus:outline-none"`.
 * 10. Executes `/>`.
 * 11. Executes `{Icon && (`.
 * 12. Executes `<Icon className="absolute right-4 top-4 text-[#9e6b47]" size={20} />`.
 * 13. Executes `)}`.
 * 14. Executes `</div>`.
 * 15. Executes `);`.
 */
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
