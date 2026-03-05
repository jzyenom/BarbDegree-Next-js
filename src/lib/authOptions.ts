import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password;

      if (
        !email ||
        !password ||
        !EMAIL_PATTERN.test(email) ||
        password.length < 8 ||
        password.length > 72
      ) {
        return null;
      }

      await connectToDatabase();

      const existingUser = await User.findOne({ email }).select("+password");

      if (!existingUser) {
        const derivedName = email.split("@")[0];
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await User.create({
          email,
          name: derivedName,
          password: hashedPassword,
        });

        return {
          id: createdUser._id.toString(),
          email: createdUser.email,
          name: createdUser.name || null,
          image: createdUser.avatar || null,
        };
      }

      if (!existingUser.password) {
        return null;
      }

      const isValid = await bcrypt.compare(password, existingUser.password);
      if (!isValid) {
        return null;
      }

      return {
        id: existingUser._id.toString(),
        email: existingUser.email,
        name: existingUser.name || null,
        image: existingUser.avatar || null,
      };
    },
  }),
];

if (googleClientId && googleClientSecret) {
  providers.unshift(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers,

  callbacks: {
    async signIn({ user }) {
      await connectToDatabase();

      const email = user.email?.toLowerCase();
      if (!email) {
        return false;
      }

      const exists = await User.findOne({ email });
      if (!exists) {
        await User.create({
          name: user.name,
          email,
          avatar: user.image,
        });
      }
      return true;
    },

    async session({ session }) {
      await connectToDatabase();
      const email = session.user?.email?.toLowerCase();
      const dbUser = email ? await User.findOne({ email }) : null;

      if (dbUser && session.user) {
        session.user.id = dbUser._id.toString();
        session.user.role = dbUser.role;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login", // redirect here for unauthenticated
  },
};
