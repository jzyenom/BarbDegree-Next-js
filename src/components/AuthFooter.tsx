// load the link component
import Link from "next/link";

// define the footer inputs
interface AuthFooterProps {
  // store the footer message
  text?: string;
  // store the link path
  link?: string;
  // store the link label
  linkText?: string;
}

export default function AuthFooter({ text, link, linkText }: AuthFooterProps) {
  // return empty spacing when no text exists
  if (!text) return <div className="h-3 bg-[#fcfaf8]" />;

  // show the footer content
  return (
    // render footer section
    <footer className="safe-bottom py-2">
      {/* show footer text */}
      <p className="text-[#9e6b47] text-sm text-center underline">
        {/* display text content */}
        {text}{" "}
        {/* check if link content exists */}
        {link && linkText && (
          <Link href={link} className="hover:text-[#f96b06] font-medium">
            {/* display link text */}
            {linkText}
          </Link>
        )}
      </p>
    </footer>
  );
}
