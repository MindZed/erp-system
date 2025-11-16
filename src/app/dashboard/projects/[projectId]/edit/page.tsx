// src/app/dashboard/projects/[projectId]/edit/page.tsx

import prisma from "@/lib/prisma";
import Link from "next/link";
import { getProjectFormInitData } from "@/actions/project.actions";
import { redirect } from "next/navigation";
import ProjectForm from "../../components/ProjectForm"; // Reverting name to ProjectForm from ClientWrapper

// FIX: Removed external interface EditProjectPageProps. Using 'props: any' for build compatibility.

export const metadata = {
  title: "Edit Project | MindZed ERP",
  description: "Edit existing project details, timeline, and assignments.",
};

export default async function EditProjectPage(props: any) {

  // FIX: Explicitly use Promise.resolve and await on params to satisfy the async compiler check.
  const { projectId } = await Promise.resolve(props.params);

  let project, clients, managers, currentUser;

  // --- 1. DATA FETCHING & ERROR HANDLING ---
  try {
    const [projectData, initData] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          name: true,
          description: true,
          clientId: true,
          managerId: true,
          startDate: true,
          endDate: true,
          status: true,
          statusReason: true,
          priority: true,
          progress: true,
        },
      }),
      getProjectFormInitData(),
    ]);

    // Assign data to variables
    project = projectData;
    clients = initData.clients;
    managers = initData.managers;
    currentUser = initData.currentUser;

  } catch (error) {
    console.error("EDIT_PROJECT_PAGE_ERROR", error);
    redirect("/dashboard/projects"); // Redirect on any fetching error
  }

  // --- 2. "NOT FOUND" HANDLING ---
  if (!project) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-3xl font-bold mb-4">Error: Project Not Found</h1>
        <p className="mb-6">
          The project ID <span className="font-mono bg-red-100 p-1 rounded">{projectId}</span> does
          not exist in the system.
        </p>
        <Link
          href="/dashboard/projects"
          className="text-blue-600 hover:underline mt-4 block"
        >
          ← Back to Project List
        </Link>
      </div>
    );
  }

  // --- 3. PREPARE DATA FOR CLIENT ---
  // Convert Date objects for safe passing to the Client Component
  const initialProject = {
    ...project,
    // Safely converting Date objects to ISO strings for input fields
    startDate: project.startDate ? project.startDate.toISOString() : null,
    endDate: project.endDate ? project.endDate.toISOString() : null,
  };

  // --- 4. SAFE JSX RENDER ---
  return (
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Edit Project: {project.name}
        </h1>
        <Link
          href="/dashboard/projects"
          className="text-blue-600 hover:underline"
        >
          ← Back to Project List
        </Link>
      </div>

      <ProjectForm
        initialProject={initialProject}
        clients={clients}
        managers={managers}
        currentUser={currentUser}
      />
    </div>
  );
}