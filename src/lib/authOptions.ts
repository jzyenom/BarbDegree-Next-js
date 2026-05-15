import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/database/dbConnect";
import {
  getAuthBaseUrl,
  getGoogleOAuthConfig,
  getNextAuthSecret,
} from "@/lib/env";
import User from "@/models/User";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_SALT_ROUNDS = 10;

const authBaseUrl = getAuthBaseUrl() ?? "http://localhost:3000";
const authSecret = getNextAuthSecret();
const googleOAuth = getGoogleOAuthConfig();

function redactEmail(email?: string | null): string | null {
  if (!email) {
    return null;
  }

  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) {
    return email;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function mapErrorToLogMetadata(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { error };
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      intent: { label: "Intent", type: "text" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password?.trim() ?? "";
      const intent = credentials?.intent === "signup" ? "signup" : "signin";

      console.log("[auth][credentials] Authorize called for", redactEmail(email), "intent:", intent);

      if (
        !email ||
        !EMAIL_PATTERN.test(email) ||
        password.length < 8 ||
        password.length > 72
      ) {
        console.warn("[auth][credentials] Rejected invalid credential payload.", {
          email: redactEmail(email),
          intent,
          passwordLength: password.length,
        });
        return null;
      }

      try {
        await connectToDatabase();
      } catch (error) {
        console.error("[auth][credentials] Database unavailable during authorize.", {
          email: redactEmail(email),
          intent,
          ...mapErrorToLogMetadata(error),
        });
        throw new Error("AUTH_DATABASE_ERROR");
      }

      let existingUser: InstanceType<typeof User> | null = null;

      try {
        existingUser = await User.findOne({ email }).select("+password");
      } catch (error) {
        console.error("[auth][credentials] Failed to load user record.", {
          email: redactEmail(email),
          intent,
          ...mapErrorToLogMetadata(error),
        });
        throw new Error("AUTH_DATABASE_ERROR");
      }

      if (!existingUser) {
        if (intent !== "signup") {
          console.log("[auth][credentials] Signin failed: user not found");
          console.info("[auth][credentials] Sign-in failed because user was not found.", {
            email: redactEmail(email),
          });
          return null;
        }
        console.log("[auth][credentials] Creating user for", redactEmail(email));

        const derivedName = email.split("@")[0];
        const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

        try {
          const createdUser = await User.create({
            email,
            name: derivedName,
            password: hashedPassword,
          });

          console.log("[auth][credentials] Authorize success for", redactEmail(email));
          return {
            id: createdUser._id.toString(),
            email: createdUser.email,
            name: createdUser.name || null,
            image: createdUser.avatar || null,
            role: createdUser.role,
          };
        } catch (error) {
          if (isDuplicateKeyError(error)) {
            console.warn("[auth][credentials] Duplicate signup detected.", {
              email: redactEmail(email),
            });
            return null;
          }

          console.error("[auth][credentials] Failed to create user during signup.", {
            email: redactEmail(email),
            ...mapErrorToLogMetadata(error),
          });
          throw new Error("AUTH_DATABASE_ERROR");
        }
      }

      if (!existingUser.password) {
        console.log("[auth][credentials] Signin blocked: passwordless account");
        console.info("[auth][credentials] Sign-in blocked for passwordless account.", {
          email: redactEmail(email),
        });
        return null;
      }

      const isValid = await bcrypt.compare(password, existingUser.password);
      if (!isValid) {
        console.log("[auth][credentials] Signin failed: password mismatch");
        console.info("[auth][credentials] Sign-in failed because password mismatch.", {
          email: redactEmail(email),
        });
        return null;
      }

      console.log("[auth][credentials] Authorize success for", redactEmail(email));
      return {
        id: existingUser._id.toString(),
        email: existingUser.email,
        name: existingUser.name || null,
        image: existingUser.avatar || null,
        role: existingUser.role,
      };
    },
  }),
];

if (googleOAuth.enabled) {
  providers.unshift(
    GoogleProvider({
      clientId: googleOAuth.clientId!,
      clientSecret: googleOAuth.clientSecret!,
    })
  );
}

console.info("[auth] Initializing auth configuration.", {
  authBaseUrl: authBaseUrl ?? "auto",
  googleEnabled: googleOAuth.enabled,
  nodeEnv: process.env.NODE_ENV,
});

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  debug: process.env.NODE_ENV !== "production",
  providers,
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
  logger: {
    error(code, metadata) {
      console.error(`[next-auth][${code}]`, metadata);
    },
    warn(code) {
      console.warn(`[next-auth][${code}]`);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== "production") {
        console.debug(`[next-auth][${code}]`, metadata);
      }
    },
  },
  callbacks: {
    async signIn({ user, account, email, credentials }) {
      const provider = account?.provider ?? "unknown";
      const callbackEmail = typeof email === "string" ? email : undefined;
      const credentialEmail =
        credentials &&
        typeof credentials === "object" &&
        "email" in credentials &&
        typeof credentials.email === "string"
          ? credentials.email
          : undefined;
      const authEmail = (callbackEmail || credentialEmail || user.email)?.trim().toLowerCase();

      console.log("[auth] signIn called for provider:", provider, "email:", redactEmail(authEmail));

      if (!authEmail) {
        console.warn("[auth] Blocked sign-in because provider returned no email.", {
          provider,
        });
        return false;
      }

      if (provider === "credentials") {
        return true;
      }

      try {
        await connectToDatabase();

        const existingUser = await User.findOne({ email: authEmail }).select("_id role");

        if (!existingUser) {
          console.log("[auth] Creating user for OAuth", redactEmail(authEmail));
          const createdUser = await User.create({
            name: user.name ?? authEmail.split("@")[0],
            email: authEmail,
            avatar: user.image,
          });

          user.id = createdUser._id.toString();
          user.role = createdUser.role;
        } else {
          console.log("[auth] OAuth signin for existing user", redactEmail(authEmail));
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
        }

        return true;
      } catch (error) {
        console.error("[auth] Failed to sync OAuth user with the database.", {
          email: redactEmail(authEmail),
          provider,
          ...mapErrorToLogMetadata(error),
        });
        throw new Error("AUTH_DATABASE_ERROR");
      }
    },
    async jwt({ token, user }) {
      const email = (user?.email ?? token.email)?.trim().toLowerCase();

      if (!email) {
        return token;
      }

      token.email = email;

      if (user?.id) {
        token.sub = user.id;
      }

      if (user?.role) {
        token.role = user.role;
      }

      try {
        await connectToDatabase();
        const dbUser = await User.findOne({ email }).select("_id role");

        if (dbUser) {
          token.sub = dbUser._id.toString();
          token.role = dbUser.role;
        }
      } catch (error) {
        console.error("[auth][jwt] Failed to hydrate token from the database.", {
          email: redactEmail(email),
          ...mapErrorToLogMetadata(error),
        });
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      if (typeof token.email === "string") {
        session.user.email = token.email;
      }

      if (typeof token.sub === "string") {
        session.user.id = token.sub;
      }

      if (typeof token.role === "string") {
        session.user.role = token.role;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      const resolvedBaseUrl = authBaseUrl ?? baseUrl;
      const resolvedBaseOrigin = new URL(resolvedBaseUrl).origin;

      if (url.startsWith("/")) {
        return new URL(url, resolvedBaseUrl).toString();
      }

      try {
        const callbackUrl = new URL(url);

        if (callbackUrl.origin === resolvedBaseOrigin) {
          return callbackUrl.toString();
        }
      } catch {
        console.warn("[auth] Rejected malformed callback URL.", { url });
      }

      return new URL("/auth/redirect", resolvedBaseUrl).toString();
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
