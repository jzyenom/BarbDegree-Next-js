import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

const handler = NextAuth(authOptions);

// NextAuth needs to receive the App Router request directly. Wrapping it here
// causes NextAuth v4 to fall back to a Pages API request shape and read req.query.
export { handler as GET, handler as POST };
