import Link from "next/link";

interface AuthFooterProps {
  text?: string;
  link?: string;
  linkText?: string;
}

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
