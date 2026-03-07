/**
 * AUTO-FILE-COMMENT: src/components/layouts/AuthLayout.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import AuthHeader from "../AuthHeader";
import AuthFooter from "../AuthFooter";
import { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footerText?: string;
  footerLink?: string;
  footerLinkText?: string;
}

/**
 * AUTO-FUNCTION-COMMENT: AuthLayout
 * Purpose: Handles auth layout.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="min-h-screen flex flex-col justify-between bg-[#fcfaf8] text-[#1c130d] font-inter">`.
 * 3. Executes `<AuthHeader title={title} />`.
 * 4. Executes `<main className="flex flex-col items-center w-full px-4">{children}</main>`.
 * 5. Executes `<AuthFooter`.
 * 6. Executes `text={footerText}`.
 * 7. Executes `link={footerLink}`.
 * 8. Executes `linkText={footerLinkText}`.
 * 9. Executes `/>`.
 * 10. Executes `</div>`.
 * 11. Executes `);`.
 */
export default function AuthLayout({
  title,
  children,
  footerText,
  footerLink,
  footerLinkText,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcfaf8] text-[#1c130d] font-inter">
      <AuthHeader title={title} />
      <main className="flex flex-col items-center w-full px-4">{children}</main>
      <AuthFooter
        text={footerText}
        link={footerLink}
        linkText={footerLinkText}
      />
    </div>
  );
}
