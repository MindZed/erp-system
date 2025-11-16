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
// 4. TASK CRUD (Admins + Managers only)
// ====================================================

export async function createTask(
  projectId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // 🔥 ADMIN + MANAGER ONLY
    const session = await auth();
    const role = (session?.user as any)?.role as UserRole;

    if (!session?.user || (role !== UserRole.ADMIN && role !== UserRole.MANAGER)) {
      return { message: "Error: Only Admin or Manager can create tasks." };
    }

    const currentUserId = session.user.id;

    const name = formData.get("name") as string;
    const description = cleanString(formData.get("description"));
    const startDate = cleanString(formData.get("startDate"));
    const endDate = cleanString(formData.get("endDate"));

    // ⭐ Multi-user assignment
    const assignedUserIds = formData.getAll("assignedUserIds") as string[];

    if (!name) {
      return { message: "Error: Task Name is required." };
    }

    // STEP 1: create task
    const task = await prisma.task.create({
      data: {
        name: name.trim(),
        description,
        projectId,
        createdById: currentUserId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: TaskStatus.PENDING,
        statusReason: null,
      },
    });

    // STEP 2: create task members
    if (assignedUserIds.length > 0) {
      await prisma.taskMember.createMany({
        data: assignedUserIds.map((uid) => ({
          taskId: task.id,
          userId: uid,
        })),
        skipDuplicates: true,
      });
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { message: `Task "${name}" created successfully!` };

  } catch (error) {
    console.error("CREATE_TASK_ERROR", error);
    return { message: "Error creating task." };
  }
}


// ====================================================
// UPDATE TASK (Admins + Managers only)
// ====================================================

export async function updateTask(
  taskId: string,
  projectId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // 🔥 ADMIN + MANAGER ONLY
    const session = await auth();
    const role = (session?.user as any)?.role as UserRole;

    if (!session?.user || (role !== UserRole.ADMIN && role !== UserRole.MANAGER)) {
      return { message: "Error: Only Admin or Manager can update tasks." };
    }

    const name = formData.get("name") as string;
    const description = cleanString(formData.get("description"));
    const status = formData.get("status") as TaskStatus;
    const statusReason = cleanString(formData.get("statusReason"));
    const startDate = cleanString(formData.get("startDate"));
    const endDate = cleanString(formData.get("endDate"));

    // ⭐ Multi-user assignment
    const assignedUserIds = formData.getAll("assignedUserIds") as string[];

    if (!name || !status) {
      return { message: "Error: Missing required fields." };
    }

    // STEP 1: update base task fields
    await prisma.task.update({
      where: { id: taskId },
      data: {
        name: name.trim(),
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
        statusReason,
      },
    });

    // STEP 2: reset task members
    await prisma.taskMember.deleteMany({
      where: { taskId },
    });

    // STEP 3: create new task members
    if (assignedUserIds.length > 0) {
      await prisma.taskMember.createMany({
        data: assignedUserIds.map((uid) => ({
          taskId,
          userId: uid,
        })),
        skipDuplicates: true,
      });
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { message: `Task "${name}" updated successfully!` };

  } catch (error) {
    console.error("UPDATE_TASK_ERROR", error);
    return { message: "Error updating task." };
  }
}


// ====================================================
// DELETE TASK (Admins + Managers only)
// ====================================================

export async function deleteTask(
  taskId: string,
  projectId: string
): Promise<DeleteActionResult> {
  try {
    // 🔥 ADMIN + MANAGER ONLY
    const session = await auth();
    const role = (session?.user as any)?.role as UserRole;

    if (!session?.user || (role !== UserRole.ADMIN && role !== UserRole.MANAGER)) {
      return { success: false, message: "Error: Only Admin or Manager can delete tasks." };
    }

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
  const assignedToId = cleanString(formData.get("assignedToId"));
  const description = cleanString(formData.get("description"));
  const endDateRaw = formData.get("endDate");
  const endDate = cleanString(endDateRaw) ? new Date(cleanString(endDateRaw)!) : null;

  if (!taskId || !name || !assignedToId) {
    return { message: "Error: Missing required fields." };
  }

  // ⭐ Fetch parent task members
  const parentTask = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true, members: { select: { userId: true } } },
  });

  if (!parentTask) return { message: "Error: Parent task not found." };

  const isMember = parentTask.members.some((m) => m.userId === assignedToId);

  // EMPLOYEE rule
  if (user.role === UserRole.EMPLOYEE && assignedToId !== user.id) {
    return { message: "Error: Employees can only assign subtasks to themselves." };
  }

  // MANAGER rule
  if (user.role === UserRole.MANAGER && !isMember) {
    return { message: "Error: Selected user is not a member of this task." };
  }

  await prisma.subtask.create({
    data: {
      taskId,
      name: name.trim(),
      description,
      endDate,
      status: TaskStatus.PENDING,
      createdById: user.id,
      assignedToId,
      assignedById: user.id,
    },
  });

  revalidatePath(`/dashboard/projects/${parentTask.projectId}`);
  return { message: "Success: Subtask created." };
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
  const assignedToId = cleanString(formData.get("assignedToId"));
  const description = cleanString(formData.get("description"));
  const statusReason = cleanString(formData.get("statusReason"));
  const endDateRaw = formData.get("endDate");
  const endDate = cleanString(endDateRaw) ? new Date(cleanString(endDateRaw)!) : null;

  if (!subtaskId || !name || !status || !assignedToId) {
    return { message: "Error: Missing required fields." };
  }

  const existing = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    select: {
      createdById: true,
      assignedToId: true,
      taskId: true,
    },
  });

  if (!existing) return { message: "Error: Subtask not found." };

  // ⭐ Fetch members of parent task
  const parentTask = await prisma.task.findUnique({
    where: { id: taskId },
    select: { members: { select: { userId: true } } },
  });

  const isMember = parentTask?.members.some((m) => m.userId === assignedToId);

  const isAdmin = user.role === UserRole.ADMIN;
  const isManager = user.role === UserRole.MANAGER;
  const isEmployee = user.role === UserRole.EMPLOYEE;

  const isCreator = existing.createdById === user.id;
  const isAssignee = existing.assignedToId === user.id;

  // ⭐ EMPLOYEE RULE
  if (isEmployee && !(isCreator || isAssignee)) {
    return { message: "Error: Employees can edit only their own subtasks." };
  }

  // ⭐ MANAGER RULE — assignedTo must be task member
  if (isManager && !isMember) {
    return { message: "Error: Selected user is not a member of this task." };
  }

  // ⭐ Build update payload
  const updateData: any = {
    status,
    description,
    endDate,
    statusReason,
  };

  if (isAdmin || isManager || isCreator) {
    updateData.name = name.trim();
    updateData.assignedToId = assignedToId;
    updateData.assignedById = user.id;
  }

  await prisma.subtask.update({ where: { id: subtaskId }, data: updateData });

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { message: "Success: Subtask updated." };
}



// ====================================================
// DELETE SUBTASK (FIXED VERSION WITH FULL RBAC)
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
        assignedToId: true,
        taskId: true,
        name: true,
      },
    });

    if (!existing) {
      return { success: false, message: "Error: Subtask not found." };
    }

    // role checks
    const isAdmin = user.role === UserRole.ADMIN;
    const isManager = user.role === UserRole.MANAGER;
    const isCreator = existing.createdById === user.id;
    const isAssignedToUser = existing.assignedToId === user.id;

    // ⭐ FINAL RBAC POLICY:
    //  - Admin: can delete any
    //  - Manager: can delete any subtask under their task
    //  - Employee: can delete only if creator OR assigned user
    if (!isAdmin && !isManager && !(isCreator || isAssignedToUser)) {
      return {
        success: false,
        message: "Error: You can delete a subtask only if you created it or it is assigned to you.",
      };
    }

    await prisma.subtask.delete({ where: { id: subtaskId } });

    // revalidate parent project
    const parentTask = await prisma.task.findUnique({
      where: { id: existing.taskId },
      select: { projectId: true },
    });

    if (parentTask) {
      revalidatePath(`/dashboard/projects/${parentTask.projectId}`);
    }

    return {
      success: true,
      message: `Subtask "${existing.name}" deleted successfully.`,
    };
  } catch (err) {
    console.error("DELETE_SUBTASK_ERROR", err);
    return { success: false, message: "Error: Failed to delete subtask." };
  }
}
