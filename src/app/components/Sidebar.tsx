// src/app/components/Sidebar.tsx

import Link from 'next/link';
import { UserRole } from '@prisma/client';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', requiredRole: null },
    { name: 'User Management', href: '/dashboard/admin/users', requiredRole: UserRole.ADMIN }, 
    { name: 'Client Management', href: '/dashboard/clients', requiredRole: UserRole.MANAGER }, 
    { name: 'Project Management', href: '/dashboard/projects', requiredRole: UserRole.MANAGER },
];

interface SidebarProps {
    userRole: UserRole;
}

// Function to check if a link should be visible to the user's role
const isLinkVisible = (linkRole: UserRole | null, userRole: UserRole): boolean => {
    if (!linkRole) return true;
    const roleOrder = [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN]; 
    const requiredIndex = roleOrder.indexOf(linkRole);
    const userIndex = roleOrder.indexOf(userRole);
    return userIndex >= requiredIndex;
};

export default function Sidebar({ userRole }: SidebarProps) {
    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col p-4 space-y-4">
            <div className="text-2xl font-extrabold mb-8 text-white">
                MindZed ERP
            </div>
            <nav className="flex flex-col space-y-2">
                {navItems.map((item) => {
                    // RBAC CHECK
                    if (isLinkVisible(item.requiredRole as UserRole, userRole)) {
                        return (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
                            >
                                {item.name}
                            </Link>
                        );
                    }
                    return null;
                })}
            </nav>
        </div>
    );
}