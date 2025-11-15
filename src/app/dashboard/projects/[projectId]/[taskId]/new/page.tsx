// src/app/dashboard/projects/[projectId]/[taskId]/new/page.tsx

import prisma from "@/lib/prisma";
import { getTaskFormInitData } from "@/actions/project.actions";
import SubtaskForm from "../components/SubtaskForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@prisma/client";

export const metadata = {
  title: "Create New Subtask | MindZed ERP",
  description: "Add a new subtask to a specific task in the ERP system.",
};

export default async function NewSubtaskPage(props: any) {

  const params = await Promise.resolve(props.params);
  const { projectId, taskId } = params;

  let task, filteredAssignees, currentUserId;

  try {
    // 1. Fetch parent task info
    const taskData = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, name: true, projectId: true },
    });

    if (!taskData) redirect(`/dashboard/projects/${projectId}`);
    task = taskData;

    // 2. Fetch assignable users + current user
    const initData = await getTaskFormInitData();
    currentUserId = initData.currentUserId;

    // 3. Filter Manager + Employee only
    filteredAssignees = initData.assignableUsers.filter(
      (user: any) =>
        user.role === UserRole.MANAGER ||
        user.role === UserRole.EMPLOYEE
    );

  } catch (error) {
    console.error("NEW_SUBTASK_PAGE_ERROR", error);
    redirect(`/dashboard/projects`);
  }

  return (
    <div className="p-8 bg-zBlack min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Create New Subtask for:{" "}
          <span className="text-primaryRed">{task.name}</span>
        </h1>

        <Link href={`/dashboard/projects/${task.projectId}`}>
          ← Back to Task
        </Link>

      </div>

      <SubtaskForm
        taskId={task.id}
        projectId={task.projectId}
        taskName={task.name}
        assignees={filteredAssignees}
        currentUserId={currentUserId}
      />
    </div>
  );
}
