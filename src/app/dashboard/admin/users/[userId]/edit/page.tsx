// src/app/dashboard/admin/users/[userId]/edit/page.tsx

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import EditUserForm from '../../components/EditUserForm';  //Go 2 levels up to components

// Define the expected props for this dynamic server component
interface EditUserPageProps {
  params: {
    userId: string;
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  // 1. Server-side protection (Check for Admin role)
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== UserRole.ADMIN) {
    redirect('/dashboard'); 
  }

  // 2. Fetch the specific user's data using the ID from the URL params
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    // Select essential fields for editing
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    }
  });

  // 3. Handle case where user is not found
  if (!user) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-3xl font-bold mb-4">Error: User Not Found</h1>
        <p>The user ID {params.userId} does not exist in the system.</p>
        <Link href="/dashboard/admin/users" className="text-blue-600 hover:underline mt-4 block">
            ← Back to User List
        </Link>
      </div>
    );
  }

  // 4. Pass fetched data to the Client Component form
  return (
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit User: {user.name}</h1>
        <Link href="/dashboard/admin/users" className="text-blue-600 hover:underline">
            ← Back to User List
        </Link>
      </div>
      
      {/* The Edit Form Component */}
      <EditUserForm initialUser={user} />
      
    </div>
  );
}