// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Path is 1 level up (from login to app, then into components)
import AuthForm from '../components/AuthForm'; 

// --- Helper to render the Authenticated State ---
const AuthenticatedContent = ({ session, signOut }: { session: any, signOut: any }) => (
  <div className="flex min-h-screen flex-col items-center justify-center space-y-6 text-gray-900">
    <h1 className="text-3xl font-bold">
      Welcome, {session.user?.name || session.user?.email}
    </h1>
    <p>You are signed in.</p>
    <Link href="/dashboard" className="text-blue-600 hover:underline">
        Go to Dashboard
    </Link>
    <button
      onClick={() => signOut({ callbackUrl: '/login' })} // Redirect to this page
      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
    >
      Sign Out
    </button>
  </div>
);

// --- Login Handler (The core of the component) ---
export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value;
    const password = target.password.value;

    if (!email || !password) {
        setError("Email and password are required.");
        return;
    }

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else if (result?.ok) {
      router.push('/dashboard');
    } else {
      setError('Login failed. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-900">
        Loading...
      </div>
    );
  }

  if (session) {
    return <AuthenticatedContent session={session} signOut={signOut} />;
  }

  // Show Login Form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        
        <AuthForm onSubmit={handleLogin} />

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <p className="text-center text-sm text-gray-600">
          Don't have an account?
          <Link
            href="/register" // Link to the dedicated register page
            className="ml-1 font-medium text-blue-600 hover:text-blue-500"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}