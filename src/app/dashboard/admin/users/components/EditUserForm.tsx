// src/app/dashboard/admin/users/components/EditUserForm.tsx

"use client";

import { useActionState } from 'react';
import { UserRole } from '@prisma/client';
// Import the update action from the actions file
import { updateUser } from '@/actions/admin/user.actions'; 
import Link from 'next/link';

// Define the shape of the user data passed from the Server Component
interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
}

const initialState = {
  message: '',
};

interface EditUserFormProps {
    initialUser: UserData;
}

export default function EditUserForm({ initialUser }: EditUserFormProps) {
  
  // FIX: Pass the action (updateUser) directly. 
  // useActionState will call it correctly as (prevState, formData).
  const [state, dispatch] = useActionState(updateUser, initialState);
  
  return (
    <form action={dispatch} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
      
      {/* Hidden Field for User ID - Essential for the Server Action to identify the user */}
      <input type="hidden" name="id" value={initialUser.id} />
      
      {/* Display Success/Error Message */}
      {state.message && (
        <p className={`mb-4 p-3 rounded ${state.message.startsWith('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {state.message}
        </p>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={initialUser.name || ''} 
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
          defaultValue={initialUser.email || ''}
          disabled 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-400 bg-gray-50"
        />
        {/* Pass the email value via a hidden field since the visible field is disabled */}
        <input type="hidden" name="email" value={initialUser.email || ''} /> 
      </div>

      {/* Role Dropdown */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">User Role</label>
        <select
          id="role"
          name="role"
          required
          defaultValue={initialUser.role} 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
        >
          {Object.values(UserRole).map((role) => (
            <option key={role} value={role}>
              {role.charAt(0) + role.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      
      <p className="text-sm text-gray-500 pt-2">
        Note: Password reset must be done separately by an Admin.
      </p>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-150"
      >
        Save Changes
      </button>
    </form>
  );
}