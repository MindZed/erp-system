// src/app/dashboard/projects/[projectId]/[taskId]/page.tsx

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole, TaskStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteTargetButton from "@/app/components/crud/DeleteTargetButton";
import SubtaskForm from "./components/SubtaskForm"; // FIXED
import { AkarIconsEdit, BasilAdd } from "@/app/components/Svgs/svgs";

const formatEnum = (value: string) =>
  value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const taskStatusStyles: Record<string, string> = {
  PENDING: "bg-gray-400 text-gray-700",
  IN_PROGRESS: "bg-blue-400 text-blue-900",
  COMPLETED: "bg-green-400 text-green-900",
  ON_HOLD: "bg-amber-500 text-orange-800",
};

export default async function TaskDetailPage({ params }: any) {
  const { projectId, taskId } = params;

  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = (session.user as any).role as UserRole;
  const userId = session.user.id;

  // Fetch task + subtasks
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      startDate: true,
      endDate: true,
      project: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
      subtasks: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          endDate: true,
          updatedAt: true,
          assignedTo: { select: { id: true, name: true } },
          createdBy: { select: { name: true } },
          assignedBy: { select: { name: true } },
        },
      },
    },
  });

  if (!task) return redirect(`/dashboard/projects/${projectId}`);

  // rbac: manager / admin / assigned user only
  const isManagerOrAdmin = userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;
  const isAssignedToTask = task.assignedTo?.id === userId;

  if (!isManagerOrAdmin && !isAssignedToTask) {
    return (
      <div className="p-6 text-red-500">
        Access Denied
        <Link href={`/dashboard/projects/${projectId}`} className="block text-blue-500 underline">
          ← Back
        </Link>
      </div>
    );
  }

  // fetch users for form
  // fetch users for form (NEEDS ROLE FIELD)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,     // <-- REQUIRED FIX
    },
    orderBy: { name: "asc" },
  });


  return (
    <div className="p-8 bg-zBlack min-h-screen text-white">

      {/* Breadcrumb */}
      <Link href={`/dashboard/projects/${projectId}`} className="text-primaryRed text-sm">
        ← Back to {task.project.name}
      </Link>

      {/* Task header */}
      <div className="bg-zGrey-1 p-6 rounded-lg shadow mt-4">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">{task.name}</h1>
          <span className={`px-3 py-1 text-sm rounded-full ${taskStatusStyles[task.status]}`}>
            {formatEnum(task.status)}
          </span>
        </div>

        <p className="text-zGrey-3 mt-2">{task.description}</p>

        <div className="grid grid-cols-3 mt-4 text-sm text-zGrey-3 border-t border-zGrey-2 pt-4">
          <div><strong>Assigned To:</strong> {task.assignedTo?.name || "Unassigned"}</div>
          <div><strong>Created By:</strong> {task.createdBy?.name}</div>
          <div><strong>Deadline:</strong> {task.endDate?.toLocaleDateString() || "N/A"}</div>
        </div>
      </div>

      {/* Subtask Form */}
      <div className="max-w-xl mx-auto my-6">
        {(userRole === UserRole.MANAGER || userRole === UserRole.EMPLOYEE) && (
          <SubtaskForm
            taskId={taskId}
            projectId={projectId}
            taskName={task.name}
            assignees={users}
            currentUserId={userId}
          />
        )}
      </div>

      {/* Subtask table */}
      <h2 className="text-2xl font-bold mt-10">Subtasks ({task.subtasks.length})</h2>

      <table className="min-w-full bg-zGrey-1 mt-4 rounded-lg overflow-hidden">
        <thead className="bg-zGrey-2 text-xs uppercase text-white">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Assignee</th>
            <th className="p-3">Status</th>
            <th className="p-3">Updated</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {task.subtasks.map((st) => (
            <tr key={st.id} className="border-t border-zGrey-2">
              <td className="p-3">{st.name}</td>
              <td className="p-3">{st.assignedTo?.name}</td>
              <td className="p-3">
                <span className={`px-2 py-1 text-xs rounded-full ${taskStatusStyles[st.status]}`}>
                  {formatEnum(st.status)}
                </span>
              </td>
              <td className="p-3">{new Date(st.updatedAt).toLocaleDateString()}</td>
              <td className="p-3 text-center flex justify-center gap-2">
                <Link
                  href={`/dashboard/projects/${projectId}/${taskId}/${st.id}/edit`}
                  className="p-1 bg-zGrey-3 rounded"
                >
                  <AkarIconsEdit className="h-4" />
                </Link>

                <DeleteTargetButton
                  target="subtask"
                  targetId={st.id}
                  parentId={taskId}
                  className="p-1 bg-zGrey-3 rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
