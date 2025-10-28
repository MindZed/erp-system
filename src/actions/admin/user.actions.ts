// src/actions/admin/user.actions.ts

"use server"; 

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

interface UserFormState {
  message: string;
}

// ====================================================
// 1. CREATE USER (REMAINS THE SAME)
// ====================================================

export async function createUser(prevState: UserFormState, formData: FormData): Promise<UserFormState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as UserRole;

  if (!email || !password || !name || !role) {
    return { message: 'Error: All fields are required.' };
  }
  
  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
    return { message: 'Error: Invalid field format.' };
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email: email.trim(),
        name: name.trim(),
        hashedPassword: hashedPassword,
        role: role,
      },
    });

    // 1. SUCCESS: Throw redirect command (Correct for POST actions)
    redirect('/dashboard/admin/users'); 

  } catch (error) {
    console.error('CREATE_USER_ERROR', error);
    
    if ((error as Error).message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    if (error && typeof error === 'object' && 'code' in error && 'code' in error && error.code === 'P2002') {
        return { message: 'Error: A user with this email already exists.' };
    }
    
    return { message: 'Failed to create user due to an unexpected error.' };
  }
}

// ====================================================
// 2. UPDATE USER (REMAINS THE SAME)
// ====================================================

export async function updateUser(prevState: UserFormState, formData: FormData): Promise<UserFormState> {
  const userId = formData.get('id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as UserRole;

  if (!userId || !email || !name || !role) {
    return { message: 'Error: Missing required fields for update.' };
  }
  
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.trim(),
        role: role,
      },
    });

    return { message: `Success: User ${name} updated successfully.` };

  } catch (error) {
    console.error('UPDATE_USER_ERROR', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return { message: 'Error: A user with this email already exists.' };
    }
    
    return { message: 'Failed to update user due to an unexpected error.' };
  }
}

// ====================================================
// 3. DELETE USER (THE FIX)
// ====================================================

export async function deleteUser(userId: string) {
  if (!userId) {
    return { success: false, message: 'Error: Missing User ID for deletion.' };
  }
  
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    // 2. SUCCESS: Return a simple success flag instead of redirecting
    return { success: true, message: 'User deleted successfully.' };

  } catch (error) {
    console.error('DELETE_USER_ERROR', error);
    // 3. FAILURE: Return error message
    return { success: false, message: 'Failed to delete user. Check for active sessions or related records.' };
  }
}