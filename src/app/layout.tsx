// The root layout file where we'll use the AuthProvider.

import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";

const clashDisplay = localFont({
  src: "../fonts/ClashDisplay-Variable.ttf",
  variable: "--font-clash-display",
  weight: "200 300 400 500 600 700 800",
});

export const metadata: Metadata = {
  title: "Mindzed Infinity",
  description: "Built with Love",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clashDisplay.className}>
        <AuthProvider>
          <div className="min-h-screen">{children}</div>
        </AuthProvider>

        {/* ✅ Toast notifications */}
        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#f4f4f5",
              borderRadius: "8px",
              fontSize: "0.9rem",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#18181b" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#18181b" },
            },
          }}
        />
      </body>
    </html>
  );
}
