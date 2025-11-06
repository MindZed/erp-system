// The root layout file where we'll use the AuthProvider.

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Assuming you have Tailwind CSS setup
import AuthProvider from './components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mindzed Infinity',
  description: 'Built with Love',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
