// src/app/dashboard/clients/new/page.tsx

"use client";

import { useActionState } from 'react';
import { createClient } from '@/actions/client.actions'; 
import Link from 'next/link';

const initialState = {
  message: '',
};

export default function NewClientPage() {
  const [state, dispatch] = useActionState(createClient, initialState);

  return (
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Client</h1>
        <Link 
          href="/dashboard/clients" 
          className="text-blue-600 hover:underline"
        >
            ← Back to List
        </Link>
      </div>

      {state.message && (
        <p className={`mb-4 p-3 rounded ${state.message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {state.message}
        </p>
      )}

      <form action={dispatch} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
        
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Client Name (Company)</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
          />
        </div>

        {/* Contact Email Field */}
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-150"
        >
          Create Client
        </button>
      </form>
    </div>
  );
}