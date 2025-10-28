// prisma.config.ts

import { defineConfig } from "prisma/config";
import { config } from "dotenv"; // Import the 'config' function
import { resolve } from "path"; // Used to build a reliable file path

// Explicitly load the .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

// 1. Get the URL from the environment
const databaseUrl = process.env.DATABASE_URL;

// 2. Check if it's undefined.
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in your .env.local file");
}

// Now, your defineConfig will work
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl, // This is now type-safe
  },
});