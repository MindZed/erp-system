// src/app/dashboard/projects/[projectId]/tasks/[taskId]/edit/page.tsx

import prisma from "@/lib/prisma";
// Assuming getTaskFormInitData is in a file like this
import { getTaskFormInitData } from "@/actions/project.actions"; 
import TaskForm from "../../components/TaskForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@prisma/client"; // Import UserRole for filtering

export const metadata = {
  title: "Edit Task | MindZed ERP",
  description: "Edit an existing project task and update its details.",
};

export default async function EditTaskPage({
  params,
}: {
  params: { projectId: string; taskId: string };
}) {
  
  // Use Promise.resolve for safer param handling, as seen in your other files
  const { projectId, taskId } = await Promise.resolve(params);

  let task, filteredAssignees, currentUserId;

  // --- 1. DATA FETCHING & ERROR HANDLING ---
  // All error-prone logic is wrapped in try/catch *before* rendering.
  try {
    // ✅ Fetch task details
    const taskData = await prisma.task.findUnique({
      where: { id: taskId, projectId: projectId }, // Ensure task belongs to project
      select: {
        id: true,
        name: true,
        description: true,
        assignedToId: true,
        startDate: true,
        endDate: true,
        status: true,
        statusReason: true,
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!taskData) {
      // Task not found or doesn't belong to this project
      redirect(`/dashboard/projects/${projectId}`);
    }
    task = taskData; // Assign to outer scope

    // ✅ Get assignable users
    const initData = await getTaskFormInitData();
    currentUserId = initData.currentUserId;

    // ✅ Filter out Admins — only Managers and Employees can appear
    filteredAssignees = initData.assignableUsers.filter(
      (user) => user.role === UserRole.MANAGER || user.role === UserRole.EMPLOYEE
    );

  } catch (error) {
    console.error("EDIT_TASK_PAGE_ERROR", error);
    // Redirect to the main projects list as a general fallback
    redirect(`/dashboard/projects`); 
  }

  // --- 2. PREPARE DATA FOR CLIENT ---
  // Convert Date objects for safe passing to the Client Component
  // We format to YYYY-MM-DD string, which is what <input type="date"> expects
  const initialTask = {
    ...task,
    startDate: task.startDate ? task.startDate.toISOString().split("T")[0] : "",
    endDate: task.endDate ? task.endDate.toISOString().split("T")[0] : "",
  };

  // --- 3. SAFE JSX RENDER ---
  // This only runs if data fetching succeeded and the task was found.
  return (
    // Use standard dashboard page styling
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Edit Task: {task.name}
        </h1>
        <Link 
          // Link back to the specific project's dashboard/task list
          href={`/dashboard/projects/${projectId}`} 
          className="text-blue-600 hover:underline"
        >
            ← Back to Project
        </Link>
      </div>

      <TaskForm
        projectId={projectId}
        projectName={task.project.name}
        assignees={filteredAssignees}
        currentUserId={currentUserId}
        initialTask={initialTask} // Pass the initial task data for editing
      />
    </div>
  );
}