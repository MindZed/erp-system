// src/app/dashboard/layout.tsx

import { auth } from '@/auth';
import { redirect } from 'next/navigation'; 
import Header from '../components/Header';   
import { UserRole } from '@prisma/client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Server-side Protection (The Bouncer)
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login'); 
  }
  
  // FIX: Provide a guaranteed string fallback ('')
  const userName = session.user.name || session.user.email || ''; 
  const userRole = (session.user as any).role as UserRole;

  // 2. Dashboard Structure
  return (
    <div className="flex min-h-screen text-white">
      
      {/* 4. Main Content Area */}
      <div className="flex flex-col flex-1">
        
        {/* The Header (userName is now guaranteed string) */}
        <Header userName={userName} userRole={userRole} />
        
        {/* The main page content goes here */}
        <main className="flex-1 overflow-y-auto">
          {children} 
        </main>
      </div>
    </div>
  );
}