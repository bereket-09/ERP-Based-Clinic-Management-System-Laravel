import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no Prisma / Node APIs). Shared by the middleware and
 * the full server config in `auth.ts`. The credential providers — which touch
 * the database — are added only in `auth.ts`, which runs on the Node runtime.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.kind = user.kind ?? "staff";
        token.role = user.role ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? session.user.id;
        session.user.kind = (token.kind as "staff" | "student") ?? "staff";
        session.user.role = (token.role as never) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
