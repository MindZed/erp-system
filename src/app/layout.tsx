// The root layout file where we'll use the AuthProvider.

import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import localFont from "next/font/local";

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
      </body>
    </html>
  );
}
