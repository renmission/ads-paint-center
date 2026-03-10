import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "administrator" | "staff";
    } & DefaultSession["user"];
  }

  interface User {
    role: "administrator" | "staff";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "administrator" | "staff";
  }
}
