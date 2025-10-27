// This new file contains your core NextAuth v5 configuration.

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Configure the Prisma adapter
  adapter: PrismaAdapter(prisma),

  // Configure one or more providers
  providers: [
    Credentials({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'user@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // This is where you retrieve the user from the database and check the password.
        // credentials object is already parsed and validated by Zod
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        // If no user is found, or if the user doesn't have a hashed password
        // (e.g., they signed up with OAuth), throw an error.
        if (!user || !user.hashedPassword) {
          throw new Error('Invalid credentials');
        }

        // Check if the passwords match
        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        // If everything is correct, return the user object.
        // NextAuth will then create a session.
        return user;
      },
    }),
    // ...add more providers here if you want (e.g., Google, GitHub)
  ],

  // Configure session strategy
  session: {
    strategy: 'jwt',
  },

  // Secret for JWT
  secret: process.env.NEXTAUTH_SECRET, // Make sure to set this in your .env file

  // Custom pages
  pages: {
    signIn: '/', // We'll show the login form on the homepage
  },

  // Debugging
  debug: process.env.NODE_ENV === 'development',
});
