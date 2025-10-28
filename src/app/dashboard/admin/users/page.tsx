// src/app/dashboard/admin/users/page.tsx

import prisma from '@/lib/prisma';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import DeleteUserButton from './components/DeleteUserButton'; 
// FIX: Corrected import path to the shared components folder
import ClientNotificationBar from '../../../components/ClientNotificationBar'; 

// Define expected props including searchParams from the URL
interface UsersListPageProps {
    searchParams: {
        status?: string;
        name?: string;
        message?: string;
        action?: string; 
    };
}

export default async function UsersListPage(props: UsersListPageProps) {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== UserRole.ADMIN) {
    redirect('/dashboard'); 
  }

  // Use Promise.resolve and await to satisfy the strict Next.js compiler check
  const { status, name, message, action } = await Promise.resolve(props.searchParams);
  
  // Fetch all system users directly on the server
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    }
  });

  return (
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management ({users.length})</h1>
        <Link 
          href="/dashboard/admin/users/new" 
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
        >
          + Create New User
        </Link>
      </div>

      {/* Display the notification bar */}
      <ClientNotificationBar status={status} name={name} message={message} action={action} />

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {users.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No system users found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center items-center space-x-2">
                      
                      <Link 
                        href={`/dashboard/admin/users/${user.id}/edit`} 
                        className="text-indigo-600 hover:bg-indigo-50 p-1 border border-indigo-200 rounded-md transition duration-100 text-xs"
                      >
                        Edit
                      </Link>
                      
                      <span className="text-gray-400">|</span>
                      
                      <DeleteUserButton 
                        userId={user.id} 
                        className="p-1 border border-red-200 rounded-md hover:bg-red-50 text-xs"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}