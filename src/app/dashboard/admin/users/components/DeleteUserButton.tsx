// src/app/dashboard/admin/users/components/DeleteUserButton.tsx

"use client";

import { deleteUser } from '@/actions/admin/user.actions'; 
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

interface DeleteUserButtonProps {
    userId: string;
    className?: string; 
}

export default function DeleteUserButton({ userId, className }: DeleteUserButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter(); // Initialize router

    const deleteUserAction = deleteUser.bind(null, userId);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
            return;
        }
        
        setIsDeleting(true);
        const result = await deleteUserAction();

        if (result && result.success) {
            // FIX: If deletion was successful, refresh the page to show the updated list
            router.refresh(); 
        } else if (result && result.message) {
            // Display error if deletion failed due to database constraint
            alert(result.message);
        }
        setIsDeleting(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
    );
}