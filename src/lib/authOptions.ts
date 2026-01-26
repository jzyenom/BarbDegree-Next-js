// import GoogleProvider from "next-auth/providers/google";
// import type { NextAuthOptions } from "next-auth";
// import connectToDatabase from "@/database/dbConnect";
// import User from "@/models/User";

// // Validate required env variables
// if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
//   throw new Error("Missing Google Auth environment variables");
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],

//   callbacks: {
//     // CREATE USER IF NOT IN DB
//     async signIn({ user }) {
//       await connectToDatabase();

//       const exists = await User.findOne({ email: user.email });
//       if (!exists) {
//         await User.create({
//           name: user.name,
//           email: user.email,
//           avatar: user.image,
//         });
//       }
//       return true;
//     },

//     // ATTACH DB USER ID + ROLE TO SESSION
//     // async session({ session }) {
//     //   await connectToDatabase();
//     //   const dbUser = await User.findOne({ email: session.user?.email });

//     //   if (dbUser && session.user) {
//     //     session.user.id = dbUser._id.toString();
//     //     session.user.role = dbUser.role;
//     //   }

//     //   return session;
//     // },

//     async session({ session, trigger }) {
//   await connectToDatabase();

//   // Always fetch fresh user data from DB
//   const dbUser = await User.findOne({ email: session.user?.email });

//   if (dbUser && session.user) {
//     session.user.id = dbUser._id.toString();
//     session.user.role = dbUser.role;
//   }

//   return session;
// }

//   },
// };

import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google Auth environment variables");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      await connectToDatabase();

      const exists = await User.findOne({ email: user.email });
      if (!exists) {
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

