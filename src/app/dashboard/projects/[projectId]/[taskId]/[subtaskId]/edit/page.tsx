// src/app/dashboard/projects/[projectId]/[taskId]/[subtaskId]/edit/page.tsx

import prisma from "@/lib/prisma";
import { getTaskFormInitData } from "@/actions/project.actions";
import SubtaskForm from "../../components/SubtaskForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TaskStatus, UserRole } from "@prisma/client";

export const metadata = {
  title: "Edit Subtask | MindZed ERP",
  description: "Edit an existing subtask.",
};

interface SubtaskFetchData {
  id: string;
  name: string;
  description: string | null;
  assignedToId: string;
  startDate: Date | null;
  endDate: Date | null;
  status: TaskStatus;
  createdById: string;
  assignedById?: string | null;
}

export default async function EditSubtaskPage(props: any) {
  const params = await Promise.resolve(props.params);
  const { projectId, taskId, subtaskId } = params;

  let taskName: string,
    filteredAssignees: any[],
    currentUserId: string,
    subtask: SubtaskFetchData | null;

  try {
    const [subtaskData, initData, parentTask] = await Promise.all([
      prisma.subtask.findUnique({
        where: { id: subtaskId },
        select: {
          id: true,
          name: true,
          description: true,
          assignedToId: true,
          startDate: true,
          endDate: true,
          status: true,
          createdById: true,
          assignedById: true,
        },
      }),

      getTaskFormInitData(),

      prisma.task.findUnique({
        where: { id: taskId },
        select: { name: true, projectId: true },
      }),
    ]);

    if (!subtaskData || !parentTask || parentTask.projectId !== projectId) {
      redirect(`/dashboard/projects/${projectId}/${taskId}`);
    }

    subtask = subtaskData;
    taskName = parentTask.name;
    currentUserId = initData.currentUserId;

    filteredAssignees = initData.assignableUsers.filter(
      (user: any) =>
        user.role === UserRole.MANAGER || user.role === UserRole.EMPLOYEE
    );
  } catch (error) {
    console.error("EDIT_SUBTASK_PAGE_ERROR", error);
    redirect(`/dashboard/projects/${projectId}/${taskId}`);
  }

  if (!subtask) redirect(`/dashboard/projects/${projectId}/${taskId}`);

  const initialSubtask = {
    ...subtask,
    startDate: subtask.startDate
      ? subtask.startDate.toISOString().split("T")[0]
      : null,
    endDate: subtask.endDate
      ? subtask.endDate.toISOString().split("T")[0]
      : null,
    statusReason: null,
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
        initialSubtask={initialSubtask}
      />
    </div>
  );
}
