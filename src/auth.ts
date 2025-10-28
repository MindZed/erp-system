// src/auth.ts

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { NextAuthConfig } from 'next-auth';
import { UserRole } from '@prisma/client'; 
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";


export const authOptions: NextAuthConfig = {
  // Configure the Prisma adapter
  adapter: PrismaAdapter(prisma),

  // Configure one or more providers
  providers: [
    Credentials({
      name: 'Credentials',
      // Define the expected fields for Auth.js to parse the request body/form data
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        
        // 1. Basic validation and type check
        if (
          !credentials ||
          typeof credentials.email !== 'string' ||
          typeof credentials.password !== 'string'
        ) {
          // Throwing an error here ensures the client-side error message is triggered
          throw new Error('Invalid credentials format');
        }

        const email = credentials.email;
        const password = credentials.password;
        
        // 2. Find the user in the database
        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        // 3. Check if user exists or has a password set
        if (!user || !user.hashedPassword) {
          throw new Error('Invalid credentials');
        }

        // 4. Compare the passwords securely
        const passwordsMatch = await bcrypt.compare(
          password,
          user.hashedPassword
        );

        if (!passwordsMatch) {
          throw new Error('Invalid credentials');
        }

        // 5. Success! Return the user object.
        return user;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },
  
  secret: process.env.AUTH_SECRET, 
  
  pages: {
    signIn: '/login', // Official login page for the ERP
  },

  callbacks: {
    // 1. JWT Callback: Adds custom user data (id and role) to the encrypted token
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; 
      }
      return token;
    },
    // 2. Session Callback: Exposes the data from the JWT to the client/server session object
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as UserRole; 
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

// Export the necessary Auth.js functions and handlers
export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);