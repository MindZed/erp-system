// src/actions/admin/user.actions.ts

"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
interface UserFormState {
  message: string;
  isSuccess: boolean;
}
interface ClientFormState {
  message: string;
}

interface DeleteActionResult {
  success: boolean;
  message: string;
}

const checkAuth = async () => {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const allowedAuth = [UserRole.ADMIN];

  if (!session || !session.user || !allowedAuth.includes(role)) {
    throw new Error("Not Authorized: Access Denied");
  }
  return session.user;
};

// ====================================================
// 1. CREATE USER (REMAINS THE SAME)
// ====================================================

export async function createUser(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  try {
    checkAuth();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as UserRole;

    if (!email || !password || !name || !role) {
      return { message: "Error: All fields are required.", isSuccess: false };
    }

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof name !== "string"
    ) {
      return { message: "Error: Invalid field format.", isSuccess: false };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email: email.trim(),
        name: name.trim(),
        hashedPassword: hashedPassword,
        role: role,
      },
    });

    return {
      message: `Success: New user '${name.trim()}' created successfully.`,
      isSuccess: true,
    };
  } catch (error) {
    console.error("CREATE_USER_ERROR", error);

    if ((error as Error).message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        message: "Error: A user with this email already exists.",
        isSuccess: false,
      };
    }

    return {
      message: "Failed to create user due to an unexpected error.",
      isSuccess: false,
    };
  }
}

// ====================================================
// 2. UPDATE USER (REMAINS THE SAME)
// ====================================================

export async function updateUser(
  prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  try {
    checkAuth();

    const userId = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as UserRole;

    if (!userId || !email || !name || !role) {
      return { message: "Error: Missing required fields for update." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.trim(),
        role: role,
      },
    });

    // Success! Redirect with query parameters.
    redirect(
      `/dashboard/admin/users?status=success&name=${encodeURIComponent(
        name.trim()
      )}&action=updated`
    );
  } catch (error) {
    console.error("UPDATE_USER_ERROR", error);

    // Check for NEXT_REDIRECT signal and re-throw it.
    if ((error as Error).message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      redirect(
        `/dashboard/admin/users?status=error&message=${encodeURIComponent(
          "User already exists."
        )}`
      );
    }

    redirect(
      `/dashboard/admin/users?status=error&message=${encodeURIComponent(
        "Update failed."
      )}`
    );
  }
}

// ====================================================
// 3. DELETE USER (THE FIX)
// ====================================================

export async function deleteUser(userId: string): Promise<DeleteActionResult> {
  try {
    checkAuth();

    if (!userId) {
      // If no ID, immediately redirect to error state
      redirect(
        `/dashboard/admin/users?status=error&message=${encodeURIComponent(
          "Missing User ID for deletion."
        )}`
      );
    }

    // 1. Fetch user name BEFORE deletion (for the success message)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const userName = user?.name || "User";

    await prisma.user.delete({
      where: { id: userId },
    });

    // 2. SUCCESS: Throw redirect signal on success
    // This is required to pass the success message via URL
    redirect(
      `/dashboard/admin/users?status=success&name=${encodeURIComponent(
        userName
      )}&action=deleted`
    );
  } catch (error) {
    // 3. Check for Next.js redirect error and re-throw it.
    if ((error as Error).message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("DELETE_USER_ERROR", error);
    // 4. FAILURE: Redirect to error state
    redirect(
      `/dashboard/admin/users?status=error&message=${encodeURIComponent(
        "Failed to delete user. Check for active sessions or related records."
      )}`
    );
  }
}
