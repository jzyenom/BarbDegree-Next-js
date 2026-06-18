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
    <div className="mobile-screen mobile-shell flex flex-col justify-between bg-[#fcfaf8] text-[#1c130d] font-inter">
      <AuthHeader title={title} />
      {/* show main content */}
      <main className="mobile-scroll flex w-full flex-col items-center px-4">{children}</main>
      <AuthFooter
        text={footerText}
        link={footerLink}
        linkText={footerLinkText}
      />
    </div>
  );
}
