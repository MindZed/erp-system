// src/app/dashboard/components/Header.tsx

import SignOutButton from "@/app/components/SignOutButton";
import { UserRole } from "@prisma/client";

interface HeaderProps {
  userName: string;
  userRole: UserRole;
}

export default function Header({ userName, userRole }: HeaderProps) {
    const uR = userRole.toLowerCase();
  return (
    <header className="flex justify-between items-center p-4 border-b bg-white shadow-sm sticky top-0 z-10">
      <h2 className="text-xl font-semibold text-indigo-600">MindZed ERP</h2>
      <div className="flex items-center space-x-4">
        <span className="text-sm">
          {userName} ({userRole})
        </span>
          <span className="text-sm capitalize"> ({uR})</span>
        <SignOutButton />
      </div>
    </header>
  );
}
