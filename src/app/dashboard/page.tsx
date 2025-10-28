// src/app/dashboard/page.tsx

import { auth } from "@/auth"; // Import auth from the correct path
import { redirect } from "next/navigation";
import SignOutButton from "../components/SignOutButton";

export default async function DashboardPage() {
  // 1. Get session on the server
  const session = await auth();

  // 2. Protect the page
  if (!session) {
    redirect("/"); // Redirect to homepage (where login is) if not logged in
  }

  // 3. Show dashboard content if logged in
  return (
    <div className="p-8 text-gray-900"> {/* Added text color */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
        <SignOutButton /> {/* Add logout button */}
      </div>
      <p className="mt-4">You are logged in as:</p>
      <pre className="p-4 bg-gray-200 rounded-md mt-2 text-gray-900">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}