// import prisma from "@/lib/prisma";
// import { getTaskFormInitData } from "@/actions/project.actions";
// import TaskForm from "../components/TaskForm";
// import { redirect } from "next/navigation";

// export const metadata = {
//   title: "Create New Task | MindZed ERP",
//   description: "Add a new task to a project in the ERP system.",
// };

// export default async function NewTaskPage({
//   params,
// }: {
//   params: { projectId: string };
// }) {
//   try {
//     const { projectId } = params;

//     // ✅ Fetch project info (for context)
//     const project = await prisma.project.findUnique({
//       where: { id: projectId },
//       select: { id: true, name: true },
//     });

//     if (!project) redirect("/dashboard/projects");

//     // ✅ Get all assignable users
//     const { assignableUsers, currentUserId } = await getTaskFormInitData();

//     // ✅ Filter out Admins — only Managers and Employees can appear
//     const filteredAssignees = assignableUsers.filter(
//       (user: any) => user.role === "MANAGER" || user.role === "EMPLOYEE"
//     );

//     return (
//       <section className="min-h-screen bg-zBlack text-zText flex justify-center items-start py-12 px-4 sm:px-6">
//         <div className="w-full max-w-3xl bg-zGrey-1/90 backdrop-blur-lg border border-zGrey-2 rounded-2xl shadow-2xl p-8 sm:p-10 transition duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
//           <h1 className="text-3xl font-semibold text-center mb-8 text-white tracking-wide">
//             Create New Task
//           </h1>

//           <TaskForm
//             projectId={project.id}
//             projectName={project.name}
//             assignees={filteredAssignees}
//             currentUserId={currentUserId}
//           />
//         </div>
//       </section>
//     );
//   } catch (error) {
//     console.error("NEW_TASK_PAGE_ERROR", error);
//     redirect("/dashboard/projects");
//   }
// }
// src/app/dashboard/projects/[projectId]/tasks/new/page.tsx

import prisma from "@/lib/prisma";
// We don't have this action, so I'll assume `getTaskFormInitData` is in this file
// or imported from somewhere else. For this example, I'll create a simple
// version of it based on your code's needs.
// import { getTaskFormInitData } from "@/actions/project.actions";
import TaskForm from "../components/TaskForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth"; // Needed to get current user
import { UserRole } from "@prisma/client";
import { getTaskFormInitData } from "@/actions/project.actions";

export const metadata = {
  title: "Create New Task | MindZed ERP",
  description: "Add a new task to a project in the ERP system.",
};

/**
 * Helper function to contain all data-fetching and error-prone logic.
 * This runs entirely on the server *before* the page component renders.
 */
async function getPageData(projectId: string) {
  try {
    // 2. Fetch project info (for context)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    });

    if (!project) {
      return { error: "Project not found" };
    }

    // 3. Get all assignable users
   const { assignableUsers, currentUserId } = await getTaskFormInitData();
    // 4. Filter out Admins — only Managers and Employees can appear
    const filteredAssignees = assignableUsers.filter(
      (user) =>
        user.role === UserRole.MANAGER || user.role === UserRole.EMPLOYEE
    );

    // 5. Return all data successfully
    return {
      project,
      filteredAssignees,
      currentUserId,
      error: null,
    };
  } catch (error) {
    console.error("NEW_TASK_PAGE_ERROR", error);
    return { error: "Failed to load page data" };
  }
}

export default async function NewTaskPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = await Promise.resolve(params);

  // --- DATA FETCHING & ERROR HANDLING ---
  // All error-prone logic is handled here, *before* the return.
  const { project, filteredAssignees, currentUserId, error } =
    await getPageData(projectId);

  // --- ERROR BOUNDARY ---
  // If there was any error, redirect *before* attempting to render JSX.
  if (error || !project || !filteredAssignees || !currentUserId) {
    console.error(`Redirecting due to error: ${error}`);
    redirect("/dashboard/projects"); // Redirect to safety
  }

  // --- JSX RENDER ---
  // This is now clean, safe, and outside any try/catch block.
  // We know `project`, `filteredAssignees`, and `currentUserId` exist.
  return (
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Create New Task for: {project.name}
        </h1>
        <Link
          href="/dashboard/projects"
          className="text-blue-600 hover:underline"
        >
          ← Back to Projects
        </Link>
      </div>

      <TaskForm
        projectId={project.id}
        projectName={project.name}
        assignees={filteredAssignees}
        currentUserId={currentUserId}
      />
    </div>
  );
}
