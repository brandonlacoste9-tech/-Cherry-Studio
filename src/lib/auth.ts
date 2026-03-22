/**
 * AdgenAI — NextAuth v5 Configuration
 *
 * Build-time safety strategy:
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth.js DrizzleAdapter(db) calls db[Symbol.for('drizzle')] or similar type
 * checks at initialization time. Passing a Proxy fails this check with:
 *   "Unsupported database type (object) in Auth.js Drizzle adapter."
 *
 * Solution: Create a REAL neon() + drizzle() instance specifically for the
 * adapter, but only when DATABASE_URL is present. At build time (no env vars),
 * we fall back to JWT-only sessions with no adapter — which is perfectly valid
 * for static page generation. The adapter is only needed at runtime for
 * persisting sessions to the database.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// ─── Lazy adapter factory ────────────────────────────────────────────────────
// Returns a real DrizzleAdapter instance only when DATABASE_URL is available.
// Returns undefined at build time so NextAuth falls back to JWT sessions.
function buildAdapter() {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  try {
    // Dynamic requires keep these imports out of the build-time module graph
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require("@neondatabase/serverless") as typeof import("@neondatabase/serverless");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/neon-http") as typeof import("drizzle-orm/neon-http");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DrizzleAdapter } = require("@auth/drizzle-adapter") as typeof import("@auth/drizzle-adapter");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const schema = require("@/lib/db/schema") as typeof import("@/lib/db/schema");

    const sql = neon(url);
    const adapterDb = drizzle(sql, { schema });
    return DrizzleAdapter(adapterDb) as NextAuthConfig["adapter"];
  } catch {
    // If anything fails (e.g. missing package at build time), degrade gracefully
    return undefined;
  }
}

// ─── Auth configuration ──────────────────────────────────────────────────────
const authConfig: NextAuthConfig = {
  // Adapter is undefined at build time → NextAuth uses JWT-only sessions.
  // At runtime DATABASE_URL is set → full Drizzle-backed sessions.
  adapter: buildAdapter(),

  session: { strategy: "jwt" },

  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Guard: if DB isn't available, deny login gracefully
        if (!process.env.DATABASE_URL) return null;

        try {
          // Import lazily so this never runs at build time
          const { db } = await import("@/lib/db");
          const { users } = await import("@/lib/db/schema");
          const { eq } = await import("drizzle-orm");

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!user || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
