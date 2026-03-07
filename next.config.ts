/**
 * AUTO-FILE-COMMENT: next.config.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  /**
   * AUTO-FUNCTION-COMMENT: headers
   * Purpose: Handles headers.
   * Line-by-line:
   * 1. Executes `const securityHeaders = [`.
   * 2. Executes `{ key: "X-Frame-Options", value: "DENY" },`.
   * 3. Executes `{ key: "X-Content-Type-Options", value: "nosniff" },`.
   * 4. Executes `{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },`.
   * 5. Executes `{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },`.
   * 6. Executes `{ key: "Cross-Origin-Opener-Policy", value: "same-origin" },`.
   * 7. Executes `{ key: "Cross-Origin-Resource-Policy", value: "same-origin" },`.
   * 8. Executes `];`.
   * 9. Executes `if (process.env.NODE_ENV === "production") {`.
   * 10. Executes `securityHeaders.push({`.
   * 11. Executes `key: "Strict-Transport-Security",`.
   * 12. Executes `value: "max-age=63072000; includeSubDomains; preload",`.
   * 13. Executes `});`.
   * 14. Executes `}`.
   * 15. Executes `return [`.
   * 16. Executes `{`.
   * 17. Executes `source: "/(.*)",`.
   * 18. Executes `headers: securityHeaders,`.
   * 19. Executes `},`.
   * 20. Executes `];`.
   */
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    ];

    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
