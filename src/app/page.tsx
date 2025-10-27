'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// A simple form component
const AuthForm = ({
  isSignUp = false,
  onSubmit,
}: {
  isSignUp?: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-white p-8 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h2>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {isSignUp ? 'Create Account' : 'Sign In'}
      </button>
    </form>
  );
};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // --- Handle Login ---
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value;
    const password = target.password.value;

    const result = await signIn('credentials', {
      redirect: false, // We'll handle redirect manually
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else if (result?.ok) {
      router.push('/dashboard'); // Redirect to a dashboard page on success
    }
  };

  // --- Handle Sign Up ---
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value;
    const password = target.password.value;

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Automatically sign in the user after successful registration
        // We pass the event object directly
        await handleLogin(e);
      } else {
        const data = await res.json();
        setError(data.message || 'Something went wrong during sign-up.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // --- Show authenticated state ---
  if (session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-6">
        <h1 className="text-3xl font-bold">
          Welcome, {session.user?.email}
        </h1>
        <p>You are signed in.</p>
        <button
          onClick={() => signOut()}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // --- Show Login/Sign Up forms ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        {isSigningUp ? (
          <AuthForm isSignUp onSubmit={handleSignUp} />
        ) : (
          <AuthForm onSubmit={handleLogin} />
        )}

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <p className="text-center text-sm text-gray-600">
          {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => {
              setIsSigningUp(!isSigningUp);
              setError(null); // Clear errors when switching forms
            }}
            className="ml-1 font-medium text-blue-600 hover:text-blue-500"
          >
            {isSigningUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

