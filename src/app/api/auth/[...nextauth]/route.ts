/**
 * AUTO-FILE-COMMENT: src/app/api/auth/[...nextauth]/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Extend Session user type to include id and role
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
