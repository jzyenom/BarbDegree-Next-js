/**
 * AUTO-FILE-COMMENT: src/components/AuthFooter.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import Link from "next/link";

interface AuthFooterProps {
  text?: string;
  link?: string;
  linkText?: string;
}

/**
 * AUTO-FUNCTION-COMMENT: AuthFooter
 * Purpose: Handles auth footer.
 * Line-by-line:
 * 1. Executes `if (!text) return <div className="h-6 bg-[#fcfaf8]" />;`.
 * 2. Executes `return (`.
 * 3. Executes `<footer className="py-4">`.
 * 4. Executes `<p className="text-[#9e6b47] text-sm text-center underline">`.
 * 5. Executes `{text}{" "}`.
 * 6. Executes `{link && linkText && (`.
 * 7. Executes `<Link href={link} className="hover:text-[#f96b06] font-medium">`.
 * 8. Executes `{linkText}`.
 * 9. Executes `</Link>`.
 * 10. Executes `)}`.
 * 11. Executes `</p>`.
 * 12. Executes `</footer>`.
 * 13. Executes `);`.
 */
export default function AuthFooter({ text, link, linkText }: AuthFooterProps) {
  if (!text) return <div className="h-6 bg-[#fcfaf8]" />;

  return (
    <footer className="py-4">
      <p className="text-[#9e6b47] text-sm text-center underline">
        {text}{" "}
        {link && linkText && (
          <Link href={link} className="hover:text-[#f96b06] font-medium">
            {linkText}
          </Link>
        )}
      </p>
    </footer>
  );
}
