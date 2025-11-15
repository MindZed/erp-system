"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { TaskStatus, UserRole } from "@prisma/client";

interface SubtaskFormState {
  message: string;
}

interface DeleteResult {
  success: boolean;
  message: string;
}

// ====================================================
// UNIVERSAL AUTH FUNCTION
// ====================================================
async function getCurrentUser() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    throw new Error("Not authenticated.");
  }

  return user as { id: string; role: UserRole };
}

// ====================================================
// CREATE SUBTASK
// ====================================================
export async function createSubtask(
  prevState: SubtaskFormState,
  formData: FormData
): Promise<SubtaskFormState> {
  let user;

  try {
    user = await getCurrentUser();
  } catch {
    return { message: "Error: Not authorized to create subtasks." };
  }

  const taskId = formData.get("taskId") as string;
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const assignedToId = formData.get("assignedToId") as string;
  const endDateRaw = formData.get("endDate") as string;

  if (!taskId || !name || !assignedToId) {
    return { message: "Error: Missing required fields." };
  }

  const endDate = endDateRaw ? new Date(endDateRaw) : null;

  try {
    await prisma.subtask.create({
      data: {
        taskId,
        name: name.trim(),
        description: description?.trim() || null,
        endDate,
        status: TaskStatus.PENDING,
        createdById: user.id,
        assignedById: user.id,
        assignedToId,
      },
    });

    return { message: "Success: Subtask created." };
  } catch (err) {
    console.error("CREATE_SUBTASK_ERROR", err);
    return { message: "Error: Could not create subtask." };
  }
}

// ====================================================
// UPDATE SUBTASK
// ====================================================
export async function updateSubtask(
  prevState: SubtaskFormState,
  formData: FormData
): Promise<SubtaskFormState> {
  let user;

  try {
    user = await getCurrentUser();
  } catch {
    return { message: "Error: Not authorized to update subtasks." };
  }

  const subtaskId = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const status = formData.get("status") as TaskStatus;
  const assignedToId = formData.get("assignedToId") as string;

  if (!subtaskId || !name || !status) {
    return { message: "Error: Missing required fields." };
  }

  try {
    const existing = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      select: {
        assignedToId: true,
        assignedById: true,
      },
    });

    if (!existing) {
      return { message: "Error: Subtask not found." };
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isManager = user.role === UserRole.MANAGER;
    const isOwner = existing.assignedToId === user.id;

    if (!isAdmin && !isManager && !isOwner) {
      return { message: "You are not allowed to update this subtask." };
    }

    const updateData: any = {
      status,
      description: description?.trim() || null,
    };

    if (isAdmin || isManager) {
      updateData.name = name.trim();
      updateData.assignedToId = assignedToId;
    }

    await prisma.subtask.update({
      where: { id: subtaskId },
      data: updateData,
    });

    return { message: "Success: Subtask updated." };
  } catch (err) {
    console.error("UPDATE_SUBTASK_ERROR", err);
    return { message: "Error: Could not update subtask." };
  }
}

// ====================================================
// DELETE SUBTASK
// ====================================================
export async function deleteSubtask(subtaskId: string): Promise<DeleteResult> {
  let user;

  try {
    user = await getCurrentUser();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  if (!subtaskId) {
    return { success: false, message: "Invalid subtask ID." };
  }

  try {
    const existing = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      select: {
        assignedToId: true,
        assignedById: true,
      },
    });

    if (!existing) {
      return { success: false, message: "Subtask not found." };
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isManager = user.role === UserRole.MANAGER;
    const isOwner = existing.assignedToId === user.id;
    const isAssigner = existing.assignedById === user.id;

    if (!isAdmin && !isManager && !isOwner && !isAssigner) {
      return { success: false, message: "You do not have permission to delete this subtask." };
    }

    await prisma.subtask.delete({ where: { id: subtaskId } });

    return { success: true, message: "Subtask deleted successfully." };
  } catch (err) {
    console.error("DELETE_SUBTASK_ERROR", err);
    return { success: false, message: "Failed to delete subtask." };
  }
}
