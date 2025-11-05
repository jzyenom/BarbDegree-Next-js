import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";

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

// Validate required env variables at module initialization to avoid passing undefined to NextAuth
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Missing required environment variables: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET"
  );
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      // Use non-null assertion because we've validated the env vars above
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await connectToDatabase();
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          avatar: user.image,
        });
      }
      return true;
    },
    async session({ session }) {
      await connectToDatabase();
      const dbUser = await User.findOne({ email: session.user?.email });
      if (session.user && dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.role = dbUser.role;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
