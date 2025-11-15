// src/app/dashboard/projects/[projectId]/new/page.tsx

import prisma from "@/lib/prisma";
import { getTaskFormInitData } from "@/actions/project.actions";
import TaskForm from "../components/TaskForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@prisma/client";

export const metadata = {
  title: "Create New Task | MindZed ERP",
  description: "Add a new task to a project in the ERP system.",
};

export default async function NewTaskPage(props: any) {
  const params = await Promise.resolve(props.params);
  const { projectId } = params;

  let project, filteredAssignees, currentUserId;

  try {
    const projectData = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    });

    if (!projectData) redirect("/dashboard/projects");
    project = projectData;

    const initData = await getTaskFormInitData();
    currentUserId = initData.currentUserId;

    filteredAssignees = initData.assignableUsers.filter(
      (u: any) => u.role === UserRole.MANAGER || u.role === UserRole.EMPLOYEE
    );
  } catch (error) {
    console.error("NEW_TASK_PAGE_ERROR", error);
    redirect(`/dashboard/projects`);
  }

  return (
    <div className="p-8 bg-zBlack min-h-screen text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Create Task – <span className="text-primaryRed">{project.name}</span>
        </h1>

        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-primaryRed hover:underline"
        >
          ← Back
        </Link>
      </div>

      {/* Center the form container */}
      <div className="flex justify-center">
        <div className="bg-zGrey-1 w-full max-w-3xl p-8 rounded-2xl shadow-xl border border-zGrey-2">

          {/* Section title */}
          <h2 className="text-2xl font-bold mb-6 text-primaryRed">
            New Task
          </h2>

          {/* TaskForm (client component) */}
          <TaskForm
            projectId={project.id}
            projectName={project.name}
            assignees={filteredAssignees}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
