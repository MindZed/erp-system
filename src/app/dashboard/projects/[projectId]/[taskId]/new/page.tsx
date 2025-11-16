// src/app/dashboard/projects/[projectId]/[taskId]/new/page.tsx

import prisma from "@/lib/prisma";
import SubtaskForm from "../components/SubtaskForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";

export const metadata = {
  title: "Create New Subtask | MindZed ERP",
  description: "Add a new subtask to a specific task.",
};

export default async function NewSubtaskPage(props: any) {
  const { projectId, taskId } = await Promise.resolve(props.params);

  const session = await auth();
  if (!session?.user) redirect("/login");

  const currentUserId = session.user.id;
  const currentUserRole = (session.user as any).role as UserRole;

  // ⭐ Fetch parent task WITH members
  const parentTask = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      name: true,
      projectId: true,
      members: {
        select: {
          user: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });

  if (!parentTask || parentTask.projectId !== projectId) {
    redirect(`/dashboard/projects/${projectId}`);
  }

  // ⭐ Valid assignees = ONLY task members
  const filteredAssignees = parentTask.members.map((m) => m.user);

  return (
    <div className="p-8 bg-zBlack min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Create New Subtask for:{" "}
          <span className="text-primaryRed">{parentTask.name}</span>
        </h1>

        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-primaryRed hover:underline"
        >
          ← Back to Task
        </Link>
      </div>

      <SubtaskForm
        taskId={parentTask.id}
        projectId={projectId}
        taskName={parentTask.name}
        assignees={filteredAssignees}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
