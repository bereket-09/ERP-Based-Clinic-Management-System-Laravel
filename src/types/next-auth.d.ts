import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

export type ActorKind = "staff" | "student";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      kind: ActorKind;
      role: Role | null;
    } & DefaultSession["user"];
  }

  interface User {
    kind?: ActorKind;
    role?: Role | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    kind?: ActorKind;
    role?: Role | null;
  }
}
