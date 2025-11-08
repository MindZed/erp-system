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
  const { id: currentUserId } = await checkAuth();

  const assignableUsersRaw = await prisma.user.findMany({
    where: {
      OR: [{ role: UserRole.MANAGER }, { role: UserRole.EMPLOYEE }],
    },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  // ✅ Normalize null names to empty or placeholder
  const assignableUsers = assignableUsersRaw.map((user) => ({
    id: user.id,
    name: user.name ?? "Unnamed User",
    role: user.role,
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
        description: description.trim() || null,
        clientId,
        managerId,
        createdById: currentUserId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
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
        description: description.trim() || null,
        clientId,
        managerId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority,
        status,
        statusReason: statusReason.trim() || null,
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
    const assignedToId = formData.get("assignedToId") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    if (!name) {
      return { message: "Error: Task Name is required." };
    }

    await prisma.task.create({
      data: {
        name: name.trim(),
        description: description.trim() || null,
        projectId,
        assignedToId: assignedToId || null,
        createdById: currentUserId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
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
    const assignedToId = formData.get("assignedToId") as string;
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
        description: description.trim() || null,
        assignedToId: assignedToId || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
        statusReason: statusReason.trim() || null,
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
