// src/app/dashboard/projects/[projectId]/new/page.tsx

import prisma from "@/lib/prisma";
import { getTaskFormInitData } from "@/actions/project.actions"; 
// Assuming TaskForm path is correct relative to the original file path
import TaskForm from "../components/TaskForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@prisma/client";

export const metadata = {
  title: "Create New Task | MindZed ERP",
  description: "Add a new task to a project in the ERP system.",
};

// FIX: Removed explicit type annotation from the function signature and used 'props: any'
export default async function NewTaskPage(props: any) {
  
  // FIX: Explicitly resolve props.params using Promise.resolve
  const params = await Promise.resolve(props.params);
  const { projectId } = params;


  let project, filteredAssignees, currentUserId;

  // --- 1. DATA FETCHING & ERROR HANDLING ---
  try {
    // ✅ Fetch project info (for context)
    const projectData = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    });

    if (!projectData) {
      redirect("/dashboard/projects");
    }
    project = projectData;

    // ✅ Get all assignable users and current user ID (RBAC check happens inside this action)
    const initData = await getTaskFormInitData();
    currentUserId = initData.currentUserId;

    // ✅ Filter out Admins — only Managers and Employees can appear
    filteredAssignees = initData.assignableUsers.filter(
      (user: any) => user.role === UserRole.MANAGER || user.role === UserRole.EMPLOYEE
    );

  } catch (error) {
    console.error("NEW_TASK_PAGE_ERROR", error);
    // Redirect to the main projects list as a general fallback
    redirect(`/dashboard/projects`); 
  }


  // --- 3. SAFE JSX RENDER ---
  // This only runs if data fetching succeeded and the project was found.
  return (
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Create New Task for: {project.name}
        </h1>
        <Link 
          href={`/dashboard/projects/${projectId}`} 
          className="text-blue-600 hover:underline"
        >
          ← Back to Project
        </Link>
      </div>

      <TaskForm
        projectId={project.id}
        projectName={project.name}
        // NOTE: The TaskForm component expects a prop named 'assignableUsers' or similar, 
        // but based on your provided file, I'm adapting the prop names used in the wrapper.
        // Assuming your TaskForm component structure uses 'assignees' and 'currentUserId'
        assignees={filteredAssignees}
        currentUserId={currentUserId}
      />
    </div>
  );
}