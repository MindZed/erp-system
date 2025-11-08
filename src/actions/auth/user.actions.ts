"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/auth"; 

export async function updatePassword(currentPassword: string, newPassword: string) {
  try {
    const session = await auth(); // ✅ get the current session
    if (!session?.user?.email) {
      return { success: false, message: "Unauthorized user." };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    // ✅ handle nullable hashedPassword properly
    const isValid = await bcrypt.compare(currentPassword, user.hashedPassword || "");
    if (!isValid) {
      return { success: false, message: "Current password is incorrect." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email: session.user.email },
      data: { hashedPassword },
    });

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    console.error("UPDATE_PASSWORD_ERROR:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
