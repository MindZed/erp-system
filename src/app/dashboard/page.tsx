// src/app/dashboard/page.tsx

import { auth } from "@/auth"; 
import { redirect } from "next/navigation";
// REMOVED: import SignOutButton from "../components/SignOutButton";

export default async function DashboardPage() {
  // 1. Server-side protection
  const session = await auth();
  if (!session) {
    redirect('/login'); 
  }

  // 2. Show dashboard content if logged in
  return (
    <div className="p-8 text-gray-900">
      
      {/* 3. The Header/SignOutButton is now correctly handled by src/app/dashboard/layout.tsx */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        {/* REMOVED: <SignOutButton /> */}
      </div>

      <p className="mt-4">You are logged in as:</p>
      {/* Show the session data */}
      <pre className="p-4 bg-gray-200 rounded-md mt-2 text-gray-900">
        {JSON.stringify(session, null, 2)}
      </pre>

      <p className="mt-8 text-lg font-semibold">
        Go to the Client Management module to start building features.
      </p>
    </div>
  );
}