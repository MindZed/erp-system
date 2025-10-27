// src/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { NextAuthConfig } from 'next-auth'; // Import correct type
import { UserRole } from '@prisma/client'; // Assuming roles will be used
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";


export const authOptions: NextAuthConfig = { // Use NextAuthConfig
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // --- START DEBUG LOGGING ---
        console.log("--- AUTHORIZE FUNCTION START ---");
        console.log("Received credentials object:", credentials);

        if (
          !credentials ||
          typeof credentials.email !== 'string' ||
          typeof credentials.password !== 'string'
        ) {
          console.log("Authorize Error: Invalid credentials format or missing fields.");
          console.log("--- AUTHORIZE FUNCTION END (Error) ---");
          // Throwing error is better for Credentials provider
          throw new Error('Invalid credentials format');
        }

        const email = credentials.email;
        const password = credentials.password;

        console.log(`Attempting login for email: ${email}`);

        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user) {
          console.log("Authorize Error: User not found in database.");
          console.log("--- AUTHORIZE FUNCTION END (Error) ---");
          throw new Error('Invalid credentials'); // Use generic error
        }

        if (!user.hashedPassword) {
          console.log("Authorize Error: User found but has no hashedPassword field set.");
          console.log("--- AUTHORIZE FUNCTION END (Error) ---");
          throw new Error('Invalid credentials'); // Use generic error
        }

        console.log("Password from login form:", `"${password}"`); // Log with quotes
        console.log("Hashed password from DB:", `"${user.hashedPassword}"`); // Log with quotes

        const isCorrectPassword = await bcrypt.compare(
          password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          console.log("Password comparison FAILED.");
          console.log("--- AUTHORIZE FUNCTION END (Error) ---");
          throw new Error('Invalid credentials'); // Use generic error
        }

        console.log("Password comparison SUCCESS!");
        console.log("--- AUTHORIZE FUNCTION END (Success) ---");
        return user; // Return user object on success
        // --- END DEBUG LOGGING ---
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET, // Make sure this matches .env.local
  pages: {
    signIn: '/',
  },
  callbacks: {
    // Callbacks to include role/id (if using roles later)
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        // token.role = (user as any).role; // Uncomment if you add roles
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        // (session.user as any).role = token.role as UserRole; // Uncomment if you add roles
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);