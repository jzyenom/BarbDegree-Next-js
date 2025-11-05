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
