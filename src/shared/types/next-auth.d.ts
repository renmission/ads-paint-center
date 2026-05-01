import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "administrator" | "staff" | "customer";
    } & DefaultSession["user"];
  }

  interface User {
    role: "administrator" | "staff" | "customer";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "administrator" | "staff" | "customer";
  }
}
