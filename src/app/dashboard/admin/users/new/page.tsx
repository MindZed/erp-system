// src/app/dashboard/admin/users/new/page.tsx
'use client';

import { useActionState } from 'react';
import { createUser } from '@/actions/admin/user.actions'; // Import the Server Action
import Link from 'next/link';
import { UserRole } from '@prisma/client';

const initialState = {
  message: '',
};

export default function NewUserPage() {
  // useActionState handles form submission and returns the last state/error
  const [state, dispatch] = useActionState(createUser, initialState);

  return (
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New System User</h1>
        <Link 
          // Link back to the user listing page (which we build next)
          href="/dashboard/admin/users" 
          className="text-blue-600 hover:underline"
        >
            ← Back to User List
        </Link>
      </div>

      {/* Display error/success message */}
      {state.message && (
        <p className={`mb-4 p-3 rounded ${state.message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {state.message}
        </p>
      )}

      {/* The form calls the dispatch function via the 'action' prop */}
      <form action={dispatch} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
        
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
            {/* Map UserRole enum values to options */}
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