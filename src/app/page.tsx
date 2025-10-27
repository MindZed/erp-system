// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link for dashboard navigation

// --- Sub-component: AuthForm ---
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
      className="space-y-4 bg-white p-8 rounded-lg shadow-md text-gray-900"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h2>

      {/* Name Field (only for sign up) */}
      {isSignUp && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          />
        </div>
      )}

      {/* Email Field */}
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
        />
      </div>

      {/* Password Field */}
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {isSignUp ? 'Create Account' : 'Sign In'}
      </button>
    </form>
  );
};

// --- Main Page Component ---
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

    // Client-side validation
    if (!email || !password) {
        setError("Email and password are required.");
        return;
    }

    const result = await signIn('credentials', {
      redirect: false, // Handle redirect manually
      email,
      password,
    });

    if (result?.error) {
      // Use the error message from Auth.js if available, otherwise default
      setError(result.error === 'CredentialsSignin' ? 'Invalid email or password.' : result.error);
    } else if (result?.ok) {
      router.push('/dashboard'); // Redirect on success
    } else {
      // Handle cases where result is null or !ok without specific error
      setError('Login failed. Please try again.');
    }
  };

  // --- Handle Sign Up ---
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const target = e.target as typeof e.target & {
      name: { value: string };
      email: { value: string };
      password: { value: string };
    };
    const name = target.name.value;
    const email = target.email.value;
    const password = target.password.value;

    // Client-side validation
    if (!name || !email || !password) {
        setError("Name, email and password are required.");
        return;
    }

    try {
      // Call the registration API route
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Registration successful! Show login form and success message.
        setIsSigningUp(false); // Switch view to login form
        alert('Registration successful! Please log in.'); // Give user feedback
        // No automatic login, user needs to manually log in now.
      } else {
        // Handle API errors (like "User already exists")
        const data = await res.json();
        setError(data.message || 'Something went wrong during sign-up.');
      }
    } catch (err) {
      console.error("Signup fetch error:", err); // Log the error for debugging
      setError('An unexpected error occurred. Please try again.');
    }
  };

  // --- Loading State ---
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-900">
        Loading...
      </div>
    );
  }

  // --- Authenticated State ---
  if (session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-6 text-gray-900">
        <h1 className="text-3xl font-bold">
          Welcome, {session.user?.name || session.user?.email}
        </h1>
        <p>You are signed in.</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })} // Redirect to home on sign out
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // --- Login/Sign Up Forms ---
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