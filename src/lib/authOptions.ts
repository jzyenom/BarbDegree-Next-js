/**
 * AUTO-FILE-COMMENT: src/lib/authOptions.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
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
      intent: { label: "Intent", type: "text" },
    },
    /**
     * AUTO-FUNCTION-COMMENT: authorize
     * Purpose: Handles authorize.
     * Line-by-line:
     * 1. Executes `const email = credentials?.email?.trim().toLowerCase();`.
     * 2. Executes `const password = credentials?.password;`.
     * 3. Executes `const intent = credentials?.intent === "signup" ? "signup" : "signin";`.
     * 4. Executes `if (`.
     * 5. Executes `!email ||`.
     * 6. Executes `!password ||`.
     * 7. Executes `!EMAIL_PATTERN.test(email) ||`.
     * 8. Executes `password.length < 8 ||`.
     * 9. Executes `password.length > 72`.
     * 10. Executes `) {`.
     * 11. Executes `return null;`.
     * 12. Executes `}`.
     * 13. Executes `await connectToDatabase();`.
     * 14. Executes `const existingUser = await User.findOne({ email }).select("+password");`.
     * 15. Executes `if (!existingUser) {`.
     * 16. Executes `if (intent !== "signup") {`.
     * 17. Executes `return null;`.
     * 18. Executes `}`.
     * 19. Executes `const derivedName = email.split("@")[0];`.
     * 20. Executes `const hashedPassword = await bcrypt.hash(password, 10);`.
     * 21. Executes `const createdUser = await User.create({`.
     * 22. Executes `email,`.
     * 23. Executes `name: derivedName,`.
     * 24. Executes `password: hashedPassword,`.
     * 25. Executes `});`.
     * 26. Executes `return {`.
     * 27. Executes `id: createdUser._id.toString(),`.
     * 28. Executes `email: createdUser.email,`.
     * 29. Executes `name: createdUser.name || null,`.
     * 30. Executes `image: createdUser.avatar || null,`.
     * 31. Executes `};`.
     * 32. Executes `}`.
     * 33. Executes `if (!existingUser.password) {`.
     * 34. Executes `return null;`.
     * 35. Executes `}`.
     * 36. Executes `const isValid = await bcrypt.compare(password, existingUser.password);`.
     * 37. Executes `if (!isValid) {`.
     * 38. Executes `return null;`.
     * 39. Executes `}`.
     * 40. Executes `return {`.
     * 41. Executes `id: existingUser._id.toString(),`.
     * 42. Executes `email: existingUser.email,`.
     * 43. Executes `name: existingUser.name || null,`.
     * 44. Executes `image: existingUser.avatar || null,`.
     * 45. Executes `};`.
     */
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password;
      const intent = credentials?.intent === "signup" ? "signup" : "signin";

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
        if (intent !== "signup") {
          return null;
        }

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
    /**
     * AUTO-FUNCTION-COMMENT: signIn
     * Purpose: Handles sign in.
     * Line-by-line:
     * 1. Executes `await connectToDatabase();`.
     * 2. Executes `const email = user.email?.toLowerCase();`.
     * 3. Executes `if (!email) {`.
     * 4. Executes `return false;`.
     * 5. Executes `}`.
     * 6. Executes `const exists = await User.findOne({ email });`.
     * 7. Executes `if (!exists) {`.
     * 8. Executes `await User.create({`.
     * 9. Executes `name: user.name,`.
     * 10. Executes `email,`.
     * 11. Executes `avatar: user.image,`.
     * 12. Executes `});`.
     * 13. Executes `}`.
     * 14. Executes `return true;`.
     */
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

    /**
     * AUTO-FUNCTION-COMMENT: session
     * Purpose: Handles session.
     * Line-by-line:
     * 1. Executes `await connectToDatabase();`.
     * 2. Executes `const email = session.user?.email?.toLowerCase();`.
     * 3. Executes `const dbUser = email ? await User.findOne({ email }) : null;`.
     * 4. Executes `if (dbUser && session.user) {`.
     * 5. Executes `session.user.id = dbUser._id.toString();`.
     * 6. Executes `session.user.role = dbUser.role;`.
     * 7. Executes `}`.
     * 8. Executes `return session;`.
     */
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
