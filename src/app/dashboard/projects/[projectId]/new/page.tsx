// src/app/dashboard/projects/[projectId]/new/page.tsx

import prisma from "@/lib/prisma";
import TaskForm from "../components/TaskForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

export const metadata = {
  title: "Create New Task | MindZed ERP",
  description: "Add a new task to a project in the ERP system.",
};

export default async function NewTaskPage(props: any) {
  const params = await Promise.resolve(props.params);
  const { projectId } = params;

  // --------------------------
  // AUTH CHECK
  // --------------------------
  const session = await auth();
  const userRole = (session?.user as any)?.role as UserRole;

  if (
    !session?.user ||
    (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER)
  ) {
    redirect(`/dashboard/projects/${projectId}`);
  }

  // --------------------------
  // FETCH PROJECT
  // --------------------------
  // --- Fetch project to know the assigned manager ---
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, managerId: true },
  });

  if (!project) redirect("/dashboard/projects");

  // --------------------------
  // FETCH ASSIGNABLE USERS (Manager (project.managerId) + Employee)
  // --------------------------
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { role: UserRole.EMPLOYEE },
        { id: project.managerId } // only THIS project’s manager
      ]
    },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  const filteredAssignees = users.map((u) => ({
    id: u.id,
    name: u.name ?? "Unnamed User",
    role: u.role,
  }));

  const currentUserId = session.user.id;

  // --------------------------
  // JSX
  // --------------------------
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

      {/* Centered Form Wrapper */}
      <div className="flex justify-center">
        <div className="bg-zGrey-1 w-full max-w-3xl p-8 rounded-2xl shadow-xl border border-zGrey-2">

          <h2 className="text-2xl font-bold mb-6 text-primaryRed">
            New Task
          </h2>

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
