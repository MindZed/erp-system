// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '../components/AuthForm'; // Import the reusable form

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // --- Handle Sign Up (Logic moved here) ---
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
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Registration successful! Redirect user back to the sign-in page.
        alert(`Registration successful for ${name}! Please log in.`); 
        router.push('/'); // Redirect to the homepage (Sign In page)
      } else {
        // Handle API errors (e.g., "User already exists")
        const data = await res.json();
        setError(data.message || 'Something went wrong during sign-up.');
      }
    } catch (err) {
      console.error("Signup fetch error:", err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        
        {/* Pass the Sign Up flag and the handler */}
        <AuthForm isSignUp onSubmit={handleSignUp} />

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <p className="text-center text-sm text-gray-600">
          Already have an account?
          <Link
            href="/login" // Link back to the login page
            className="ml-1 font-medium text-blue-600 hover:text-blue-500"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}