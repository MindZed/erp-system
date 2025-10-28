// src/app/dashboard/admin/users/new/page.tsx
'use client';

import { useActionState } from 'react';
import { createUser } from '@/actions/admin/user.actions'; 
import Link from 'next/link';
import { UserRole } from '@prisma/client';
import { useEffect, useRef, useState } from 'react'; // Import necessary hooks


const initialState = {
  message: '',
  isSuccess: false, // Server Action returns this flag
};

// --- CLIENT COMPONENT FOR DISMISSIBLE MESSAGE ---
function SuccessMessage({ message, clearForm }: { message: string, clearForm: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    // After 5 seconds, automatically dismiss the message
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isVisible) {
                handleDismiss();
            }
        }, 5000); 
        return () => clearTimeout(timer);
    }, [isVisible]);

    const handleDismiss = () => {
        setIsVisible(false);
        // We clear the form *only* on success, which the parent handles
    };

    if (!isVisible || !message) return null;
    
    return (
        <div className="mb-6 p-3 rounded-md border border-green-200 bg-green-100 text-green-700 flex justify-between items-center">
            <p className="font-semibold">{message}</p>
            
            {/* The dismiss button (Cross symbol) */}
            <button 
                onClick={handleDismiss} 
                className="ml-4 p-1 rounded-full hover:bg-green-200 transition"
                aria-label="Dismiss notification"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function NewUserPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, dispatch] = useActionState(createUser, initialState);
  
  // Logic to show a popup and clear the form on success
  useEffect(() => {
    if (state.isSuccess) {
      // Clear the form fields immediately on success
      formRef.current?.reset(); 
    }
    // We intentionally ignore state.message here and let the SuccessMessage component handle display
  }, [state.isSuccess]);

  return (
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New System User</h1>
        <Link 
          href="/dashboard/admin/users" 
          className="text-blue-600 hover:underline"
        >
            ← Back to User List
        </Link>
      </div>
      
      {/* 1. Display success message using the new component */}
      {state.isSuccess && state.message && (
        <SuccessMessage message={state.message} clearForm={() => formRef.current?.reset()} />
      )}

      {/* 2. Display error message */}
      {!state.isSuccess && state.message && (
        <p className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {state.message}
        </p>
      )}

      {/* The form uses the ref */}
      <form ref={formRef} action={dispatch} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
        
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Login ID)</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Initial Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
          />
        </div>

        {/* Role Dropdown */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">User Role</label>
          <select
            id="role"
            name="role"
            required
            defaultValue={UserRole.EMPLOYEE}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
          >
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>


        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-150"
        >
          Create User
        </button>
      </form>
    </div>
  );
}