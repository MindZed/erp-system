// src/actions/admin/user.actions.ts

"use server";

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

interface UserFormState {
  message: string;
  isSuccess: boolean;
}

interface DeleteActionResult {
  success: boolean;
  message: string;
}

// ====================================================
// 1. CREATE USER
// ====================================================

export async function createUser(prevState: UserFormState, formData: FormData): Promise<UserFormState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as UserRole;

  if (!email || !password || !name || !role) {
    return { message: 'Error: All fields are required.', isSuccess: false };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email: email.trim(),
        name: name.trim(),
        hashedPassword,
        role,
      },
    });

    redirect(`/dashboard/admin/users?status=success&name=${encodeURIComponent(name.trim())}&action=created`);
    return { message: 'User created successfully.', isSuccess: true }; // ✅ Stop further execution

  } catch (error: any) {
    console.error('CREATE_USER_ERROR', error);

    if (error.message?.includes('NEXT_REDIRECT')) throw error;
    if (error.code === 'P2002') {
      redirect(`/dashboard/admin/users?status=error&message=${encodeURIComponent('User already exists.')}`);
      return { message: 'Duplicate user email.', isSuccess: false };
    }

    redirect(`/dashboard/admin/users?status=error&message=${encodeURIComponent('Failed to create user.')}`);
    return { message: 'Unexpected error.', isSuccess: false };
  }
}

// ====================================================
// 2. UPDATE USER
// ====================================================

export async function updateUser(prevState: UserFormState, formData: FormData): Promise<UserFormState> {
  const userId = formData.get('id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as UserRole;

  if (!userId || !email || !name || !role) {
    return { message: 'Error: Missing required fields for update.', isSuccess: false };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim(), email: email.trim(), role },
    });

    redirect(`/dashboard/admin/users?status=success&name=${encodeURIComponent(name.trim())}&action=updated`);
    return { message: 'User updated successfully.', isSuccess: true }; // ✅ Stops execution

  } catch (error: any) {
    console.error('UPDATE_USER_ERROR', error);

    if (error.message?.includes('NEXT_REDIRECT')) throw error;
    if (error.code === 'P2002') {
      redirect(`/dashboard/admin/users?status=error&message=${encodeURIComponent('User already exists.')}`);
      return { message: 'Duplicate email.', isSuccess: false };
    }

    redirect(`/dashboard/admin/users?status=error&message=${encodeURIComponent('Update failed.')}`);
    return { message: 'Update failed.', isSuccess: false };
  }
}

// ====================================================
// 3. DELETE USER
// ====================================================

export async function deleteUser(userId: string): Promise<DeleteActionResult> {
  if (!userId) {
    redirect(`/dashboard/admin/users?status=error&message=${encodeURIComponent('Missing User ID for deletion.')}`);
    return { success: false, message: 'Missing User ID.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const userName = user?.name || 'User';

    await prisma.user.delete({ where: { id: userId } });

    redirect(`/dashboard/admin/users?status=success&name=${encodeURIComponent(userName)}&action=deleted`);
    return { success: true, message: 'User deleted successfully.' }; // ✅ Stop further redirects

  } catch (error: any) {
    if (error.message?.includes('NEXT_REDIRECT')) throw error;

    console.error('DELETE_USER_ERROR', error);
    redirect(`/dashboard/admin/users?status=error&message=${encodeURIComponent('Failed to delete user.')}`);
    return { success: false, message: 'Failed to delete user.' };
  }
}
