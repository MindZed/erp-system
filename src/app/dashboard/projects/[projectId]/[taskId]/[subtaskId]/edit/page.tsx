// src/app/dashboard/projects/[projectId]/[taskId]/[subtaskId]/edit/page.tsx

import prisma from "@/lib/prisma";
import SubtaskForm from "../../components/SubtaskForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TaskStatus, UserRole } from "@prisma/client";
import { auth } from "@/auth";

export const metadata = {
  title: "Edit Subtask | MindZed ERP",
  description: "Edit an existing subtask.",
};

export default async function EditSubtaskPage({ params }: any) {
  const resolved = await Promise.resolve(params);
  const { projectId, taskId, subtaskId } = resolved;


  const session = await auth();
  if (!session?.user) redirect("/login");
  const currentUserId = session.user.id;
  const currentUserRole = (session.user as any).role as UserRole;

  // ⭐ Fetch subtask
  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    select: {
      id: true,
      name: true,
      description: true,
      assignedToId: true,
      endDate: true,
      status: true,
      statusReason: true,

      createdById: true,   // ⭐ employee-only check depends on this
      assignedById: true,
      taskId: true,
    },
  });


  if (!subtask) redirect(`/dashboard/projects/${projectId}`);

  // ⭐ Fetch parent task WITH MEMBERS
  const parentTask = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      name: true,
      projectId: true,
      members: {
        select: {
          user: {
            select: { id: true, name: true, role: true },
          },
        },
      },
    },
  });

  if (!parentTask || parentTask.projectId !== projectId) {
    redirect(`/dashboard/projects/${projectId}`);
  }

  const taskName = parentTask.name;

  // ⭐ Valid assignees = ONLY task members
  const filteredAssignees = parentTask.members.map((m) => m.user);

  const initialSubtask = {
    id: subtask.id,
    name: subtask.name,
    description: subtask.description,
    assignedToId: subtask.assignedToId,
    endDate: subtask.endDate ? subtask.endDate.toISOString().split("T")[0] : null,
    status: subtask.status,
    statusReason: subtask.statusReason || null,
    createdById: subtask.createdById,
    assignedById: subtask.assignedById,
  };

  return (
    <div className="p-8 bg-zBlack min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Edit Subtask for:{" "}
          <span className="text-primaryRed">{taskName}</span>
        </h1>

        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-primaryRed hover:underline"
        >
          ← Back to Task
        </Link>
      </div>

      <SubtaskForm
        taskId={taskId}
        projectId={projectId}
        taskName={taskName}
        assignees={filteredAssignees}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        initialSubtask={initialSubtask}
      />
    </div>
  );
}
