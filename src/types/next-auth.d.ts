import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  }

  interface Session {
    user: User;
  }
}
