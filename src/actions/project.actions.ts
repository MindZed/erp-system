// src/actions/project.actions.ts

"use server";

import prisma from "@/lib/prisma";
import {
  UserRole,
  ProjectStatus,
  TaskStatus,
  Priority,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

interface ActionState {
  message: string;
}

interface DeleteActionResult {
  success: boolean;
  message: string;
}

interface SubtaskFormState {
  message: string;
}

interface DeleteResult {
  success: boolean;
  message: string;
}

/**
 * Helper to ensure an empty string from FormData is converted to null for nullable database fields.
 * If the value is missing or entirely whitespace, returns null.
 */
const cleanString = (value: FormDataEntryValue | null): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

// ====================================================
// 0. RBAC CHECK
// ====================================================
const checkAuth = async () => {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const allowedRoles = [UserRole.ADMIN, UserRole.MANAGER];

  if (!session || !session.user || !allowedRoles.includes(role)) {
    throw new Error("Not Authorized: Access Denied");
  }

  return { id: session.user.id!, role: role as UserRole };
};

// ====================================================
// 1. PROJECT FORM INIT DATA
// ====================================================
export async function getProjectFormInitData() {
  const { id: currentUserId, role: currentUserRole } = await checkAuth();

  const [clients, managers] = await Promise.all([
    prisma.client.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { OR: [{ role: "ADMIN" }, { role: "MANAGER" }] },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    clients,
    managers,
    currentUser: { id: currentUserId, role: currentUserRole },
  };
}

// ====================================================
// 2. TASK FORM INIT DATA
// ====================================================
export async function getTaskFormInitData() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  // Allow ONLY manager + employee
  const allowedRoles = [UserRole.MANAGER, UserRole.EMPLOYEE];

  if (!session || !session.user || !allowedRoles.includes(role)) {
    throw new Error("Not Authorized: Only Manager or Employee can create subtasks.");
  }

  const currentUserId = session.user.id;

  const assignableUsersRaw = await prisma.user.findMany({
    where: {
      role: {
        in: [UserRole.MANAGER, UserRole.EMPLOYEE],
      },
    },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  const assignableUsers = assignableUsersRaw.map((u) => ({
    id: u.id,
    name: u.name ?? "Unnamed User",
    role: u.role,
  }));

  return { assignableUsers, currentUserId };
}



// ====================================================
// 3. PROJECT CRUD
// ====================================================

export async function createProject(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { id: currentUserId, role: currentUserRole } =
      await getProjectFormInitData().then((data) => data.currentUser);

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const clientId = formData.get("clientId") as string;
    let managerId = formData.get("managerId") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const priority = formData.get("priority") as Priority;

    if (!name || !clientId || !priority) {
      return {
        message: "Error: Project Name, Client, and Priority are required.",
      };
    }

    // --- RBAC Logic ---
    if (currentUserRole === UserRole.MANAGER) managerId = currentUserId;
    if (currentUserRole === UserRole.ADMIN && !managerId)
      managerId = currentUserId;
    if (!managerId)
      return { message: "Error: A Project Manager is required." };

    await prisma.project.create({
      data: {
        name: name.trim(),
        description: cleanString(description),
        clientId,
        managerId,
        createdById: currentUserId,
        startDate: cleanString(startDate) ? new Date(startDate) : null,
        endDate: cleanString(endDate) ? new Date(endDate) : null,
        priority,
        progress: 0,
        status: ProjectStatus.ACTIVE,
        statusReason: null,
      },
    });

    revalidatePath("/dashboard/projects");
    return { message: `Project "${name}" created successfully!` };
  } catch (error: any) {
    console.error("CREATE_PROJECT_ERROR", error);

    if (error.message?.includes("Not Authorized")) {
      return { message: "Error: Not authorized." };
    }

    if (error.code === "P2002") {
      return { message: "Error: Duplicate project name." };
    }

    return { message: "Error: Unexpected error creating project." };
  }
}

export async function updateProject(
  projectId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { id: currentUserId, role: currentUserRole } =
      await getProjectFormInitData().then((data) => data.currentUser);

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const clientId = formData.get("clientId") as string;
    const managerId = formData.get("managerId") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const priority = formData.get("priority") as Priority;
    const status = formData.get("status") as ProjectStatus;
    const statusReason = (formData.get("statusReason") as string) || "";
    const progress = parseInt(formData.get("progress") as string);

    if (!name || !clientId || !managerId || !status || !priority) {
      return { message: "Error: Missing required fields for update." };
    }

    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { managerId: true },
    });

    if (
      currentUserRole === UserRole.MANAGER &&
      managerId !== existingProject?.managerId &&
      managerId !== currentUserId
    ) {
      return { message: "Error: Unauthorized reassignment." };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name.trim(),
        description: cleanString(description),
        clientId,
        managerId,
        startDate: cleanString(startDate) ? new Date(startDate) : null,
        endDate: cleanString(endDate) ? new Date(endDate) : null,
        priority,
        status,
        statusReason: cleanString(statusReason),
        progress: isNaN(progress)
          ? 0
          : Math.max(0, Math.min(100, progress)),
      },
    });

    revalidatePath("/dashboard/projects");
    return { message: `Project "${name}" updated successfully!` };
  } catch (error) {
    console.error("UPDATE_PROJECT_ERROR", error);
    return { message: "Error: Failed to update project." };
  }
}

export async function deleteProject(
  projectId: string
): Promise<DeleteActionResult> {
  try {
    await checkAuth();

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });

    await prisma.project.delete({ where: { id: projectId } });
    revalidatePath("/dashboard/projects");

    return {
      success: true,
      message: `Project "${project?.name}" deleted successfully.`,
    };
  } catch (error) {
    console.error("DELETE_PROJECT_ERROR", error);
    return { success: false, message: "Error deleting project." };
  }
}

// ====================================================
// 4. TASK CRUD
// ====================================================

export async function createTask(
  projectId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { currentUserId } = await getTaskFormInitData();

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const assignedToId = (formData.get("assignedToId") as string) || "";
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    if (!name) {
      return { message: "Error: Task Name is required." };
    }

    await prisma.task.create({
      data: {
        name: name.trim(),
        description: cleanString(description),
        projectId,
        assignedToId: cleanString(assignedToId),
        createdById: currentUserId,
        startDate: cleanString(startDate) ? new Date(startDate) : null,
        endDate: cleanString(endDate) ? new Date(endDate) : null,
        status: TaskStatus.PENDING,
        statusReason: null,
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { message: `Task "${name}" created successfully!` };
  } catch (error) {
    console.error("CREATE_TASK_ERROR", error);
    return { message: "Error creating task." };
  }
}

export async function updateTask(
  taskId: string,
  projectId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await checkAuth();

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const assignedToId = (formData.get("assignedToId") as string) || "";
    const status = formData.get("status") as TaskStatus;
    const statusReason = (formData.get("statusReason") as string) || "";
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    if (!name || !status) {
      return { message: "Error: Missing required fields." };
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        name: name.trim(),
        description: cleanString(description),
        assignedToId: cleanString(assignedToId),
        startDate: cleanString(startDate) ? new Date(startDate) : null,
        endDate: cleanString(endDate) ? new Date(endDate) : null,
        status,
        statusReason: cleanString(statusReason),
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { message: `Task "${name}" updated successfully!` };
  } catch (error) {
    console.error("UPDATE_TASK_ERROR", error);
    return { message: "Error updating task." };
  }
}

export async function deleteTask(
  taskId: string,
  projectId: string
): Promise<DeleteActionResult> {
  try {
    await checkAuth();

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { name: true },
    });

    await prisma.task.delete({ where: { id: taskId } });
    revalidatePath(`/dashboard/projects/${projectId}`);

    return {
      success: true,
      message: `Task "${task?.name}" deleted successfully.`,
    };
  } catch (error) {
    console.error("DELETE_TASK_ERROR", error);
    return { success: false, message: "Error deleting task." };
  }
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
  const descriptionRaw = formData.get("description");
  const assignedToIdRaw = formData.get("assignedToId"); // Required field
  const endDateRaw = formData.get("endDate");
  const assignedByIdRaw = formData.get("assignedById"); // Optional field

  // Process fields
  const assignedToId = cleanString(assignedToIdRaw);
  const description = cleanString(descriptionRaw);
  const assignedById = cleanString(assignedByIdRaw);
  const endDate = cleanString(endDateRaw) ? new Date(cleanString(endDateRaw)!) : null;


  if (!taskId || !name || !assignedToId) {
    return { message: "Error: Missing required fields (Task ID, Name, Assigned To)." };
  }

  try {
    await prisma.subtask.create({
      data: {
        taskId,
        name: name.trim(),
        description,
        endDate,
        status: TaskStatus.PENDING,
        createdById: user.id,
        assignedToId,
        assignedById,
      },
    });

    // Revalidate the parent project page
    const parentTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });
    if (parentTask) {
      revalidatePath(`/dashboard/projects/${parentTask.projectId}`);
    } else {
      revalidatePath("/dashboard/projects");
    }

    return { message: "Success: Subtask created." };
  } catch (err) {
    console.error("CREATE_SUBTASK_ERROR", err);
    return { message: "Error: Could not create subtask." };
  }
}
// ====================================================
// UPDATE SUBTASK (FULL VERSION)
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
  const taskId = formData.get("taskId") as string;
  const projectId = formData.get("projectId") as string;

  const name = formData.get("name") as string;
  const status = formData.get("status") as TaskStatus;

  // Raw fields
  const descriptionRaw = formData.get("description");
  const assignedToIdRaw = formData.get("assignedToId");
  const statusReasonRaw = formData.get("statusReason");
  const endDateRaw = formData.get("endDate");
  const assignedByIdRaw = formData.get("assignedById");

  // Clean fields
  const description = cleanString(descriptionRaw);
  const assignedToId = cleanString(assignedToIdRaw);
  const statusReason = cleanString(statusReasonRaw);
  const assignedById = cleanString(assignedByIdRaw);
  const endDate = cleanString(endDateRaw)
    ? new Date(cleanString(endDateRaw)!)
    : null;

  if (!subtaskId || !name || !status || !assignedToId) {
    return { message: "Error: Missing required fields." };
  }

  try {
    const existing = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      select: {
        assignedToId: true,
        createdById: true,
        taskId: true,
      },
    });

    if (!existing) {
      return { message: "Error: Subtask not found." };
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isManager = user.role === UserRole.MANAGER;
    const isEmployee = user.role === UserRole.EMPLOYEE;
    const isCreator = existing.createdById === user.id;

    // 🔥 **RBAC RULES**
    // Admin + Manager -> Full Access
    // Employee -> Can ONLY edit their own subtasks
    if (isEmployee && !isCreator) {
      return { message: "Error: You can edit only subtasks you created." };
    }

    const updateData: any = {
      status,
      description,
      endDate,
      statusReason: statusReason ?? null,
    };

    // Admin/Manager/Creator can edit name + assignedTo
    if (isAdmin || isManager || isCreator) {
      updateData.name = name.trim();
      updateData.assignedToId = assignedToId;
    }

    // Only Admin/Manager can change assignedBy
    if (isAdmin || isManager) {
      updateData.assignedById = assignedById;
    }

    await prisma.subtask.update({
      where: { id: subtaskId },
      data: updateData,
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { message: "Success: Subtask updated." };
  } catch (err) {
    console.error("UPDATE_SUBTASK_ERROR", err);
    return { message: "Error: Could not update subtask." };
  }
}


// ====================================================
// DELETE SUBTASK (FULL VERSION)
// ====================================================
export async function deleteSubtask(subtaskId: string): Promise<DeleteResult> {
  let user;

  try {
    user = await getCurrentUser();
  } catch {
    return { success: false, message: "Error: Not authorized." };
  }

  if (!subtaskId) {
    return { success: false, message: "Error: Invalid subtask ID." };
  }

  try {
    const existing = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      select: {
        createdById: true,
        taskId: true,
        name: true,
      },
    });

    if (!existing) {
      return { success: false, message: "Error: Subtask not found." };
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isManager = user.role === UserRole.MANAGER;
    const isCreator = existing.createdById === user.id;

    // 🚫 Employee can only delete THEIR OWN subtasks
    if (!isAdmin && !isManager && !isCreator) {
      return {
        success: false,
        message: "Error: You can delete only subtasks you created.",
      };
    }

    await prisma.subtask.delete({ where: { id: subtaskId } });

    const parentTask = await prisma.task.findUnique({
      where: { id: existing.taskId },
      select: { projectId: true },
    });

    if (parentTask) revalidatePath(`/dashboard/projects/${parentTask.projectId}`);

    return {
      success: true,
      message: `Subtask "${existing.name}" deleted successfully.`,
    };
  } catch (err) {
    console.error("DELETE_SUBTASK_ERROR", err);
    return { success: false, message: "Error: Failed to delete subtask." };
  }
}
